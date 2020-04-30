/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContractABIFnArg } from "@polkadot/api-contract/types";
import { TypeDef } from "@polkadot/types/types";
import { RawParams } from "@polkadot/react-params/types";

import React, { useEffect, useState } from "react";
import UIParams from "@polkadot/react-params";

interface Props {
  isDisabled?: boolean;
  params?: ContractABIFnArg[];
  onChange: (values: any[]) => void;
  onEnter?: () => void;
}

interface ParamDef {
  name: string;
  type: TypeDef;
}

export default function Params({
  isDisabled,
  onChange,
  onEnter,
  params: propParams,
}: Props): React.ReactElement<Props> | null {
  const [params, setParams] = useState<ParamDef[]>([]);

  useEffect((): void => {
    if (propParams) {
      setParams(propParams);
    }
  }, [propParams]);

  if (!params.length) {
    return null;
  }

  const _onChange = (values: RawParams): void => {
    onChange(values.map(({ value }): any => value));
  };

  return <UIParams isDisabled={isDisabled} onChange={_onChange} onEnter={onEnter} params={params} />;
}
