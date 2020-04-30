import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
import Queue from "@polkadot/react-components/Status/Queue";
import { BlockAuthors, Events } from "@polkadot/react-query";

import "semantic-ui-css/semantic.min.css";
import "./style.css";

import App from "./App";
import Api from "./Api/Api";

const wsEndpoint = process.env.WS_URL;

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
