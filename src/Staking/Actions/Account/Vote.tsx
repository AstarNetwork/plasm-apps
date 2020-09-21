import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { InputAddress, Modal, TxButton } from "@polkadot/react-components";
import { useFavorites } from "@polkadot/react-hooks";

import { Props as BaseProps } from "../../../types";
import { STORE_FAVS_BASE } from "../../constants";
import InputVotes from "./InputVotes";

interface Props extends BaseProps {
  controllerId?: string;
  nominees?: string[];
  onClose: () => void;
  allContracts?: string[];
  stashId?: string;
  contract?: string;
}

function Vote({
  className,
  controllerId,
  nominees,
  onClose,
  allContracts,
  contract,
}: Props): React.ReactElement<Props> | null {
  const [favorites] = useFavorites(STORE_FAVS_BASE);
  const [contracts, setContracts] = useState<string[]>([]);
  const [params, setParams] = useState<[string, string][]>([]);
  const [available, setAvailable] = useState<string[]>([]);

  const [fixedControllerId, setControllerId] = useState<string>(controllerId ?? "");

  useEffect((): void => {
    if (allContracts) {
      setContracts((allContracts || []).map((acc): string => acc.toString()));
    }
  }, [allContracts]);

  useEffect((): void => {
    const shortlist = [
      // ensure that the favorite is included in the list of stashes
      ...favorites.filter((acc): boolean => contracts.includes(acc)),
      // make sure the nominee is not in our favorites already
      ...(nominees || []).filter((acc): boolean => !favorites.includes(acc)),
    ];
    const available: string[] = Array.from(
      [...shortlist, ...contracts.filter((acc): boolean => !shortlist.includes(acc))].reduce(
        (s, c) => s.add(c),
        new Set<string>()
      )
    );

    setAvailable(available);
  }, [favorites, nominees, contracts]);

  return (
    <Modal className={`staking--Voting ${className}`} header={"Vote Contracts"} open>
      <Modal.Content className="ui--signer-Signer-Content">
        <InputAddress
          className="medium"
          defaultValue={controllerId}
          isDisabled={!!controllerId}
          label={"controller account"}
          onChange={(value: string | null): void => {
            setControllerId(value ?? "");
          }}
        />
        <InputVotes
          available={available}
          className="medium"
          help={"Filter available candidates based on name, address or short account index."}
          label={"filter candidates"}
          onChange={(values: [string, string][]): void => {
            setParams(values);
          }}
          contract={contract}
        />
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={fixedControllerId}
          isDisabled={!params.length}
          isPrimary
          onClick={onClose}
          params={[params]}
          label={"Vote"}
          icon="hand paper outline"
          tx="dappsStaking.voteContracts"
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(Vote)`
  .shortlist {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .candidate {
      border: 1px solid #eee;
      border-radius: 0.25rem;
      margin: 0.25rem;
      padding-bottom: 0.25rem;
      padding-right: 0.5rem;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        border-color: transparent;
        border-style: solid;
        border-radius: 0.25em;
        border-width: 0.25em;
      }

      &.isAye {
        background: #fff;
        border-color: #ccc;
      }

      &.member::after {
        border-color: green;
      }

      &.runnerup::after {
        border-color: steelblue;
      }

      .ui--AddressMini-icon {
        z-index: 1;
      }

      .candidate-right {
        text-align: right;
      }
    }
  }
`;
