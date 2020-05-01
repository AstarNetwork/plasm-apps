import { BareProps } from "@polkadot/react-components/types";

import FileSaver from "file-saver";
import React, { useState, useMemo } from "react";
import { AddressRow, Button, Modal, Password } from "@polkadot/react-components";
import keyring from "@polkadot/ui-keyring";

interface Props extends BareProps {
  onClose: () => void;
  address: string;
}

interface ContentProps {
  address: string;
  doBackup: () => void;
  isPassTouched: boolean;
  isPassValid: boolean;
  onChangePass: (password: string) => void;
  password: string;
}

export default function ({ address, onClose }: Props): React.ReactElement<Props> {
  const [password, setPassword] = useState("");
  const [isPassTouched, setIsPassTouched] = useState(false);
  const [backupFailed, setBackupFailed] = useState(false);
  const isPassValid = useMemo(() => keyring.isPassValid(password) && !backupFailed, [password, backupFailed]);

  const _onChangePass = (value: string): void => {
    if (!isPassTouched) {
      setIsPassTouched(true);
    }

    setBackupFailed(false);
    setPassword(value);
  };
  const _doBackup = (): void => {
    try {
      const addressKeyring = address && keyring.getPair(address);
      const json = addressKeyring && keyring.backupAccount(addressKeyring, password);
      const blob = new Blob([JSON.stringify(json)], { type: "application/json; charset=utf-8" });

      FileSaver.saveAs(blob, `${address}.json`);
    } catch (error) {
      setBackupFailed(true);
      console.error(error);
      return;
    }

    onClose();
  };

  return (
    <Modal className="app--accounts-Modal" header={"Backup account"}>
      <Content
        address={address}
        doBackup={_doBackup}
        isPassTouched={isPassTouched}
        isPassValid={isPassValid}
        password={password}
        onChangePass={_onChangePass}
      />
      <Modal.Actions onCancel={onClose}>
        <Button icon="download" isDisabled={!isPassValid} label={"Download"} onClick={_doBackup} />
      </Modal.Actions>
    </Modal>
  );
}

function Content({
  address,
  doBackup,
  isPassTouched,
  isPassValid,
  onChangePass,
  password,
}: ContentProps): React.ReactElement<ContentProps> {
  return (
    <Modal.Content>
      <AddressRow isInline value={address}>
        <p>
          {
            'An encrypted backup file will be created once you have pressed the "Download" button. This can be used to re-import your account on any other machine.'
          }
        </p>
        <p>
          {
            "Save this backup file in a secure location. Additionally, the password associated with this account is needed together with this backup file in order to restore your account."
          }
        </p>
        <div>
          <Password
            autoFocus
            help={
              "The account password as specified when creating the account. This is used to encrypt the backup file and subsequently decrypt it when restoring the account."
            }
            isError={isPassTouched && !isPassValid}
            label={"password"}
            onChange={onChangePass}
            onEnter={doBackup}
            tabIndex={0}
            value={password}
          />
        </div>
      </AddressRow>
    </Modal.Content>
  );
}
