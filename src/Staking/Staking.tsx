/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Header } from "semantic-ui-react";
import styled from "styled-components";
import { useCall, useAccounts, useApi } from "@polkadot/react-hooks";
import { Route, Switch } from "react-router";
import { useLocation } from "react-router-dom";
import { Tabs } from "@polkadot/react-components";
import { AccountId } from "@polkadot/types/interfaces";
import { DeriveHeartbeats, DeriveStakingOverview } from "@polkadot/api-derive/types";

import { Props } from "../types";
import Overview from "./Overview/Overview";
import Query from "./Query/Query";
import Targets from "./Targets/Targets";
import { MAX_SESSIONS } from "./constants";
import useSessionRewards from "./useSessionRewards";

function Staking({ basePath, className }: Props): React.ReactElement {
  const { api } = useApi();
  const { hasAccounts } = useAccounts();
  const hasQueries = hasAccounts && !!api.query.imOnline?.authoredBlocks;

  const { pathname } = useLocation();
  const [next, setNext] = useState<string[]>([]);
  const allStashes = useCall<string[]>(api.derive.staking.stashes, [], {
    defaultValue: [],
    transform: ([stashes]: [AccountId[]]): string[] => stashes.map((accountId): string => accountId.toString()),
  }) as string[];
  const recentlyOnline = useCall<DeriveHeartbeats>(api.derive.imOnline.receivedHeartbeats, []);
  const stakingOverview = useCall<DeriveStakingOverview>(api.derive.staking.overview, []);
  const sessionRewards = useSessionRewards(MAX_SESSIONS);

  const items = [
    {
      isRoot: true,
      name: "overview",
      text: "Staking overview",
    },
    {
      name: "waiting",
      text: "Waiting",
    },
    {
      name: "returns",
      text: "Returns",
    },
    {
      name: "actions",
      text: "Account actions",
    },
    {
      hasParams: true,
      name: "query",
      text: "Validator stats",
    },
  ];

  useEffect((): void => {
    stakingOverview &&
      setNext(allStashes.filter((address): boolean => !stakingOverview.validators.includes(address as any)));
  }, [allStashes, stakingOverview?.validators]);

  return (
    <main className={className}>
      <Header as="h2" className="title">
        Staking
      </Header>

      <Tabs
        basePath={basePath ?? ""}
        hidden={hasAccounts ? (hasQueries ? [] : ["query"]) : ["actions", "query"]}
        items={items}
      />

      <Switch>
        <Route path={[`${basePath}/query/:value`, `${basePath}/query`]}>
          <Query sessionRewards={sessionRewards} />
        </Route>
        <Route path={`${basePath}/returns`}>
          <Targets sessionRewards={sessionRewards} />
        </Route>
      </Switch>
      <Overview
        hasQueries={hasQueries}
        isVisible={[basePath, `${basePath}/waiting`].includes(pathname)}
        recentlyOnline={recentlyOnline}
        next={next}
        stakingOverview={stakingOverview}
      />
    </main>
  );
}

export default styled(Staking)`
  .title {
    margin: 1rem;
  }
`;
