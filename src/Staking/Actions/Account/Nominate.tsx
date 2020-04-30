import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { InputAddressMulti, Button, InputAddress, Modal, TxButton } from "@polkadot/react-components";
import { useFavorites } from "@polkadot/react-hooks";
import { Props as BaseProps } from "../../../types";

import { STORE_FAVS_BASE } from "../../constants";

interface Props extends BaseProps {
  controllerId: string;
  nominees?: string[];
  onClose: () => void;
  allContracts?: string[];
  stashId: string;
}

const MAX_NOMINEES = 16;

function Nominate({
  className,
  controllerId,
  nominees,
  onClose,
  allContracts,
  stashId,
}: Props): React.ReactElement<Props> | null {
  const [favorites] = useFavorites(STORE_FAVS_BASE);
  const [contracts, setContracts] = useState<string[]>([]);
  const [selection, setSelection] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);

  useEffect((): void => {
    if (!selection.length && nominees) {
      setSelection(nominees);
    }
  }, [selection, nominees]);

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
    <Modal className={`staking--Nominating ${className}`} header={"Nominate Contracts"} open>
      <Modal.Content className="ui--signer-Signer-Content">
        <InputAddress className="medium" defaultValue={controllerId} isDisabled label={"controller account"} />
        <InputAddress className="medium" defaultValue={stashId} isDisabled label={"stash account"} />
        <InputAddressMulti
          available={available}
          className="medium"
          help={"Filter available candidates based on name, address or short account index."}
          label={"filter candidates"}
          maxCount={MAX_NOMINEES}
          onChange={setSelection}
          value={selection}
        />
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <Button.Group>
          <Button isNegative onClick={onClose} label={"Cancel"} icon="cancel" />
          <Button.Or />
          <TxButton
            accountId={controllerId}
            isDisabled={!selection.length}
            isPrimary
            onClick={onClose}
            params={[selection]}
            label={"Nominate"}
            icon="hand paper outline"
            tx="dappsStaking.nominateContracts"
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
}

export default styled(Nominate)`
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
