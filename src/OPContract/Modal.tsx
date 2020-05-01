import BN from "bn.js";
import React from "react";
import { Abi } from "@polkadot/api-contract";
import { Input, InputAddress, InputNumber, Modal, TxComponent } from "@polkadot/react-components";

import ABI from "./ABI";

export interface ContractModalProps {
  basePath: string;
  isNew?: boolean;
  isOpen: boolean;
  onClose?: () => void;
}

export interface ContractModalState {
  abi?: string | null;
  accountId?: string | null;
  contractAbi?: Abi | null;
  gasLimit: BN;
  isAbiSupplied: boolean;
  isAbiValid: boolean;
  isBusy: boolean;
  isNameValid: boolean;
  name?: string | null;
  tags: string[];
}

class ContractModal<P extends ContractModalProps, S extends ContractModalState> extends TxComponent<P, S> {
  protected defaultState: S = {
    accountId: null,
    gasLimit: new BN(0),
    isAbiSupplied: false,
    isAbiValid: false,
    isBusy: false,
    isNameValid: false,
    name: null,
    tags: [] as string[],
  } as S;

  public state: S = this.defaultState;

  protected isContract?: boolean;

  public render(): React.ReactNode {
    const { isOpen } = this.props;

    return (
      <Modal className="app--contracts-Modal" header={this.headerText} onClose={this.onClose} open={isOpen}>
        <Modal.Content>{this.renderContent()}</Modal.Content>
        <Modal.Actions onCancel={this.onClose}>{this.renderButtons()}</Modal.Actions>
      </Modal>
    );
  }

  protected headerText = "";

  protected renderContent: () => React.ReactNode | null = (): React.ReactNode => null;

  protected renderButtons: () => React.ReactNode | null = (): React.ReactNode => null;

  protected renderInputAbi(): React.ReactNode {
    const { isBusy } = this.state;

    return (
      <ABI
        help={
          this.isContract
            ? "The ABI for the WASM code. Since we will be making a call into the code, the ABI is required and stored for future operations such as sending messages."
            : "The ABI for the WASM code. In this step it is optional, but setting it here simplifies the setup of contract instances."
        }
        label={this.isContract ? "contract ABI" : "contract ABI (optional)"}
        onChange={this.onAddAbi}
        isDisabled={isBusy}
        isRequired={this.isContract}
      />
    );
  }

  protected renderInputAccount(): React.ReactNode {
    const { accountId, isBusy } = this.state;

    return (
      <InputAddress
        help={"Specify the user account to use for this deployment. And fees will be deducted from this account."}
        isDisabled={isBusy}
        isInput={false}
        label={"deployment account"}
        onChange={this.onChangeAccount}
        type="account"
        value={accountId}
      />
    );
  }

  protected renderInputName(): React.ReactNode {
    const { isNew } = this.props;
    const { isBusy, isNameValid, name } = this.state;

    return (
      <Input
        help={
          this.isContract
            ? "A name for the deployed contract to help users distinguish. Only used for display purposes."
            : "A name for this WASM code to help users distinguish. Only used for display purposes."
        }
        isDisabled={isBusy}
        isError={!isNameValid}
        label={this.isContract ? "contract name" : "code bundle name"}
        onChange={this.onChangeName}
        onEnter={this[isNew ? "sendTx" : "submit"]}
        value={name || ""}
      />
    );
  }

  protected renderInputGas(): React.ReactNode {
    const { gasLimit, isBusy } = this.state;
    const isGasValid = !gasLimit.isZero();

    return (
      <InputNumber
        help={
          "The maximum amount of gas that can be used by this deployment, if the code requires more, the deployment will fail."
        }
        isDisabled={isBusy}
        isError={!isGasValid}
        label={"maximum gas allowed"}
        onChange={this.onChangeGas}
        onEnter={this.sendTx}
        value={gasLimit || ""}
      />
    );
  }

  protected reset = (): void => {
    this.setState(this.defaultState);
  };

  protected toggleBusy = (isBusy?: boolean): (() => void) => (): void => {
    this.setState(
      (state: S): S => {
        return ({
          isBusy: isBusy === undefined ? !state.isBusy : isBusy,
        } as unknown) as S;
      }
    );
  };

  protected onClose = (): void => {
    const { onClose } = this.props;
    const { isBusy } = this.state;

    onClose && onClose();
    if (!isBusy) {
      this.reset();
    }
  };

  protected onAddAbi = (
    abi: string | null | undefined,
    contractAbi: Abi | null = null,
    isAbiSupplied = false
  ): void => {
    this.setState({ abi, contractAbi, isAbiSupplied, isAbiValid: !!abi });
  };

  protected onChangeAccount = (accountId: string | null): void => {
    this.setState({ accountId });
  };

  protected onChangeName = (name: string): void => {
    this.setState({ name, isNameValid: name.length !== 0 });
  };

  protected onChangeGas = (gasLimit: BN | undefined): void => {
    this.setState({ gasLimit: gasLimit || new BN(0) });
  };
}

export default ContractModal;
