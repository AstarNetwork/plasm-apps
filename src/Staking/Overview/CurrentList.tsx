import { ContractFilter } from "../types";

import React, { useEffect, useState } from "react";
import { Dropdown, FilterOverlay, Table } from "@polkadot/react-components";
import { useAccounts, useFavorites } from "@polkadot/react-hooks";

import { STORE_FAVS_BASE } from "../constants";
import Address from "./Address";

interface Props {
  authorsMap: Record<string, string>;
  hasQueries: boolean;
  isIntentions: boolean;
  isVisible: boolean;
  lastAuthors?: string[];
  allContracts: string[];
  electedContracts: string[];
}

// ContractId, isElected, isFav
type AccountExtend = [string, boolean, boolean];

function filterAccounts(
  allContracts: string[] = [],
  electedContracts: string[] = [],
  favorites: string[]
): AccountExtend[] {
  return allContracts
    .sort((a, b): number => {
      const isFavA = favorites.includes(a);
      const isFavB = favorites.includes(b);
      const isElectedA = electedContracts.includes(a);
      return isFavA === isFavB ? (isElectedA ? -1 : 1) : isFavA ? -1 : 1;
    })
    .map(
      (contract): AccountExtend => {
        return [contract, electedContracts.includes(contract), favorites.includes(contract)];
      }
    );
}

function CurrentList({
  authorsMap,
  hasQueries,
  isIntentions,
  isVisible,
  lastAuthors,
  allContracts,
  electedContracts,
}: Props): React.ReactElement<Props> | null {
  const { allAccounts } = useAccounts();
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS_BASE);
  const [filter, setFilter] = useState<ContractFilter>("all");
  const [contracts, setFiltered] = useState<AccountExtend[]>([]);

  useEffect((): void => {
    if (isVisible && allContracts) {
      const contracts = filterAccounts(allContracts, electedContracts, favorites);

      setFiltered(contracts);
    }
  }, [allContracts, electedContracts, favorites, isVisible]);

  const _renderRows = (addresses: AccountExtend[], defaultName: string): React.ReactNode =>
    addresses.map(
      ([contract, isElected, isFavorite]): React.ReactNode => (
        <Address
          address={contract}
          authorsMap={authorsMap}
          defaultName={defaultName}
          filter={filter}
          hasQueries={hasQueries}
          isElected={isElected}
          isFavorite={isFavorite}
          lastAuthors={lastAuthors}
          key={contract}
          myAccounts={allAccounts}
          toggleFavorite={toggleFavorite}
        />
      )
    );

  return (
    <div className={`${!isVisible && "staking--hidden"}`}>
      <FilterOverlay>
        <Dropdown
          onChange={setFilter}
          options={[
            { text: "Show all contracts and intentions", value: "all" },
            { text: "Show only my nominations", value: "iNominated" },
            { text: "Show only with nominators", value: "hasNominators" },
            { text: "Show only without nominators", value: "noNominators" },
            { text: "Show only with warnings", value: "hasWarnings" },
            { text: "Show only without warnings", value: "noWarnings" },
          ]}
          value={filter}
          withLabel={false}
        />
      </FilterOverlay>
      <Table className={isIntentions ? "staking--hidden" : ""}>
        <Table.Body>{_renderRows(contracts, "contracts")}</Table.Body>
      </Table>
    </div>
  );
}

export default CurrentList;
