import { ApiProps } from "@polkadot/react-api/types";
import { CalculateBalanceProps } from "../types";

import BN from "bn.js";
import React from "react";
import { SubmittableExtrinsic } from "@polkadot/api/promise/types";
import {
  Button,
  Dropdown,
  InputAddress,
  InputBalanceBonded,
  Modal,
  TxButton,
  TxComponent,
} from "@polkadot/react-components";
import { withApi, withMulti } from "@polkadot/react-api/hoc";

import detectUnsafe from "../unsafeChains";
import InputValidateAmount from "./Account/InputValidateAmount";
import InputValidationController from "./Account/InputValidationController";
import { rewardDestinationOptions } from "./constants";

interface Props extends ApiProps, CalculateBalanceProps {
  onClose: () => void;
}

interface State {
  amountError: string | null;
  bondValue?: BN;
  controllerError: string | null;
  controllerId: string | null;
  destination: number;
  extrinsic: SubmittableExtrinsic | null;
  stashId: string | null;
}

class NewStake extends TxComponent<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      amountError: null,
      controllerError: null,
      controllerId: null,
      destination: 0,
      extrinsic: null,
      stashId: null,
    };
  }

  public render(): React.ReactNode {
    const { onClose, systemChain } = this.props;
    const { amountError, bondValue, controllerError, controllerId, destination, extrinsic, stashId } = this.state;
    const hasValue = !!bondValue && bondValue.gtn(0);
    const isUnsafeChain = detectUnsafe(systemChain);
    const canSubmit = hasValue && (isUnsafeChain || (!controllerError && !!controllerId));

    return (
      <Modal className="staking--Bonding" header={"Bonding Preferences"} open size="small">
        <Modal.Content className="ui--signer-Signer-Content">
          <InputAddress
            className="medium"
            label={"stash account"}
            onChange={this.onChangeStash}
            type="account"
            value={stashId}
          />
          <InputAddress
            className="medium"
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
            controllerId={controllerId}
            isUnsafeChain={isUnsafeChain}
            onError={this.onControllerError}
          />
          <InputBalanceBonded
            autoFocus
            className="medium"
            controllerId={controllerId}
            destination={destination}
            extrinsicProp={"dappsStaking.bond"}
            help={
              "The total amount of the stash balance that will be at stake in any forthcoming rounds (should be less than the total amount available)"
            }
            isError={!hasValue || !!amountError}
            label={"value bonded"}
            onChange={this.onChangeValue}
            onEnter={this.sendTx}
            stashId={stashId}
            withMax={!isUnsafeChain}
          />
          <InputValidateAmount accountId={stashId} onError={this.onAmountError} value={bondValue} />
          <Dropdown
            className="medium"
            defaultValue={0}
            help={"The destination account for any payments as either a nominator"}
            label={"payment destination"}
            onChange={this.onChangeDestination}
            options={rewardDestinationOptions}
            value={destination}
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
              label={"Bond"}
              icon="sign-in"
              onClick={onClose}
              extrinsic={extrinsic}
              ref={this.button}
            />
          </Button.Group>
        </Modal.Actions>
      </Modal>
    );
  }

  private nextState(newState: Partial<State>): void {
    this.setState(
      (prevState: State): State => {
        const { api } = this.props;
        const {
          amountError = prevState.amountError,
          bondValue = prevState.bondValue,
          controllerError = prevState.controllerError,
          controllerId = prevState.controllerId,
          destination = prevState.destination,
          stashId = prevState.stashId,
        } = newState;
        const extrinsic =
          bondValue && controllerId ? api.tx.dappsStaking.bond(controllerId, bondValue, destination) : null;

        return {
          amountError,
          bondValue,
          controllerError,
          controllerId,
          destination,
          extrinsic,
          stashId,
        };
      }
    );
  }

  private onAmountError = (amountError: string | null): void => {
    this.nextState({ amountError });
  };

  private onChangeController = (controllerId: string | null): void => {
    this.nextState({ controllerId });
  };

  private onChangeDestination = (destination: number): void => {
    this.nextState({ destination });
  };

  private onChangeStash = (stashId: string | null): void => {
    this.nextState({ stashId });
  };

  private onChangeValue = (bondValue?: BN): void => {
    this.nextState({ bondValue });
  };

  private onControllerError = (controllerError: string | null): void => {
    this.setState({ controllerError });
  };
}

export default withMulti(NewStake, withApi);
