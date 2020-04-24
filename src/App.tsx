import React, { useEffect, useState } from "react";
import { HashRouter as Router } from "react-router-dom";
import styled from "styled-components";
import GlobalStyle from "@polkadot/react-components/styles";
import { useApi, useCall } from "@polkadot/react-hooks";

import { Props } from "./types";
import Sidebar from "./Sidebar";
import Content from "./Content";

function App({ className }: Props): React.ReactElement {
  const { api, isApiReady } = useApi();
  const fees = useCall(isApiReady ? api.derive.balances?.fees : undefined, []);
  const indexes = useCall(isApiReady ? api.derive.accounts?.indexes : undefined, []);
  const registrars = useCall(isApiReady ? api.query.identity?.registrars : undefined, []);
  const staking = useCall(isApiReady ? api.derive.staking?.overview : undefined, []);
  const [, setHasValues] = useState(false);

  useEffect((): void => {
    setHasValues(!!fees || !!indexes || !!registrars || !!staking);
  }, []);

  return (
    <>
      <GlobalStyle />
      <Router>
        <div className={className}>
          <Sidebar />

          <Content />
        </div>
      </Router>
    </>
  );
}

export default styled(App)`
  display: flex;
  padding: 1rem;
`;
