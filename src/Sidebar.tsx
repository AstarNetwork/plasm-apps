import React from "react";
import { Link } from "react-router-dom";
import { Menu, Sidebar as SemanticUISidebar, Responsive } from "semantic-ui-react";
import styled from "styled-components";

import { Props } from "./types";
import PlasmInfo from "./PlasmInfo";

function SidebarForMobile(): React.ReactElement {
  // TODO
  return <></>;
}

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
      <Menu.Item as={Link} to="/staking">
        <i className="fas fa-certificate"></i>
        Staking
      </Menu.Item>
      <Menu.Item as={Link} to="/operated-contracts">
        <i className="fas fa-compress"></i>
        OP Contracts
      </Menu.Item>
      <Menu.Item as={Link} to="/l2">
        <i className="fas fa-layer-group"></i>
        L2 Deposit
      </Menu.Item>
      <div className="blank"></div>
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
      <Responsive {...Responsive.onlyMobile}>
        <SidebarForMobile />
      </Responsive>
      <Responsive {...Responsive.onlyTablet}>
        <SidebarInner />
      </Responsive>
      <Responsive {...Responsive.onlyComputer}>
        <SidebarInner />
      </Responsive>
    </div>
  );
}

export default styled(Sidebar)`
  width: 150px;

  i {
    margin-right: 0.75rem;
  }

  .ui.menu .item {
    position: static;
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
