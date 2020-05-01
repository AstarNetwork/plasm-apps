import { DeriveBalancesAll } from "@polkadot/api-derive/types";

import BN from "bn.js";
import React, { useEffect, useState } from "react";
import { Icon } from "@polkadot/react-components";
import { useApi, useCall } from "@polkadot/react-hooks";

interface Props {
  accountId: string | null;
  onError: (error: string | null) => void;
  value?: BN | null;
}

function ValidateAmount({ accountId, onError, value }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances.all as any, [accountId]);
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    // don't show an error if the selected controller is the default
    // this applies when changing controller
    if (allBalances && value) {
      let newError: string | null = null;

      if (value.gt(allBalances.freeBalance)) {
        newError =
          "The specified value is greater than your free balance. The node will bond the maximum amount available.";
      }

      if (error !== newError) {
        onError(newError);
        setError(newError);
      }
    }
  }, [allBalances, value]);

  if (!error) {
    return null;
  }

  return (
    <article className="warning">
      <div>
        <Icon name="warning sign" />
        {error}
      </div>
    </article>
  );
}

export default ValidateAmount;
