import { DeriveHeartbeats, DeriveStakingOverview } from "@polkadot/api-derive/types";
import { BareProps } from "@polkadot/react-components/types";

import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { BlockAuthorsContext } from "@polkadot/react-query";

import CurrentList from "./CurrentList";

interface Props extends BareProps {
  hasQueries: boolean;
  isVisible: boolean;
  recentlyOnline?: DeriveHeartbeats;
  next: string[];
  stakingOverview?: DeriveStakingOverview;
}

export default function Overview({
  hasQueries,
  isVisible,
  className,
  recentlyOnline,
  next,
  stakingOverview,
}: Props): React.ReactElement<Props> {
  const { pathname } = useLocation();
  const { byAuthor, lastBlockAuthors } = useContext(BlockAuthorsContext);
  const isIntentions = pathname !== "/staking";

  return (
    <div className={`staking--Overview ${className} ${!isVisible && "staking--hidden"}`}>
      <CurrentList
        authorsMap={byAuthor}
        hasQueries={hasQueries}
        isIntentions={isIntentions}
        isVisible={isVisible}
        lastAuthors={lastBlockAuthors}
        next={next}
        recentlyOnline={recentlyOnline}
        stakingOverview={stakingOverview}
      />
    </div>
  );
}
