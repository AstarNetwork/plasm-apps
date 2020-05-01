import { ModalProps } from "../types";

import React, { useState } from "react";
import styled from "styled-components";
import { AddressRow, Button, Input, InputAddress, Modal } from "@polkadot/react-components";
import { QrScanAddress } from "@polkadot/react-qr";
import keyring from "@polkadot/ui-keyring";

interface Scanned {
  address: string;
  genesisHash: string;
  name?: string;
}

interface Props extends ModalProps {
  className?: string;
}

function QrModal({ className, onClose, onStatusChange }: Props): React.ReactElement<Props> {
  const [{ isNameValid, name }, setName] = useState({ isNameValid: false, name: "" });
  const [scanned, setScanned] = useState<Scanned | null>(null);

  const _onNameChange = (name: string): void => setName({ isNameValid: !!name.trim(), name });
  const _onScan = (scanned: Scanned): void => {
    setScanned(scanned);

    if (scanned.name) {
      _onNameChange(scanned.name);
    }
  };
  const _onSave = (): void => {
    if (!scanned || !isNameValid) {
      return;
    }

    const { address, genesisHash } = scanned;

    keyring.addExternal(address, { genesisHash, name: name.trim() });
    InputAddress.setLastValue("account", address);

    onStatusChange({
      account: address,
      action: "create",
      message: "created account",
      status: "success",
    });
    onClose();
  };

  return (
    <Modal className={className} header={"Add account via Qr"}>
      <Modal.Content>
        {scanned ? (
          <>
            <AddressRow defaultName={name} noDefaultNameOpacity value={scanned.address} />
            <Input
              autoFocus
              className="full"
              help={"Name given to this account. You can change it at any point in the future."}
              isError={!isNameValid}
              label={"name"}
              onChange={_onNameChange}
              onEnter={_onSave}
              value={name}
            />
          </>
        ) : (
          <div className="qr-wrapper">
            <QrScanAddress onScan={_onScan} />
          </div>
        )}
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <Button icon="sign-in" isDisabled={!scanned || !isNameValid} isPrimary onClick={_onSave} label={"Create"} />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(QrModal)`
  .qr-wrapper {
    margin: 0 auto;
    max-width: 30rem;
  }
`;
