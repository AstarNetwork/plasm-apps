/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppProps as Props } from "@polkadot/react-components/types";
import { EraStakingPoints } from "./types";

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import Tabs from "@polkadot/react-components/Tabs";
import { useAccounts, useApi } from "@polkadot/react-hooks";

import Actions from "./Actions/Actions";
import Overview from "./Overview/Overview";
import Summary from "./Overview/Summary";
import { MAX_SESSIONS } from "./constants";
import useSessionRewards from "./useSessionRewards";
import ClaimForNominator from "./ClaimForNominator";
import ClaimForOperator from "./ClaimForOperator";
import CommunityRewards from "./CommunityRewards/CommunityRewards";

function Staking({ basePath, className }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { hasAccounts } = useAccounts();
  const { pathname } = useLocation();
  const [allContractIds, setAllContractIds] = useState<string[]>([]);

  useEffect((): void => {
    api.query.operator?.operatorHasContracts.entries().then((_contractIds: any) => {
      const contractIds = _contractIds
        .flatMap(([_, contracts]): string => contracts.map((contract) => contract.toString()))
        .reduce((s, c) => s.add(c), new Set<string>());
      setAllContractIds(Array.from(contractIds));
    });
  }, []);

  const [stakedContracts, setStakedContracts] = useState<string[]>();
  useEffect((): void => {
    api.query.dappsStaking?.erasStakingPoints.entries().then((erasStakingPoints: any) => {
      const contracts: string[] = [];
      erasStakingPoints.forEach(
        ([
          {
            args: [era, contract],
          },
          value,
        ]: [any, EraStakingPoints]) => {
          contracts.push(contract.toString());
        }
      );
      setStakedContracts(contracts);
    });
  }, []);

  const hasQueries = hasAccounts && !!api.query.imOnline?.authoredBlocks;
  const sessionRewards = useSessionRewards(MAX_SESSIONS);

  return (
    <main className={`staking--App ${className}`}>
      <header>
        <Tabs
          basePath={basePath}
          hidden={hasAccounts ? (hasQueries ? [] : ["query"]) : ["actions", "query"]}
          items={[
            {
              isRoot: true,
              name: "overview",
              text: "Staking Overview",
            },
            {
              name: "actions",
              text: "Bonding",
            },
            {
              name: "community-rewards",
              text: "Community Rewards",
            },
            {
              name: "claim-for-nominator",
              text: "Claim for Nominator",
            },
            {
              name: "claim-for-operator",
              text: "Claim for Operator",
            },
          ]}
        />
      </header>
      <Summary
        isVisible={pathname === basePath}
        allContracts={allContractIds}
        stakedContracts={stakedContracts ?? []}
        sessionRewards={sessionRewards}
      />
      <Actions allContracts={allContractIds} isVisible={pathname === `${basePath}/actions`} />
      <Overview
        hasQueries={hasQueries}
        isVisible={[basePath, `${basePath}/waiting`].includes(pathname)}
        allContracts={allContractIds}
        electedContracts={stakedContracts ?? []}
      />
      <CommunityRewards
        hasQueries={hasQueries}
        isVisible={pathname === `${basePath}/community-rewards`}
        allContracts={allContractIds}
        electedContracts={stakedContracts ?? []}
      />
      <ClaimForNominator isVisible={pathname === `${basePath}/claim-for-nominator`} />
      <ClaimForOperator isVisible={pathname === `${basePath}/claim-for-operator`} />
    </main>
  );
}

export default styled(Staking)`
  .staking--hidden {
    display: none;
  }

  .staking--queryInput {
    margin-bottom: 1.5rem;
  }

  .staking--Chart h1 {
    margin-bottom: 0.5rem;
  }

  .staking--Chart + .staking--Chart {
    margin-top: 1.5rem;
  }
`;
