/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountId, Balance, EraIndex } from "@polkadot/types/interfaces";
import { ContractFilter } from "../types";
import { StakingParameters } from "../../plasm";
import { DerivedDappsStakingQuery } from "../../Api/derive/types";
import { Option } from "@polkadot/types";

import BN from "bn.js";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AddressMini, AddressSmall, Badge, Icon } from "@polkadot/react-components";
import { useCall, useApi } from "@polkadot/react-hooks";
import { FormatBalance } from "@polkadot/react-query";
import { formatNumber } from "@polkadot/util";

interface Props {
  address: AccountId | string;
  authorsMap: Record<string, string>;
  className?: string;
  defaultName: string;
  filter: ContractFilter;
  hasQueries: boolean;
  isElected: boolean;
  isFavorite: boolean;
  lastAuthors?: string[];
  myAccounts: string[];
  onFavorite?: (accountId: string) => void;
  toggleFavorite: (accountId: string) => void;
  withNominations?: boolean;
}

interface StakingState {
  operatorId?: string;
  hasNominators: boolean;
  nominators: [AccountId, Balance][];
  stakeTotal?: BN;
  contractId: string;
  contractPayment?: BN;
  contractParameters?: StakingParameters;
}

function Address({
  address,
  authorsMap,
  className,
  filter,
  isElected,
  isFavorite,
  toggleFavorite,
  withNominations = true,
}: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const currentEra = useCall<Option<EraIndex>>(api.query.plasmRewards.currentEra, [])?.unwrap()?.toNumber() ?? 0;
  const stakingInfo = useCall<DerivedDappsStakingQuery>((api.derive as any).plasmStaking.query, [currentEra, address]);
  const [
    { operatorId, hasNominators, nominators, contractId, stakeTotal, contractParameters },
    setStakingState,
  ] = useState<StakingState>({
    hasNominators: false,
    nominators: [],
    contractId: address.toString(),
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect((): void => {
    if (stakingInfo) {
      const { operatorId, stakingPoints, contractId, contractParameters } = stakingInfo;
      const nominators: [AccountId, Balance][] = [];
      if (withNominations) {
        stakingPoints?.individual.forEach((bonded, who) => {
          nominators.push([who, bonded]);
        });
      }
      const stakeTotal = stakingPoints?.total;

      setStakingState({
        hasNominators: nominators.length !== 0,
        operatorId: operatorId?.toString(),
        nominators,
        stakeTotal,
        contractId: contractId?.toString(),
        contractParameters,
      });
    }
  }, [stakingInfo]);

  if (
    (filter === "hasNominators" && !hasNominators) ||
    (filter === "noNominators" && hasNominators) ||
    filter === "hasWarnings" /* TODO */ ||
    filter === "iNominated" /* TODO Erase */
  ) {
    return null;
  }

  const lastBlockNumber = authorsMap[contractId];
  const _onFavorite = (): void => toggleFavorite(contractId);
  const _toggleNominators = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    setIsExpanded(!isExpanded);
  };

  return (
    <tr className={`${className}`}>
      <td className="favorite">
        <Icon
          className={`${isFavorite && "isSelected"}`}
          name={isFavorite ? "star" : "star outline"}
          onClick={_onFavorite}
        />
      </td>
      <td className="together">
        <Badge
          hover={"Staked next/this session."}
          info={<Icon name="chevron right" />}
          isInline
          isTooltip
          type="next"
        />
        {isElected && (
          <Badge hover={"Already staked this session."} info={<Icon name="check" />} isInline isTooltip type="online" />
        )}
      </td>
      <td>
        <AddressSmall value={contractId} />
      </td>
      <td className="top ">
        <AddressMini className="mini-nopad" label={"operator"} value={operatorId} />
      </td>
      <td className={"toggle number"} colSpan={isExpanded ? 5 : 1} onClick={_toggleNominators}>
        {nominators &&
          (isExpanded ? (
            <div>
              {nominators.map(
                ([who, bonded]): React.ReactNode => (
                  <AddressMini bonded={bonded} key={who.toString()} value={who} withBonded />
                )
              )}
            </div>
          ) : (
            <FormatBalance label={<label>{"other stake"}</label>} value={stakeTotal}>
              &nbsp;({formatNumber(nominators.length)})&nbsp;
              <Icon name="angle double right" />
            </FormatBalance>
          ))}
      </td>
      {!isExpanded && (
        <>
          <td className="number">
            {contractParameters && (
              <>
                <label>{"option expired"}</label>
                {formatNumber((contractParameters as any).optionExpired)}
              </>
            )}
          </td>
          <td className="number">
            {contractParameters && (
              <>
                <label>{"option parcent"}</label>
                {formatNumber((contractParameters as any).optionP / 10000000)}
                {"%"}
              </>
            )}
          </td>
          <td className="number">
            {lastBlockNumber && (
              <>
                <label>{"last #"}</label>
                {lastBlockNumber}
              </>
            )}
          </td>
        </>
      )}
    </tr>
  );
}

export default styled(Address)`
  .extras {
    display: inline-block;
    margin-bottom: 0.75rem;

    .favorite {
      cursor: pointer;
      display: inline-block;
      margin-left: 0.5rem;
      margin-right: -0.25rem;

      &.isSelected {
        color: darkorange;
      }
    }
  }

  .blockNumberV1,
  .blockNumberV2 {
    border-radius: 0.25rem;
    font-size: 1.5rem;
    font-weight: 100;
    line-height: 1.5rem;
    opacity: 0.5;
    vertical-align: middle;
    z-index: 1;

    &.isCurrent {
      background: #3f3f3f;
      box-shadow: 0 3px 3px rgba(0, 0, 0, 0.2);
      color: #eee;
      opacity: 1;
    }
  }

  .blockNumberV2 {
    display: inline-block;
    padding: 0.25rem 0;

    &.isCurrent {
      margin-right: -0.25rem;
      padding: 0.25rem 0.75rem;
    }
  }

  .blockNumberV1 {
    padding: 0.25rem 0.5rem;
    position: absolute;
    right: 0;
  }

  .staking--Address-info {
    margin-right: 0.25rem;
    text-align: right;

    .staking--label {
      margin: 0 2.25rem -0.75rem 0;
    }
  }

  .staking--label.controllerSpacer {
    margin-top: 0.5rem;
  }

  .staking--stats {
    bottom: 0.75rem;
    cursor: pointer;
    position: absolute;
    right: 0.5rem;
  }
`;
