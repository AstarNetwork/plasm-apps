/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiInterfaceRx } from "@polkadot/api/types";
import { AccountId } from "@polkadot/types/interfaces";
import { StakingParameters } from "../../../plasm";

import { DerivedDappsStakingQuery } from "../types";

import { combineLatest, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { createType, Option } from "@polkadot/types";

import { memo } from "@polkadot/api-derive/util/memo";
import { EraStakingPoints } from "../../../plasm/types";

interface ParseInput {
  operatorId: Option<AccountId>;
  stakingPoints: EraStakingPoints;
  contractId: AccountId;
  contractParameters: Option<StakingParameters>;
}

function parseResult({
  operatorId,
  stakingPoints,
  contractId,
  contractParameters,
}: ParseInput): DerivedDappsStakingQuery {
  const _operatorId = operatorId.unwrapOr(undefined);
  const _contractParameters = contractParameters.unwrapOr(undefined);
  return {
    operatorId: _operatorId ? (_operatorId.toString() as any) : undefined,
    stakingPoints,
    contractId,
    contractParameters: _contractParameters,
  };
}

function retrieve(api: ApiInterfaceRx, era: any, contractId: AccountId): Observable<DerivedDappsStakingQuery> {
  return combineLatest([
    api.query.dappsStaking.erasStakingPoints<EraStakingPoints>(era, contractId),
    api.query.operator.contractHasOperator<Option<AccountId>>(contractId),
    api.query.operator.contractParameters<Option<StakingParameters>>(contractId),
  ]).pipe(
    map(
      ([stakingPoints, operatorId, contractParameters]): DerivedDappsStakingQuery => {
        return parseResult({
          operatorId,
          stakingPoints,
          contractId,
          contractParameters,
        });
      }
    )
  );
}

/**
 * @description From a stash, retrieve the controllerId and fill in all the relevant staking details
 */
export function query(api: ApiInterfaceRx): (_accountId: Uint8Array | string) => Observable<DerivedDappsStakingQuery> {
  return memo(
    (era: any, accountId: Uint8Array | string): Observable<DerivedDappsStakingQuery> => {
      return retrieve(api, era, createType(api.registry, "AccountId", accountId));
    }
  );
}
