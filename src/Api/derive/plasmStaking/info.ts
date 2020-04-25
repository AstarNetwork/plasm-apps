import { SessionIndex } from "@polkadot/types/interfaces";
import { DeriveSessionProgress, DeriveSessionIndexes } from "@polkadot/api-derive/types";

import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { ApiInterfaceRx } from "@polkadot/api/types";
import { u64, createType } from "@polkadot/types";

import { memo } from "@polkadot/api-derive/util/memo";

type ResultSlots = [u64, u64, u64, SessionIndex];
type ResultType = [boolean, u64, SessionIndex];
type Result = [ResultType, DeriveSessionIndexes, ResultSlots];

function createDerivedLatest(
  api: ApiInterfaceRx,
  [
    [hasBabe, epochDuration, sessionsPerEra],
    { currentIndex, currentEra, validatorCount },
    [currentSlot, epochIndex, epochOrGenesisStartSlot, currentEraStartSessionIndex],
  ]: Result
): Partial<DeriveSessionProgress> {
  const epochStartSlot = epochIndex.mul(epochDuration).add(epochOrGenesisStartSlot);
  const sessionProgress = currentSlot.sub(epochStartSlot);
  const eraProgress = currentIndex.sub(currentEraStartSessionIndex).mul(epochDuration).add(sessionProgress);

  return {
    currentEra,
    currentIndex,
    eraLength: createType(api.registry, "BlockNumber", sessionsPerEra.mul(epochDuration)),
    eraProgress: createType(api.registry, "BlockNumber", eraProgress),
    isEpoch: hasBabe,
    sessionLength: epochDuration,
    sessionsPerEra,
    sessionProgress: createType(api.registry, "BlockNumber", sessionProgress),
    validatorCount,
  };
}

function infoLatestBabe(api: ApiInterfaceRx): Observable<Partial<DeriveSessionProgress>> {
  return combineLatest([
    api.derive.session.indexes(),
    api.queryMulti<ResultSlots>([
      api.query.babe.currentSlot,
      api.query.babe.epochIndex,
      api.query.babe.genesisSlot,
      api.query.plasmStaking.currentEraStartSessionIndex,
    ]),
  ]).pipe(
    map(
      ([indexes, slots]: [DeriveSessionIndexes, ResultSlots]): Partial<DeriveSessionProgress> =>
        createDerivedLatest(api, [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [true, api.consts.babe.epochDuration, api.consts.plasmStaking.sessionsPerEra as any],
          indexes,
          slots,
        ])
    )
  );
}

/**
 * @description Retrieves all the session and era info and calculates specific values on it as the length of the session and eras
 */
export function info(api: ApiInterfaceRx): () => Observable<Partial<DeriveSessionProgress>> {
  const query = infoLatestBabe;
  return memo((): Observable<Partial<DeriveSessionProgress>> => query(api));
}
