import { AppProps } from "@polkadot/react-components/types";
import { TabItem } from "@polkadot/react-components/Tabs";
import { ComponentProps } from "./types";

import React from "react";
import { Route, Switch, RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import { Tabs } from "@polkadot/react-components";
import { withMulti, withObservable } from "@polkadot/react-api";
import keyring from "@polkadot/ui-keyring";
import { SubjectInfo } from "@polkadot/ui-keyring/observable/types";

import store from "./store";
import Contracts from "./Contracts/Contracts";
import Codes from "./Codes/Codes";
import Deploy from "./Deploy";

interface Props extends AppProps, RouteComponentProps {
  accounts: SubjectInfo[];
  contracts: SubjectInfo[];
}

interface State {
  codeHash?: string;
  constructorIndex: number;
  hasContracts: boolean;
  isDeployOpen: boolean;
  updated: number;
}

class App extends React.PureComponent<Props, State> {
  public state: State = {
    constructorIndex: 0,
    hasContracts: false,
    isDeployOpen: false,
    updated: 0,
  };

  constructor(props: Props) {
    super(props);

    store.on("new-code", this.triggerUpdate);
    store.on("removed-code", this.triggerUpdate);

    // since we have a dep on the async API, we load here
    store.loadAll().catch((): void => {
      // noop, handled internally
    });
  }

  public static getDerivedStateFromProps({ contracts }: Props): Pick<State, never> {
    const hasContracts = !!contracts && Object.keys(contracts).length >= 1;

    return {
      hasContracts,
    };
  }

  public render(): React.ReactNode {
    const { basePath } = this.props;
    const { codeHash, constructorIndex, isDeployOpen } = this.state;
    const hidden: string[] = [];

    return (
      <main className="contracts--App">
        <header>
          <Tabs
            basePath={basePath}
            hidden={hidden}
            items={[
              {
                name: "code",
                text: "Code",
              },
              {
                isRoot: true,
                name: "contracts",
                text: "Contracts",
              },
            ].map((tab): TabItem => ({ ...tab, text: tab.text }))}
          />
        </header>
        <Switch>
          <Route path={`${basePath}/code`} render={this.renderComponent(Codes)} />
          <Route render={this.renderComponent(Contracts)} exact />
        </Switch>
        <Deploy
          basePath={basePath}
          codeHash={codeHash}
          constructorIndex={constructorIndex}
          isOpen={isDeployOpen}
          onClose={this.hideDeploy}
        />
      </main>
    );
  }

  private renderComponent(Component: React.ComponentType<ComponentProps>): () => React.ReactNode {
    return (): React.ReactNode => {
      const { accounts, basePath, contracts, onStatusChange } = this.props;
      const { updated } = this.state;

      if (!contracts) {
        return null;
      }

      return (
        <Component
          accounts={accounts}
          basePath={basePath}
          contracts={contracts}
          hasCode={store.hasCode}
          onStatusChange={onStatusChange}
          showDeploy={this.showDeploy}
          updated={updated}
        />
      );
    };
  }

  private showDeploy = (codeHash?: string, constructorIndex = 0): (() => void) => (): void => {
    this.setState({
      codeHash: codeHash || undefined,
      constructorIndex,
      isDeployOpen: true,
    });
  };

  private hideDeploy = (): void => {
    this.setState({ isDeployOpen: false });
  };

  private triggerUpdate = (): void => {
    this.setState({ updated: Date.now() });
  };
}

export default withMulti(
  withRouter(App),
  withObservable(keyring.accounts.subject, { propName: "accounts" }),
  withObservable(keyring.contracts.subject, { propName: "contracts" })
);
