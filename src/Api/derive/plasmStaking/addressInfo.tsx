/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import { ApiInterfaceRx } from "@polkadot/api/types";
import {
  AccountId,
  Keys,
  Balance,
  RewardDestination,
  BlockNumber,
  StakingLedger,
  UnlockChunk,
} from "@polkadot/types/interfaces";
import {
  DeriveSessionProgress,
  DeriveStakingAccount,
  DeriveStakingQuery,
  DeriveUnlocking,
} from "@polkadot/api-derive/types";
import { Option, createType } from "@polkadot/types";

import BN from "bn.js";
import { combineLatest, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

import { isUndefined } from "@polkadot/util";

// groups the supplied chunks by era, i.e. { [era]: BN(total of values) }
function groupByEra(list: UnlockChunk[]): Record<string, BN> {
  return list.reduce((map: Record<string, BN>, { era, value }): Record<string, BN> => {
    const key = era.toString();

    map[key] = !map[key] ? value.unwrap() : map[key].add(value.unwrap());

    return map;
  }, {});
}

// calculate the remaining blocks in a specific unlock era
function remainingBlocks(api: ApiInterfaceRx, era: BN, sessionProgress: DeriveSessionProgress): BlockNumber {
  const remaining = era.sub(sessionProgress.currentEra);

  // on the Rust side the current-era >= era-for-unlock (removal done on >)
  return createType(
    api.registry,
    "BlockNumber",
    remaining.gtn(0)
      ? remaining.subn(1).mul(sessionProgress.eraLength).add(sessionProgress.eraLength.sub(sessionProgress.eraProgress))
      : 0
  );
}

function calculateUnlocking(
  api: ApiInterfaceRx,
  stakingLedger: StakingLedger | undefined,
  sessionProgress: DeriveSessionProgress
): DeriveUnlocking[] | undefined {
  if (isUndefined(stakingLedger)) {
    return undefined;
  }

  const unlockingChunks = stakingLedger.unlocking.filter(({ era }): boolean =>
    remainingBlocks(api, era.unwrap(), sessionProgress).gtn(0)
  );

  if (!unlockingChunks.length) {
    return undefined;
  }

  // group the unlock chunks that have the same era and sum their values
  const groupedResult = groupByEra(unlockingChunks);
  const results = Object.entries(groupedResult).map(
    ([eraString, value]): DeriveUnlocking => ({
      value: createType(api.registry, "Balance", value),
      remainingEras: remainingBlocks(api, new BN(eraString), sessionProgress),
    })
  );

  return results.length ? results : undefined;
}

function redeemableSum(
  api: ApiInterfaceRx,
  stakingLedger: StakingLedger | undefined,
  sessionProgress: DeriveSessionProgress
): Balance {
  if (isUndefined(stakingLedger)) {
    return createType(api.registry, "Balance");
  }

  return createType(
    api.registry,
    "Balance",
    stakingLedger.unlocking.reduce((total, { era, value }): BN => {
      return remainingBlocks(api, era.unwrap(), sessionProgress).eqn(0) ? total.add(value.unwrap()) : total;
    }, new BN(0))
  );
}

function parseResult(
  api: ApiInterfaceRx,
  sessionProgress: DeriveSessionProgress,
  query: DeriveStakingQuery
): DeriveStakingAccount {
  return {
    ...query,
    redeemable: redeemableSum(api, query.stakingLedger, sessionProgress),
    unlocking: calculateUnlocking(api, query.stakingLedger, sessionProgress),
  };
}

type MultiResultV2 = [RewardDestination, Option<StakingLedger>];

interface ParseInputInfo {
  accountId: AccountId;
  controllerId: AccountId;
  rewardDestination: RewardDestination;
  queuedKeys?: [AccountId, Keys][];
  stakingLedger: Option<StakingLedger>;
  stashId: AccountId;
}

function parseResultInfo({
  accountId,
  controllerId,
  stashId,
  stakingLedger,
  rewardDestination,
}: ParseInputInfo): DeriveStakingQuery {
  const _stakingLedger = stakingLedger.unwrapOr(undefined);
  return {
    accountId,
    controllerId,
    rewardDestination,
    stakingLedger: _stakingLedger,
    stashId,
    nextSessionIds: [],
    sessionIds: [],
  };
}

function retrieveInfo(
  api: ApiInterfaceRx,
  accountId: AccountId,
  stashId: AccountId,
  controllerId: AccountId
): Observable<DeriveStakingQuery> {
  return (api.queryMulti([
    [api.query.dappsStaking.payee, stashId],
    [api.query.dappsStaking.ledger, controllerId],
  ]) as any).pipe(
    map(
      ([rewardDestination, stakingLedger]: MultiResultV2): DeriveStakingQuery =>
        parseResultInfo({ accountId, controllerId, stashId, stakingLedger, rewardDestination })
    )
  );
}

function retrieveQuery(api: ApiInterfaceRx, stashId: AccountId): Observable<DeriveStakingQuery> {
  return api.query.dappsStaking
    .bonded<Option<AccountId>>(stashId)
    .pipe(
      switchMap(
        (controllerId: any): Observable<DeriveStakingQuery> =>
          controllerId.isSome
            ? retrieveInfo(api, stashId, stashId, controllerId.unwrap())
            : of({ accountId: stashId, nextSessionIds: [], sessionIds: [] })
      ) as any
    ) as any;
}

/**
 * @description From a stash, retrieve the controllerId and fill in all the relevant staking details
 */
export function addressInfo(api: ApiInterfaceRx): (accountId: Uint8Array | string) => Observable<DeriveStakingAccount> {
  return (accountId: Uint8Array | string): Observable<DeriveStakingAccount> =>
    combineLatest([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (api.derive as any).plasmStaking.info() as Observable<DeriveSessionProgress>,
      retrieveQuery(api, createType(api.registry, "AccountId", accountId)),
    ]).pipe(
      map(([sessionProgress, query]: [DeriveSessionProgress, DeriveStakingQuery]) =>
        parseResult(api, sessionProgress, query)
      )
    );
}
