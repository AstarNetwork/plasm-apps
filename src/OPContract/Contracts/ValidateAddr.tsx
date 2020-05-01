/* eslint-disable @typescript-eslint/camelcase */
import { ContractInfo } from "@polkadot/types/interfaces";
import { ApiProps } from "@polkadot/react-api/types";

import React, { useEffect, useState } from "react";
import { Option } from "@polkadot/types";
import { withCalls } from "@polkadot/react-api";
import { InfoForInput } from "@polkadot/react-components";
import keyring from "@polkadot/ui-keyring";

interface Props extends ApiProps {
  address?: string | null;
  contracts_contractInfoOf?: Option<ContractInfo>;
  onChange: (isValid: boolean) => void;
}

function ValidateAddr({ address, contracts_contractInfoOf, onChange }: Props): React.ReactElement<Props> | null {
  const [isAddress, setIsAddress] = useState(false);
  const [isStored, setIsStored] = useState(false);

  useEffect((): void => {
    try {
      keyring.decodeAddress(address || "");
      setIsAddress(true);
    } catch (error) {
      setIsAddress(false);
    }
  }, [address]);

  useEffect((): void => {
    setIsStored(!!contracts_contractInfoOf && contracts_contractInfoOf.isSome);
  }, [contracts_contractInfoOf]);

  useEffect((): void => {
    onChange(isAddress && isStored);
  }, [isAddress, isStored]);

  if (isStored || !isAddress) {
    return null;
  }

  return (
    <InfoForInput type="error">
      {isAddress
        ? "Unable to find deployed contract code at the specified address"
        : "The value is not in a valid address format"}
    </InfoForInput>
  );
}

export default withCalls<Props>([
  "query.contracts.contractInfoOf",
  {
    fallbacks: ["query.contract.contractInfoOf"],
    paramName: "address",
  },
])(ValidateAddr);
