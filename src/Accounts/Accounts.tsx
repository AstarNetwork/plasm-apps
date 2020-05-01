import { AppProps as Props } from "@polkadot/react-components/types";
import { ComponentProps } from "./types";

import React, { useEffect, useState } from "react";
import { Route, Switch } from "react-router";
import { useAccounts } from "@polkadot/react-hooks";
import { Tabs } from "@polkadot/react-components";

import Overview from "./Overview";

export default function AccountsApp({ basePath, onStatusChange }: Props): React.ReactElement<Props> {
  const { hasAccounts } = useAccounts();
  const [hidden, setHidden] = useState<string[]>(["vanity"]);
  const items = [
    {
      isRoot: true,
      name: "overview",
      text: "My accounts",
    },
  ];

  useEffect((): void => {
    setHidden(hasAccounts ? [] : ["vanity"]);
  }, [hasAccounts]);

  const _renderComponent = (Component: React.ComponentType<ComponentProps>): React.ReactNode => (
    <Component basePath={basePath} onStatusChange={onStatusChange} />
  );

  return (
    <main className="accounts--App">
      <header>
        <Tabs basePath={basePath} hidden={hidden} items={items} />
      </header>
      <Switch>
        <Route>{_renderComponent(Overview)}</Route>
      </Switch>
    </main>
  );
}
