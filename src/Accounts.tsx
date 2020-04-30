import React from "react";
import AccountsApp from "./Accounts/Accounts";

import { Props } from "./types";

export default function Accounts({ basePath, onStatusChange }: Props): React.ReactElement {
  return (
    <>
      <AccountsApp basePath={`${basePath}`} onStatusChange={onStatusChange} />
    </>
  );
}
