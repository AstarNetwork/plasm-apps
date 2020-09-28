import { Props as BaseProps } from "../types";

import React, { useContext } from "react";
import { Button } from "@polkadot/react-components";
import { useToggle } from "@polkadot/react-hooks";
import ContractList from "./CommunityRewards/ContractList";
import { BlockAuthorsContext } from "@polkadot/react-query";
import Vote from "./Actions/Account/Vote";
import { Header, Grid } from "semantic-ui-react";

interface Props extends BaseProps {
  className?: string;
  isVisible: boolean;
  allContracts: string[];
}

function Voting({ className, isVisible, allContracts }: Props): React.ReactElement<Props> {
  const { byAuthor, lastBlockAuthors } = useContext(BlockAuthorsContext);
  const [isVoteOpen, toggleVote] = useToggle();

  return (
    <div className={`${className} ${!isVisible && "staking--hidden"}`}>
      <Header as="h2">Vote for contracts</Header>
      <Grid>
        <Grid.Column floated="left" width={10}>
          <p>You can vote for multiple contracts at the same time using the button on the right.</p>
        </Grid.Column>
        <Grid.Column floated="right" width={5}>
          <Button isPrimary key="voting" label={"Vote"} icon="add" onClick={toggleVote} />
        </Grid.Column>
      </Grid>
      {isVoteOpen && <Vote onClose={toggleVote} allContracts={allContracts} />}
      <p>You can also vote individually from the list of contracts below.</p>
      <ContractList
        authorsMap={byAuthor}
        hasQueries={false}
        isIntentions={false}
        isVisible={true}
        lastAuthors={lastBlockAuthors}
        allContracts={allContracts}
        electedContracts={allContracts}
      />
    </div>
  );
}

export default Voting;
