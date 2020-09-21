/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountId, EraIndex } from "@polkadot/types/interfaces";
import { Option, u32 } from "@polkadot/types";
import { DerivedDappsStakingQuery } from "../../Api/derive/types";

import BN from "bn.js";
import React, { useEffect, useState } from "react";
import { Table, AddressMini, AddressSmall, Button } from "@polkadot/react-components";
import { useToggle, useApi, useCall } from "@polkadot/react-hooks";
import { FormatBalance } from "@polkadot/react-query";

import Nominate from "../Actions/Account/Nominate";
import Vote from "../Actions/Account/Vote";

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
  onClickNominate: any;
  onClickVote: any;
  updateTotal: any;
}

interface StakingState {
  contractId: string;
  operatorId: string;
}

function sortedContracts(allContracts: string[], totals: Map<string, BN>): string[] {
  return allContracts.sort((a, b): number => {
    const aVal = totals.get(a) ?? new BN(0);
    const bVal = totals.get(b) ?? new BN(0);
    return aVal.gt(bVal) ? -1 : 1;
  });
}

function Contract({ address, onClickNominate, onClickVote, updateTotal }: ContractProps): React.ReactElement {
  const { api } = useApi();
  const historyDepth = useCall<u32>(api.query.plasmRewards.historyDepth, [])?.toNumber() ?? 1;
  const currentEra = useCall<Option<EraIndex>>(api.query.plasmRewards.currentEra, [])?.unwrap()?.toNumber() ?? 0;
  const oldestEra: number = Math.max(0, currentEra - historyDepth);

  const [era, setEra] = useState<number>(currentEra);
  if (era === 0 && currentEra !== 0) {
    setEra(currentEra);
  }
  const [total, setTotal] = useState<BN>(new BN(0));
  useEffect((): void => {
    (async (): Promise<any> => {
      await api.query.dappsStaking.erasStakingPoints<any>(era, address).then((info: any) => {
        const newTotal = new BN(total).add(info?.total);
        setTotal(newTotal);
        updateTotal(newTotal);
        if (era > oldestEra && era != 1) {
          setEra(era - 1);
        }
      });
    })();
  }, [era]);

  const [bad, setBad] = useState<number>(0);
  const [good, setGood] = useState<number>(0);
  useEffect((): void => {
    (async (): Promise<any> => {
      await api.query.dappsStaking.erasVotes<any>(currentEra, address).then((votes: any) => {
        setBad(votes?.bad.toNumber() ?? 0);
        setGood(votes?.good.toNumber() ?? 0);
      });
    })();
  }, [currentEra]);

  const stakingInfo = useCall<DerivedDappsStakingQuery>((api.derive as any).plasmStaking.query, [currentEra, address]);
  const [{ contractId, operatorId }, setStakingState] = useState<StakingState>({
    contractId: address.toString(),
    operatorId: "",
  });

  useEffect((): void => {
    if (stakingInfo) {
      const { operatorId, contractId } = stakingInfo;
      setStakingState({
        operatorId: operatorId?.toString() ?? "",
        contractId: contractId?.toString() ?? "",
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
        <FormatBalance value={total as any} />
      </td>
      <td>
        <Button
          isPrimary
          key="nominate"
          onClick={onClickNominate(contractId)}
          label={"Nominate"}
          icon="hand paper outline"
        />
      </td>
      <td>
        <label>{"votes"}</label>
        <i className="far fa-thumbs-up"></i> {good} / <i className="far fa-thumbs-down"></i> {bad}
      </td>
      <td>
        <Button isPrimary key="vote" onClick={onClickVote(contractId)} label={"Vote"} icon="thumbs up" />
      </td>
    </tr>
  );
}

function ContractList({ isIntentions, isVisible, allContracts }: Props): React.ReactElement<Props> | null {
  const [contracts, setContracts] = useState<string[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>();
  const [totals, setTotals] = useState<Map<string, BN>>(new Map());
  const [isNominateOpen, toggleNominate] = useToggle();
  const [isVoteOpen, toggleVote] = useToggle();

  useEffect((): void => {
    if (isVisible && allContracts && totals) {
      const contracts = sortedContracts(allContracts, totals);

      setContracts(contracts);
    }
  }, [allContracts, totals, isVisible]);

  const _updateTotal = (contract: string, totalStake: BN): void => {
    const total = totals.get(contract);
    if (!total || !total.eq(totalStake)) {
      setTotals(new Map(totals.set(contract, totalStake)));
    }
  };

  const _renderRows = (contracts: string[]): React.ReactNode =>
    contracts.map(
      (contract): React.ReactNode => {
        return (
          <Contract
            key={contract}
            address={contract}
            onClickNominate={(contract: string): (() => void) => {
              return (): void => {
                toggleNominate();
                setSelectedContract(contract);
              };
            }}
            onClickVote={(contract: string): (() => void) => {
              return (): void => {
                toggleVote();
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
      {isVoteOpen && <Vote onClose={toggleVote} allContracts={allContracts} contract={selectedContract} />}
    </div>
  );
}

export default ContractList;
