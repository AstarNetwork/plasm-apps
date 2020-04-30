import React from "react";
import { AddressRow, Button, Modal, Password, TxComponent } from "@polkadot/react-components";
import { ActionStatus } from "@polkadot/react-components/Status/types";
import keyring from "@polkadot/ui-keyring";

interface Props {
  address: string;
  onClose: () => void;
}

interface State {
  isNewValid: boolean;
  isOldValid: boolean;
  newPass: string;
  oldPass: string;
}

class ChangePass extends TxComponent<Props, State> {
  public state: State = {
    isNewValid: false,
    isOldValid: false,
    newPass: "",
    oldPass: "",
  };

  public render(): React.ReactNode {
    return (
      <Modal className="app--accounts-Modal" header={"Change account password"}>
        {this.renderContent()}
        {this.renderButtons()}
      </Modal>
    );
  }

  private renderButtons(): React.ReactNode {
    const { onClose } = this.props;
    const { isNewValid, isOldValid } = this.state;

    return (
      <Modal.Actions onCancel={onClose}>
        <Button
          icon="sign-in"
          isDisabled={!isNewValid || !isOldValid}
          isPrimary
          label={"Change"}
          onClick={this.doChange}
          ref={this.button}
        />
      </Modal.Actions>
    );
  }

  private renderContent(): React.ReactNode {
    const { address } = this.props;
    const { isNewValid, isOldValid, newPass, oldPass } = this.state;

    return (
      <Modal.Content>
        <AddressRow isInline value={address}>
          <p>
            {
              "This will apply to any future use of this account as stored on this browser. Ensure that you securely store this new password and that it is strong and unique to the account."
            }
          </p>
          <div>
            <Password
              autoFocus
              help={
                "The existing account password as specified when this account was created or when it was last changed."
              }
              isError={!isOldValid}
              label={"your current password"}
              onChange={this.onChangeOld}
              tabIndex={1}
              value={oldPass}
            />
            <Password
              help={
                "The new account password. Once set, all future account unlocks will be performed with this new password."
              }
              isError={!isNewValid}
              label={"your new password"}
              onChange={this.onChangeNew}
              onEnter={this.submit}
              tabIndex={2}
              value={newPass}
            />
          </div>
        </AddressRow>
      </Modal.Content>
    );
  }

  private doChange = (): void => {
    const { address, onClose } = this.props;
    const { newPass, oldPass } = this.state;
    const status: Partial<ActionStatus> = {
      action: "changePassword",
    };

    try {
      const account = address && keyring.getPair(address);

      if (!account) {
        status.message = `No keypair found for this address ${address}`;

        return;
      }

      try {
        if (!account.isLocked) {
          account.lock();
        }

        account.decodePkcs8(oldPass);
      } catch (error) {
        this.setState({ isOldValid: false });
        status.message = error.message;

        return;
      }

      try {
        keyring.encryptAccount(account, newPass);
        status.account = address;
        status.status = "success";
        status.message = "password changed";
      } catch (error) {
        this.setState({ isNewValid: false });
        status.status = "error";
        status.message = error.message;

        return;
      }
    } catch (error) {
      status.message = error.message;

      return;
    }

    onClose();
  };

  private onChangeNew = (newPass: string): void => {
    this.setState({
      isNewValid: this.validatePass(newPass),
      newPass,
    });
  };

  private onChangeOld = (oldPass: string): void => {
    this.setState({
      isOldValid: this.validatePass(oldPass),
      oldPass,
    });
  };

  private validatePass(password: string): boolean {
    return keyring.isPassValid(password);
  }
}

export default ChangePass;
