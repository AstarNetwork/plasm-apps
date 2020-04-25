import React from "react";
import ExtrinsicApp from "@polkadot/app-extrinsics";

import { Props } from "./types";

export default function Extrinsics({ className, basePath, onStatusChange }: Props): React.ReactElement {
  return (
    <>
      <ExtrinsicApp basePath={`${basePath}`} className={`${className}`} onStatusChange={onStatusChange} />
    </>
  );
}
