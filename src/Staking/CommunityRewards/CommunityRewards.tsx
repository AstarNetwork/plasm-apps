import { BareProps } from "@polkadot/react-components/types";

import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { BlockAuthorsContext } from "@polkadot/react-query";
import { Header } from "semantic-ui-react";

import ContractList from "./ContractList";

interface Props extends BareProps {
  hasQueries: boolean;
  isVisible: boolean;
  allContracts: string[];
  electedContracts: string[];
}

export default function CommunityRewards({
  hasQueries,
  isVisible,
  className,
  allContracts,
  electedContracts,
}: Props): React.ReactElement<Props> {
  const { pathname } = useLocation();
  const { byAuthor, lastBlockAuthors } = useContext(BlockAuthorsContext);
  const isIntentions = pathname !== "/staking/community-rewards";

  return (
    <div className={`${className} ${!isVisible && "staking--hidden"}`}>
      <Header as="h2">Staking Rank of Contracts</Header>
      <ContractList
        authorsMap={byAuthor}
        hasQueries={hasQueries}
        isIntentions={isIntentions}
        isVisible={isVisible}
        lastAuthors={lastBlockAuthors}
        allContracts={allContracts}
        electedContracts={electedContracts}
      />
    </div>
  );
}
