/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountId, EraIndex } from "@polkadot/types/interfaces";
import { Option } from "@polkadot/types";
import { DerivedDappsStakingQuery } from "../../Api/derive/types";

import BN from "bn.js";
import React, { useEffect, useState } from "react";
import { Table, AddressMini, AddressSmall, Button } from "@polkadot/react-components";
import { useToggle, useApi, useCall } from "@polkadot/react-hooks";

import Nominate from "../Actions/Account/Nominate";

interface Props {
  authorsMap: Record<string, string>;
  hasQueries: boolean;
  isIntentions: boolean;
  isVisible: boolean;
  lastAuthors?: string[];
  allContracts: string[];
  electedContracts: string[];
}

interface ContractProps {
  address: AccountId | string;
  onClick: any;
  updateTotal: any;
}

interface StakingState {
  contractId: string;
  operatorId: string;
  totalStaked: BN;
}

function sortedContracts(allContracts: string[], totals: Map<string, BN>): string[] {
  return allContracts.sort((a, b): number => {
    const aVal = totals.get(a) ?? new BN(0);
    const bVal = totals.get(b) ?? new BN(0);
    return aVal.gt(bVal) ? -1 : 1;
  });
}

function Contract({ address, onClick, updateTotal }: ContractProps): React.ReactElement {
  const { api } = useApi();
  const currentEra = useCall<Option<EraIndex>>(api.query.plasmRewards.currentEra, [])?.unwrap()?.toNumber() ?? 0;
  const stakingInfo = useCall<DerivedDappsStakingQuery>((api.derive as any).plasmStaking.query, [currentEra, address]);
  const [{ contractId, operatorId, totalStaked }, setStakingState] = useState<StakingState>({
    contractId: address.toString(),
    operatorId: "",
    totalStaked: new BN(0),
  });

  updateTotal(contractId, totalStaked);

  useEffect((): void => {
    if (stakingInfo) {
      const { operatorId, stakingPoints, contractId } = stakingInfo;
      setStakingState({
        operatorId: operatorId?.toString() ?? "",
        contractId: contractId?.toString() ?? "",
        totalStaked: stakingPoints?.total ?? new BN(0),
      });
    }
  }, [stakingInfo]);

  return (
    <tr key={contractId}>
      <td>
        <AddressSmall value={contractId} />
      </td>
      <td className="top ">
        <AddressMini className="mini-nopad" label={"operator"} value={operatorId} />
      </td>
      <td>
        <label>{"total stake"}</label>
        {totalStaked.toString()}
      </td>
      <td>
        <Button isPrimary key="nominate" onClick={onClick(contractId)} label={"Nominate"} icon="hand paper outline" />
      </td>
    </tr>
  );
}

function ContractList({ isIntentions, isVisible, allContracts }: Props): React.ReactElement<Props> | null {
  const [contracts, setContracts] = useState<string[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>();
  const [totals, setTotals] = useState<Map<string, BN>>(new Map());
  const [isNominateOpen, toggleNominate] = useToggle();

  useEffect((): void => {
    if (isVisible && allContracts && totals) {
      const contracts = sortedContracts(allContracts, totals);

      setContracts(contracts);
    }
  }, [allContracts, totals, isVisible]);

  const _updateTotal = (contract: string, totalStaked: BN): void => {
    const total = totals.get(contract);
    if (!total || !total.eq(totalStaked)) {
      setTotals(new Map(totals.set(contract, totalStaked)));
    }
  };

  const _renderRows = (contracts: string[]): React.ReactNode =>
    contracts.map(
      (contract): React.ReactNode => {
        return (
          <Contract
            key={contract}
            address={contract}
            onClick={(contract: string): (() => void) => {
              return (): void => {
                toggleNominate();
                setSelectedContract(contract);
              };
            }}
            updateTotal={_updateTotal}
          />
        );
      }
    );

  return (
    <div className={`${!isVisible && "staking--hidden"}`}>
      <Table className={isIntentions ? "staking--hidden" : ""}>
        <Table.Body>{_renderRows(contracts)}</Table.Body>
      </Table>
      {isNominateOpen && <Nominate onClose={toggleNominate} allContracts={allContracts} contract={selectedContract} />}
    </div>
  );
}

export default ContractList;
