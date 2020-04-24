/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeriveHeartbeats, DeriveStakingOverview } from "@polkadot/api-derive/types";
import { AccountId } from "@polkadot/types/interfaces";
import { ValidatorFilter } from "../types";
import { AddressDetails } from "./types";

import React, { useEffect, useReducer, useState } from "react";
import { Dropdown, FilterOverlay, Input, Table } from "@polkadot/react-components";
import { useAccounts, useFavorites } from "@polkadot/react-hooks";

import { STORE_FAVS_BASE } from "../constants";
import Address from "./Address";

interface Props {
  authorsMap: Record<string, string>;
  hasQueries: boolean;
  isIntentions: boolean;
  isVisible: boolean;
  lastAuthors?: string[];
  next: string[];
  recentlyOnline?: DeriveHeartbeats;
  stakingOverview?: DeriveStakingOverview;
}

type AccountExtend = [string, boolean, boolean];

function sortByFav([, , isFavA]: AccountExtend, [, , isFavB]: AccountExtend): number {
  return isFavA === isFavB ? 0 : isFavA ? -1 : 1;
}

function filterAccounts(
  accounts: string[] = [],
  elected: string[],
  favorites: string[],
  without: string[]
): AccountExtend[] {
  return accounts
    .filter((accountId): boolean => !without.includes(accountId as any))
    .map((accountId): AccountExtend => [accountId, elected.includes(accountId), favorites.includes(accountId)])
    .sort(sortByFav);
}

function accountsToString(accounts: AccountId[]): string[] {
  return accounts.map((accountId): string => accountId.toString());
}

function reduceDetails(
  state: Record<string, AddressDetails>,
  _details: AddressDetails | AddressDetails[]
): Record<string, AddressDetails> {
  const details = Array.isArray(_details) ? _details : [_details];

  return details.reduce(
    (result, details): Record<string, AddressDetails> => {
      result[details.address] = {
        ...(state[details.address] || {}),
        ...details,
      };

      return result;
    },
    { ...state }
  );
}

export default function CurrentList({
  authorsMap,
  hasQueries,
  isIntentions,
  isVisible,
  lastAuthors,
  next,
  recentlyOnline,
  stakingOverview,
}: Props): React.ReactElement<Props> | null {
  const { allAccounts } = useAccounts();
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS_BASE);
  const [filter, setFilter] = useState<ValidatorFilter>("all");
  const [{ elected, validators, waiting }, setFiltered] = useState<{
    allElected: string[];
    elected: AccountExtend[];
    validators: AccountExtend[];
    waiting: AccountExtend[];
  }>({ allElected: [], elected: [], validators: [], waiting: [] });
  const [nameFilter, setNameFilter] = useState<string>("");
  const [addressDetails] = useReducer(reduceDetails, {});
  const filterOpts = [
    { text: "Show all validators and intentions", value: "all" },
    { text: "Show only my nominations", value: "iNominated" },
    { text: "Show only with nominators", value: "hasNominators" },
    { text: "Show only without nominators", value: "noNominators" },
    { text: "Show only with warnings", value: "hasWarnings" },
    { text: "Show only without warnings", value: "noWarnings" },
    { text: "Show only elected for next session", value: "nextSet" },
  ];

  useEffect((): void => {
    if (isVisible && stakingOverview) {
      const allElected = accountsToString(stakingOverview.nextElected);
      const _validators = accountsToString(stakingOverview.validators);
      const validators = filterAccounts(_validators, allElected, favorites, []);
      const elected = filterAccounts(allElected, allElected, favorites, _validators);

      setFiltered({
        allElected,
        elected,
        validators,
        waiting: filterAccounts(next, [], favorites, allElected),
      });
    }
  }, [favorites, isVisible, next, stakingOverview?.nextElected, stakingOverview?.validators]);

  // useEffect((): void => {
  //   if (stakingOverview) {
  //     dispatchDetails(
  //       validators.map(
  //         ([address]): AddressDetails => {
  //           const electedIdx = allElected.indexOf(address);

  //           return {
  //             address,
  //             points: electedIdx !== -1 ? stakingOverview.eraPoints?.individual[electedIdx] : undefined,
  //           };
  //         }
  //       )
  //     );
  //   }
  // }, [stakingOverview?.eraPoints, allElected, validators]);

  const _renderRows = (addresses: AccountExtend[], defaultName: string, isMain: boolean): React.ReactNode =>
    addresses.map(
      ([address, isElected, isFavorite]): React.ReactNode => (
        <Address
          address={address}
          defaultName={defaultName}
          filter={filter}
          filterName={nameFilter}
          hasQueries={hasQueries}
          heartbeat={isMain && recentlyOnline ? recentlyOnline[address] : undefined}
          isAuthor={lastAuthors && lastAuthors.includes(address)}
          isElected={isElected}
          isFavorite={isFavorite}
          key={address}
          lastBlock={authorsMap[address]}
          myAccounts={allAccounts}
          points={isMain ? addressDetails[address] && addressDetails[address].points : undefined}
          toggleFavorite={toggleFavorite}
        />
      )
    );

  return (
    <div className={`${!isVisible && "staking--hidden"}`}>
      <FilterOverlay>
        <Dropdown onChange={setFilter} options={filterOpts} value={filter} withLabel={false} />
      </FilterOverlay>
      <Input autoFocus isFull label={"filter by name, address or index"} onChange={setNameFilter} value={nameFilter} />
      <Table className={isIntentions ? "staking--hidden" : ""}>
        <Table.Body>{_renderRows(validators, "validators", true)}</Table.Body>
      </Table>
      <Table className={isIntentions ? "" : "staking--hidden"}>
        <Table.Body>
          {_renderRows(elected, "intention", false)}
          {_renderRows(waiting, "intention", false)}
        </Table.Body>
      </Table>
    </div>
  );
}
