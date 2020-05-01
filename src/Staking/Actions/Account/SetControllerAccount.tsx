import { ApiProps } from "@polkadot/react-api/types";

import React from "react";
import { Button, InputAddress, Modal, TxButton, TxComponent } from "@polkadot/react-components";
import { withApi, withMulti } from "@polkadot/react-api/hoc";

import detectUnsafe from "../../unsafeChains";
import InputValidationController from "./InputValidationController";

interface Props extends ApiProps {
  defaultControllerId: string;
  onClose: () => void;
  stashId: string;
}

interface State {
  controllerError: string | null;
  controllerId: string | null;
}

class SetControllerAccount extends TxComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      controllerError: null,
      controllerId: null,
    };
  }

  public render(): React.ReactNode {
    const { defaultControllerId, onClose, stashId, systemChain } = this.props;
    const { controllerError, controllerId } = this.state;
    const isUnsafeChain = detectUnsafe(systemChain);
    const canSubmit = isUnsafeChain || (!controllerError && !!controllerId && defaultControllerId !== controllerId);

    return (
      <Modal className="staking--SetControllerAccount" header={"Change controller account"} open size="small">
        <Modal.Content className="ui--signer-Signer-Content">
          <InputAddress className="medium" isDisabled label={"stash account"} value={stashId} />
          <InputAddress
            className="medium"
            defaultValue={defaultControllerId}
            help={
              "The controller is the account that will be used to control any nominating actions. Should not match another stash or controller."
            }
            isError={!isUnsafeChain && !!controllerError}
            label={"controller account"}
            onChange={this.onChangeController}
            type="account"
            value={controllerId}
          />
          <InputValidationController
            accountId={stashId}
            defaultController={defaultControllerId}
            controllerId={controllerId}
            isUnsafeChain={isUnsafeChain}
            onError={this.onControllerError}
          />
        </Modal.Content>
        <Modal.Actions onCancel={onClose}>
          <Button.Group>
            <Button isNegative onClick={onClose} label={"Cancel"} icon="cancel" />
            <Button.Or />
            <TxButton
              accountId={stashId}
              isDisabled={!canSubmit}
              isPrimary
              label={"Set controller"}
              icon="sign-in"
              onClick={onClose}
              params={[controllerId]}
              tx="dappsStaking.setController"
              ref={this.button}
            />
          </Button.Group>
        </Modal.Actions>
      </Modal>
    );
  }

  private onChangeController = (controllerId: string | null): void => {
    this.setState({ controllerId });
  };

  private onControllerError = (controllerError: string | null): void => {
    this.setState({ controllerError });
  };
}

export default withMulti(SetControllerAccount, withApi);
