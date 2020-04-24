import React from "react";
import styled from "styled-components";
import { Image } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { Props } from "./types";
import PlasmImage from "../public/plasm.png";

function PlasmInfo({ className }: Props): React.ReactElement {
  return (
    <div className={className}>
      <Image src={PlasmImage} alt="plasm-network" className="logo" />
      <span className="title">
        <Link id="title" to="/">
          Plasm Network
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
  margin-top: 1rem;

  .logo {
    height: 30px;
    margin: 0.5rem;
  }

  .title {
    width: 100%;
    height: auto;
  }

  #title {
    color: #fff;
  }
`;
