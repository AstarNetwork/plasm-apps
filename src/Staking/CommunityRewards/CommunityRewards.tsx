import { BareProps } from "@polkadot/react-components/types";

import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { BlockAuthorsContext } from "@polkadot/react-query";
import { useToggle, useApi } from "@polkadot/react-hooks";
import { Button, StatusContext } from "@polkadot/react-components";
import { Header, Grid } from "semantic-ui-react";
import { Abi } from "@polkadot/api-contract";
import { registry } from "@polkadot/react-api";

import ContractList from "./ContractList";
import Deploy from "../../OPContract/Deploy";
import { PAPER_CONTRACT_CODE_HASH, PAPER_CONTRACT_ABI } from "../../constants";
import Add from "../../OPContract/Codes/Add";
import Nick from "./Nick";

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
  const { api } = useApi();
  const { pathname } = useLocation();
  const { byAuthor, lastBlockAuthors } = useContext(BlockAuthorsContext);
  const isIntentions = pathname !== "/staking/community-rewards";
  const [isAddOpen, toggleAddOpen] = useToggle();
  const [isDeployOpen, toggleDeployOpen] = useToggle();
  const [isNickOpen, toggleNickOpen] = useToggle();
  const { queueAction } = useContext(StatusContext);

  const abi = new Abi(registry, PAPER_CONTRACT_ABI);

  return (
    <div className={`${className} ${!isVisible && "staking--hidden"}`}>
      <Header as="h2">Participate as a operator</Header>
      <p>To participate as a operator, you need to take the following three steps.</p>
      <Grid>
        <Grid.Column floated="left" width={10}>
          <p>
            1. Get a code to deploy a contract. The content of the contract is meaningless, so you can use the
            pre-prepared code.
          </p>
        </Grid.Column>
        <Grid.Column floated="right" width={5}>
          <Button
            icon="sign in"
            isPrimary
            label={"Get a code"}
            onClick={toggleAddOpen}
            style={{ marginBottom: "1rem" }}
          />
        </Grid.Column>
      </Grid>
      <Grid>
        <Grid.Column floated="left" width={10}>
          <p>
            2. Deploy the contract, <b>StakingParameters &gt; canBeNominated</b> should be set to <b>Yes</b>.
          </p>
        </Grid.Column>
        <Grid.Column floated="right" width={5}>
          <Button
            icon="sign in"
            isPrimary
            label={"Deploy your contract"}
            onClick={toggleDeployOpen}
            style={{ marginBottom: "1rem" }}
          />
        </Grid.Column>
      </Grid>
      <Grid>
        <Grid.Column floated="left" width={10}>
          <p>3. Set nickname to your address.</p>
        </Grid.Column>
        <Grid.Column floated="right" width={5}>
          <Button
            icon="user circle"
            isPrimary
            label={"Set nickname"}
            onClick={toggleNickOpen}
            style={{ marginBottom: "1rem" }}
          />
        </Grid.Column>
      </Grid>
      <Add
        basePath=""
        codeHash={PAPER_CONTRACT_CODE_HASH}
        contractAbi={abi}
        onClose={toggleAddOpen}
        onSuccess={(): void => {
          queueAction &&
            queueAction({
              action: "community rewards add code",
              status: "success",
              message: "added code",
            });
        }}
        isOpen={isAddOpen}
      />
      <Deploy codeHash={PAPER_CONTRACT_CODE_HASH} isOpen={isDeployOpen} onClose={toggleDeployOpen} />
      <Nick
        api={api}
        isOpen={isNickOpen}
        onClose={toggleNickOpen}
        onSuccess={(): void => {
          queueAction &&
            queueAction({
              action: "community rewards add nickname",
              status: "success",
              message: "added nickname",
            });
        }}
      />

      <Header as="h2">Stakings of Contracts</Header>
      <p>
        Please bond your account at <b>Bond/Nominate</b> tab to nominate. Your nomination will be added from the next
        era.
      </p>
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
