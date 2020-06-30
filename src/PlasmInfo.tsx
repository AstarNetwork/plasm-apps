import React from "react";
import styled from "styled-components";
import { Image } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { Props } from "./types";
import PlasmImage from "../public/plasm.png";
import DustyImage from "../public/dusty.png";

function PlasmInfo({ className }: Props): React.ReactElement {
  return (
    <div className={className}>
      {process.env.TARGET === "dusty" ? (
        <Image src={DustyImage} alt="dusty-network" className="logo" />
      ) : (
        <Image src={PlasmImage} alt="plasm-network" className="logo" />
      )}
      <span className="title">
        <Link id="plasm-name" to="/">
          {process.env.TARGET === "dusty" ? "Dusty Network" : "Plasm Network"}
        </Link>
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

  .logo {
    height: 30px;
    margin: 0.5rem;
  }

  .title {
    display: table-cell;
    vertical-align: middle;
    width: 100%;
  }

  #plasm-name {
    color: #fff;
    white-space: nowrap;
  }
`;
