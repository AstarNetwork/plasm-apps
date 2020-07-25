import React from "react";
import styled from "styled-components";
import { Image } from "semantic-ui-react";
import { Link } from "react-router-dom";
import { EraIndex } from "@polkadot/types/interfaces";
import { Option } from "@polkadot/types";
import { useApi, useCall } from "@polkadot/react-hooks";

import { Props } from "./types";
import PlasmImage from "../public/plasm.png";
import DustyImage from "../public/dusty.png";

function PlasmInfo({ className }: Props): React.ReactElement {
  const { api } = useApi();
  const currentEra = useCall<Option<EraIndex>>(api.query.plasmRewards.currentEra, [])?.unwrap()?.toNumber() ?? 0;
  return (
    <div className={className}>
      <div className="title">
        {process.env.TARGET === "dusty" ? (
          <Image src={DustyImage} alt="dusty-network" className="logo" />
        ) : (
          <Image src={PlasmImage} alt="plasm-network" className="logo" />
        )}
        <span className="name">
          <Link id="plasm-name" to="/">
            {process.env.TARGET === "dusty" ? "Dusty Network" : "Plasm Network"}
          </Link>
        </span>
      </div>
      <div className="info">
        <span>Current Era: {currentEra}</span>
      </div>
    </div>
  );
}

export default styled(PlasmInfo)`
  margin-top: 1.5rem;

  .title {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  .logo {
    height: 30px;
    margin: 0.5rem;
  }

  .name {
    display: table-cell;
    vertical-align: middle;
    width: 100%;
  }

  #plasm-name {
    color: #fff;
    white-space: nowrap;
  }

  .info {
    font-size: 0.8rem;
    color: #fff;
    margin: 0 0.5rem;
    text-align: right;
  }
`;
