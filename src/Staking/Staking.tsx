import { AppProps as Props } from "@polkadot/react-components/types";
import { Exposure, AccountId } from "@polkadot/types/interfaces";

import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { Option } from "@polkadot/types";
import Tabs from "@polkadot/react-components/Tabs";
import { useCall, useAccounts, useApi } from "@polkadot/react-hooks";

import Actions from "./Actions/Actions";
import Overview from "./Overview/Overview";
import Summary from "./Overview/Summary";
import { MAX_SESSIONS } from "./constants";
import useSessionRewards from "./useSessionRewards";

const EMPY_ACCOUNTS: string[] = [];
const EMPTY_EXPOSURES: Exposure[] = [];
const EMPTY_ALL: [string[], Exposure[]] = [EMPY_ACCOUNTS, EMPTY_EXPOSURES];

function transformAllContracts([contracts]: [AccountId[], Option<AccountId>[]]): string[] {
  return contracts.map((accountId): string => accountId.toString());
}

function transformStakedContracts([contracts, exposures]: [AccountId[], Exposure[]]): [string[], Exposure[]] {
  return [contracts.map((accountId): string => accountId.toString()), exposures];
}

function Staking({ basePath, className }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { hasAccounts } = useAccounts();
  const { pathname } = useLocation();
  const allContractIds = useCall<string[]>(api.query.operator?.contractHasOperator, [], {
    defaultValue: EMPY_ACCOUNTS,
    transform: transformAllContracts,
  }) as string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stakedContracts = useCall<[string[], Exposure[]]>((api.derive as any).plasmStaking.stakedOperators, [], {
    defaultValue: EMPTY_ALL,
    transform: transformStakedContracts,
  }) as [string[], Exposure[]];
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
              text: "Staking overview",
            },
            {
              name: "actions",
              text: "Account actions",
            },
          ]}
        />
      </header>
      <Summary
        isVisible={pathname === basePath}
        allContracts={allContractIds}
        stakedContracts={stakedContracts[0]}
        stakedExposures={stakedContracts[1]}
        sessionRewards={sessionRewards}
      />
      <Actions allContracts={allContractIds} isVisible={pathname === `${basePath}/actions`} />
      <Overview
        hasQueries={hasQueries}
        isVisible={[basePath, `${basePath}/waiting`].includes(pathname)}
        allContracts={allContractIds}
        electedContracts={stakedContracts[0]}
      />
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
