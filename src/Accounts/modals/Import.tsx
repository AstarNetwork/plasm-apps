import { KeyringPair$Json } from "@polkadot/keyring/types";
import { ActionStatus } from "@polkadot/react-components/Status/types";
import { ModalProps as Props } from "../types";

import React from "react";
import { AddressRow, Button, InputAddress, InputFile, Modal, Password, TxComponent } from "@polkadot/react-components";
import { isHex, isObject, u8aToString } from "@polkadot/util";
import keyring from "@polkadot/ui-keyring";

interface State {
  address: string | null;
  isFileValid: boolean;
  isPassValid: boolean;
  json: KeyringPair$Json | null;
  password: string;
}

class Import extends TxComponent<Props, State> {
  public state: State = {
    address: null,
    isFileValid: false,
    isPassValid: false,
    json: null,
    password: "",
  };

  public render(): React.ReactNode {
    const { onClose } = this.props;
    const { isFileValid, isPassValid } = this.state;

    return (
      <Modal header={"Add via backup file"}>
        {this.renderInput()}
        <Modal.Actions onCancel={onClose}>
          <Button
            icon="sync"
            isDisabled={!isFileValid || !isPassValid}
            isPrimary
            onClick={this.onSave}
            label={"Restore"}
            ref={this.button}
          />
        </Modal.Actions>
      </Modal>
    );
  }

  private renderInput(): React.ReactNode {
    const { address, isFileValid, isPassValid, json, password } = this.state;
    const acceptedFormats = ["application/json", "text/plain"].join(", ");

    return (
      <Modal.Content>
        <AddressRow
          defaultName={isFileValid && json ? json.meta.name : null}
          noDefaultNameOpacity
          value={isFileValid && address ? address : null}
        >
          <InputFile
            accept={acceptedFormats}
            className="full"
            help={
              "Select the JSON key file that was downloaded when you created the account. This JSON file contains your private key encrypted with your password."
            }
            isError={!isFileValid}
            label={"backup file"}
            onChange={this.onChangeFile}
            withLabel
          />
          <Password
            autoFocus
            className="full"
            help={
              "Type the password chosen at the account creation. It was used to encrypt your account's private key in the backup file."
            }
            isError={!isPassValid}
            label={"password"}
            onChange={this.onChangePass}
            onEnter={this.submit}
            value={password}
          />
        </AddressRow>
      </Modal.Content>
    );
  }

  private onChangeFile = (file: Uint8Array): void => {
    try {
      const json = JSON.parse(u8aToString(file));
      const publicKey = keyring.decodeAddress(json.address, true);
      const address = keyring.encodeAddress(publicKey);
      const isFileValid =
        publicKey.length === 32 &&
        isHex(json.encoded) &&
        isObject(json.meta) &&
        (Array.isArray(json.encoding.content)
          ? json.encoding.content[0] === "pkcs8"
          : json.encoding.content === "pkcs8");

      this.setState({
        address,
        isFileValid,
        json,
      });
    } catch (error) {
      this.setState({
        address: null,
        isFileValid: false,
        json: null,
      });
      console.error(error);
    }
  };

  private onChangePass = (password: string): void => {
    this.setState({
      isPassValid: keyring.isPassValid(password),
      password,
    });
  };

  private onSave = (): void => {
    const { onClose, onStatusChange } = this.props;
    const { json, password } = this.state;

    if (!json) {
      return;
    }

    const status: Partial<ActionStatus> = { action: "restore" };

    try {
      const pair = keyring.restoreAccount(json, password);
      const { address } = pair;

      status.status = pair ? "success" : "error";
      status.account = address;
      status.message = "account restored";

      InputAddress.setLastValue("account", address);
    } catch (error) {
      this.setState({ isPassValid: false });

      status.status = "error";
      status.message = error.message;
      console.error(error);
    }

    onStatusChange(status as ActionStatus);

    if (status.status !== "error") {
      onClose();
    }
  };
}

export default Import;
