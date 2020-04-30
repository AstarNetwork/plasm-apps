import React from "react";
import styled from "styled-components";
import { Image } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { ApiPromise } from "@polkadot/api";
import { useApi, useCall } from "@polkadot/react-hooks";

import { Props } from "./types";
import PlasmImage from "../public/plasm.png";

function storageVersion(api: ApiPromise): string | null {
  const version = useCall(api.query.plasmRewards.storageVersion, []);
  let result = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((version as any)?.isV100) {
    result = "v1.0.0";
  }
  return result;
}

function PlasmInfo({ className }: Props): React.ReactElement {
  const { api } = useApi();
  const version = storageVersion(api);

  return (
    <div className={className}>
      <Image src={PlasmImage} alt="plasm-network" className="plasm-logo" />
      <span className="title">
        <Link id="plasm-name" to="/">
          Plasm Network
        </Link>
        <span id="plasm-version">{version ?? ""}</span>
      </span>
    </div>
  );
}

export default styled(PlasmInfo)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;

  .plasm-logo {
    height: 30px;
    margin: 0.5rem;
  }

  .title {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: auto;
    margin: 0.5rem 0.5rem 0 0;
  }

  #plasm-name {
    color: #fff;
    white-space: nowrap;
  }

  #plasm-version {
    color: #aaa;
    font-size: 0.8rem;
    text-align: right;
  }
`;
