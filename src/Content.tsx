import React, { useContext } from "react";
import { Switch, Route } from "react-router-dom";
import styled from "styled-components";
import { StatusContext } from "@polkadot/react-components";

import { Props } from "./types";
import Accouunts from "./Accounts";
import L2Deposit from "./L2Deposit";
import OPContract from "./OPContract/OPContract";
import Staking from "./Staking/Staking";
import ChainState from "./ChainState";
import Extrinsics from "./Extrinsics";
import Status from "./Status";

function Content({ className }: Props): React.ReactElement {
  const { queueAction, stqueue, txqueue } = useContext(StatusContext);

  return (
    <div className={className}>
      <Switch>
        <Route path="/accounts">
          <Accouunts />
        </Route>
        <Route path="/staking">
          <Staking basePath="/staking" />
        </Route>
        <Route path="/operated-contracts">
          <OPContract basePath="/operated-contracts" />
        </Route>
        <Route path="/l2">
          <L2Deposit />
        </Route>
        <Route path="/chainstate">
          <ChainState basePath="/chainstate" onStatusChange={queueAction} />
        </Route>
        <Route path="/extrinsics">
          <Extrinsics basePath="/extrinsics" onStatusChange={queueAction} />
        </Route>
      </Switch>

      <Status queueAction={queueAction} stqueue={stqueue} txqueue={txqueue} />
    </div>
  );
}

export default styled(Content)`
  padding: 1rem;
  width: 100%;
`;
