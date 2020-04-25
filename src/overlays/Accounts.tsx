import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAccounts, useApi } from "@polkadot/react-hooks";

import BaseOverlay from "./Base";

interface Props {
  className?: string;
}

export default function Accounts({ className }: Props): React.ReactElement<Props> | null {
  const { hasAccounts } = useAccounts();
  const { isApiReady } = useApi();
  const [isHidden, setIsHidden] = useState(false);

  if (!isApiReady || hasAccounts || isHidden) {
    return null;
  }

  const _onClose = (): void => setIsHidden(true);

  return (
    <BaseOverlay className={className} icon="users" type="info">
      <p>
        {
          "You don't have any accounts. Some features are currently hidden and will only become available once you have accounts."
        }
      </p>
      <p>
        <Link to="/accounts" onClick={_onClose}>
          {"Create an account now."}
        </Link>
      </p>
    </BaseOverlay>
  );
}
