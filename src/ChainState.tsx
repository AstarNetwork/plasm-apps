import React from "react";
import Storage from "@polkadot/app-storage";

import { Props } from "./types";

export default function ChainState({ basePath, onStatusChange }: Props): React.ReactElement {
  return (
    <>
      <Storage basePath={`${basePath}`} onStatusChange={onStatusChange} />
    </>
  );
}
