import React from "react";
import ExplorerApp from "@polkadot/app-explorer";

import { Props } from "./types";

export default function Explorer({ basePath, onStatusChange }: Props): React.ReactElement {
  return (
    <>
      <ExplorerApp basePath={`${basePath}`} onStatusChange={onStatusChange} />
    </>
  );
}
