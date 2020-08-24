import { ApiInterfaceRx } from "@polkadot/api/types";
import { StakingLedger, AccountId, Nominations, RewardDestination } from "@polkadot/types/interfaces";
import { Option, createType } from "@polkadot/types";

import { combineLatest, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

import { DerivedDappsStakingAccount } from "../types";

interface ParseInput {
  stashId: Uint8Array | string;
  controllerId: Option<AccountId>;
  payee: RewardDestination;
  ledger: Option<StakingLedger> | undefined;
  nominations: Option<Nominations>;
}

function parseResult(
  api: ApiInterfaceRx,
  { stashId, controllerId, payee, ledger, nominations }: ParseInput
): DerivedDappsStakingAccount {
  const _controllerId = controllerId.unwrapOr(undefined);
  const _ledger = ledger ? ledger.unwrapOr(undefined) : undefined;
  const _nominations = nominations.unwrapOr(undefined);
  return {
    stashId: createType(api.registry, "AccountId", stashId),
    controllerId: _controllerId,
    payee,
    ledger: _ledger,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nominations: _nominations ? (_nominations as any) : undefined,
  };
}

/**
 * @description From a stash, retrieve the controllerId and fill in all the relevant staking details
 */
export function account(api: ApiInterfaceRx): (stashId: Uint8Array | string) => Observable<DerivedDappsStakingAccount> {
  return (stashId: Uint8Array | string): Observable<DerivedDappsStakingAccount> =>
    combineLatest([
      api.query.dappsStaking.bonded<Option<AccountId>>(stashId),
      api.query.dappsStaking.payee<RewardDestination>(stashId),
      api.query.dappsStaking.dappsNominations<Option<Nominations>>(stashId),
    ]).pipe(
      switchMap(
        ([controllerId, payee, nominations]): Observable<DerivedDappsStakingAccount> =>
          combineLatest([
            of(controllerId),
            of(payee),
            controllerId.isSome
              ? api.query.dappsStaking.ledger<Option<StakingLedger>>(controllerId.unwrap())
              : of(undefined),
            of(nominations),
          ]).pipe(
            map(
              ([controllerId, payee, ledger, nominations]): DerivedDappsStakingAccount =>
                parseResult(api, { stashId, controllerId, payee, ledger, nominations })
            )
          )
      )
    );
}
