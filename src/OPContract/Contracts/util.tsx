import { ContractABIFn, ContractABIMessage } from "@polkadot/api-contract/types";
import { StringOrNull } from "@polkadot/react-components/types";

import React from "react";
import { ApiPromise } from "@polkadot/api";
import { PromiseContract as Contract } from "@polkadot/api-contract";
import { MessageSignature } from "@polkadot/react-components";
import { getContractAbi } from "@polkadot/react-components/util";

export function findCallMethod(callContract: Contract | null, callMethodIndex = 0): ContractABIMessage | null {
  const message = callContract && callContract.abi.abi.contract.messages[callMethodIndex];

  return message || null;
}

export function getContractMethodFn(
  callContract: Contract | null,
  callMethodIndex: number | null
): ContractABIFn | null {
  const fn = callContract && callContract.abi && callMethodIndex !== null && callContract.abi.messages[callMethodIndex];

  return fn || null;
}

export function getContractForAddress(api: ApiPromise, address: StringOrNull): Contract | null {
  if (!address) {
    return null;
  } else {
    const abi = getContractAbi(address);
    return abi ? new Contract(api, abi, address) : null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCallMessageOptions(callContract: Contract | null): any[] {
  return callContract
    ? callContract.messages.map(({ def: message, def: { name }, index }): {
        key: string;
        text: React.ReactNode;
        value: string;
      } => {
        return {
          key: name,
          text: <MessageSignature message={message} />,
          value: `${index}`,
        };
      })
    : [];
}
