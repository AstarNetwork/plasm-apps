import React, { useContext } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import styled from "styled-components";
import { StatusContext } from "@polkadot/react-components";

import { Props } from "./types";
import Accouunts from "./Accounts";
import OPContract from "./OPContract/OPContract";
import Operator from "./Operator/Operator";
import ChainState from "./ChainState";
import Extrinsics from "./Extrinsics";
import Explorer from "./Explorer";
import Status from "./Status";

function Content({ className }: Props): React.ReactElement {
  const { queueAction, stqueue, txqueue } = useContext(StatusContext);

  return (
    <div className={className}>
      <Switch>
        <Route path="/accounts">
          <Accouunts basePath="/accounts" onStatusChange={queueAction} />
        </Route>
        <Route path="/operated-contracts">
          <OPContract basePath="/operated-contracts" onStatusChange={queueAction} />
        </Route>
        <Route path="/operator">
          <Operator basePath="/operator" onStatusChange={queueAction} />
        </Route>
        <Route path="/explorer">
          <Explorer basePath="/explorer" onStatusChange={queueAction} />
        </Route>
        <Route path="/chainstate">
          <ChainState basePath="/chainstate" onStatusChange={queueAction} />
        </Route>
        <Route path="/extrinsics">
          <Extrinsics basePath="/extrinsics" onStatusChange={queueAction} />
        </Route>
        <Redirect exact from="/" to="/accounts" />
      </Switch>

      <Status queueAction={queueAction} stqueue={stqueue} txqueue={txqueue} />
    </div>
  );
}

export default styled(Content)`
  padding: 1rem;
  width: 100%;
`;
