import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import { Api } from "@polkadot/react-api";
import Queue from "@polkadot/react-components/Status/Queue";
import { BlockAuthors, Events } from "@polkadot/react-query";

import "semantic-ui-css/semantic.min.css";
import "./style.css";

import App from "./App";

// TODO: separate constants
const wsEndpoint = "ws://127.0.0.1:9944";

ReactDOM.render(
  <Suspense fallback="...">
    <Queue>
      <Api url={wsEndpoint}>
        <BlockAuthors>
          <Events>
            <HashRouter>
              <App />
            </HashRouter>
          </Events>
        </BlockAuthors>
      </Api>
    </Queue>
  </Suspense>,
  document.getElementById("root")
);
