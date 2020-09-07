import React from "react";
import { Link } from "react-router-dom";
import { Menu, Sidebar as SemanticUISidebar } from "semantic-ui-react";
import styled from "styled-components";

import { Props } from "./types";
import PlasmInfo from "./PlasmInfo";

function SidebarInner(): React.ReactElement {
  return (
    <SemanticUISidebar as={Menu} vertical visible width="thin">
      <PlasmInfo />
      <div className="blank"></div>
      <Menu.Item as={Link} to="/accounts">
        <i className="fas fa-users"></i>
        Accounts
      </Menu.Item>
      <div className="blank"></div>
      <Menu.Item as={Link} to="/operated-contracts">
        <i className="fas fa-compress"></i>
        OP Contracts
      </Menu.Item>
      <Menu.Item as={Link} to="/operator">
        <i className="fas fa-th"></i>
        Operator
      </Menu.Item>
      <div className="blank"></div>
      <Menu.Item as={Link} to="/explorer">
        <i className="fas fa-database"></i>
        Explorer
      </Menu.Item>
      <Menu.Item as={Link} to="/chainstate">
        <i className="fas fa-database"></i>
        Chain State
      </Menu.Item>
      <Menu.Item as={Link} to="/extrinsics">
        <i className="fas fa-database"></i>
        Extrinsics
      </Menu.Item>
    </SemanticUISidebar>
  );
}

function Sidebar({ className }: Props): React.ReactElement {
  return (
    <div className={`${className}`}>
      <SidebarInner />
    </div>
  );
}

export default styled(Sidebar)`
  min-width: 150px;

  i {
    margin-right: 0.75rem;
  }

  .ui.menu .item {
    color: #fff;
    &:hover {
      color: #fff;
    }
  }

  .blank {
    padding-top: 1rem;
  }

  .ui.left.visible.sidebar,
  .ui.right.visible.sidebar {
    background-color: #111;
  }
`;
