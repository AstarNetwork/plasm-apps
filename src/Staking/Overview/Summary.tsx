import { Balance, EraIndex } from "@polkadot/types/interfaces";
import { Option } from "@polkadot/types";

import BN from "bn.js";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import SummarySession from "@polkadot/app-explorer/SummarySession";
import { CardSummary, SummaryBox } from "@polkadot/react-components";
import { useApi, useCall } from "@polkadot/react-hooks";

import { formatBalance } from "@polkadot/util";
import { SessionRewards } from "../types";

interface Props {
  className?: string;
  isVisible: boolean;
  allContracts: string[];
  stakedContracts: string[];
  sessionRewards: SessionRewards[];
}

interface StakeInfo {
  percentage: string;
  staked: string | null;
}

function Summary({
  className,
  isVisible,
  allContracts,
  stakedContracts,
  sessionRewards,
}: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const totalInsurance = useCall<Balance>(api.query.balances.totalIssuance, []);
  const [lastReward, setLastReward] = useState(new BN(0));
  const [{ percentage, staked }, setStakeInfo] = useState<StakeInfo>({ percentage: "-", staked: null });
  const [total, setTotal] = useState<string | null>(null);
  const currentEra = useCall<Option<EraIndex>>(api.query.plasmRewards.currentEra, [])?.unwrap()?.toNumber() ?? 0;
  const totalStaked = useCall<Balance>(api.query.dappsStaking.erasTotalStake, [currentEra]);

  useEffect((): void => {
    if (sessionRewards && sessionRewards.length) {
      const lastRewardSession = sessionRewards.filter(({ reward }): boolean => reward.gtn(0));

      setLastReward(lastRewardSession.length ? lastRewardSession[lastRewardSession.length - 1].reward : new BN(0));
    }
  }, [sessionRewards]);

  useEffect((): void => {
    if (totalInsurance) {
      setTotal(
        `${formatBalance(totalInsurance, { forceUnit: "-", withSi: false })}${
          formatBalance.calcSi(totalInsurance.toString()).value
        }`
      );
    }
  }, [totalInsurance]);

  useEffect((): void => {
    if (totalInsurance && totalStaked?.gtn(0)) {
      setStakeInfo({
        percentage: `${(totalStaked.muln(10000).div(totalInsurance).toNumber() / 100).toFixed(2)}%`,
        staked: `${formatBalance(totalStaked, { forceUnit: "-", withSi: false })}${
          formatBalance.calcSi(totalStaked.toString()).value
        }`,
      });
    }
  }, [totalInsurance]);

  return (
    <SummaryBox className={`${className} ${!isVisible && "staking--hidden"}`}>
      <section className="ui--media-small">
        <CardSummary label={"total stake"}>{staked || "-"}</CardSummary>
        <CardSummary label="">/</CardSummary>
        <CardSummary label={"total issuance"}>{total || "-"}</CardSummary>
      </section>
      <CardSummary label={"staked"}>{percentage}</CardSummary>
      <section>
        <CardSummary label={"staked contracts"}>
          {stakedContracts.length}
          {`/${allContracts.length.toString()}`}
        </CardSummary>
      </section>
      <section>
        <SummarySession />
      </section>
      <CardSummary label={"last reward"}>
        {lastReward.gtn(0) ? `${formatBalance(lastReward, { forceUnit: "-", withSi: false })}` : "-"}
      </CardSummary>
    </SummaryBox>
  );
}

export default styled(Summary)`
  .validator--Account-block-icon {
    margin-right: 0.75rem;
    margin-top: -0.25rem;
    vertical-align: middle;
  }

  .validator--Summary-authors {
    .validator--Account-block-icon + .validator--Account-block-icon {
      margin-left: -1.5rem;
    }
  }
`;
