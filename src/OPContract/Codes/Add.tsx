import React from "react";
import { createType } from "@polkadot/types";
import { registry } from "@polkadot/react-api";
import { Button, Input } from "@polkadot/react-components";
import { Abi } from "@polkadot/api-contract";

import ContractModal, { ContractModalProps, ContractModalState } from "../Modal";
import ValidateCode from "./ValidateCode";
import store from "../store";

interface Props extends ContractModalProps {
  codeHash?: string;
  contractAbi?: Abi;
  onSuccess?: () => void;
}

interface State extends ContractModalState {
  codeHash: string;
  isBusy: boolean;
  isCodeValid: boolean;
}

class Add extends ContractModal<Props, State> {
  constructor(props: Props) {
    super(props);
    this.defaultState = {
      ...this.defaultState,
      codeHash: props.codeHash ?? "",
      contractAbi: props.contractAbi,
      isBusy: false,
      isCodeValid: false,
    };
    this.state = this.defaultState;
    this.headerText = "Add an existing code hash";
    if (props.onSuccess) {
      this.onSuccess = props.onSuccess;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onSuccess = (): void => {};

  protected renderContent = (): React.ReactNode => {
    const { codeHash, contractAbi, isBusy, isCodeValid } = this.state;

    return (
      <>
        <Input
          autoFocus
          help={"The code hash for the on-chain deployed code."}
          isDisabled={isBusy}
          isError={!isCodeValid}
          label={"code hash"}
          onChange={this.onChangeHash}
          onEnter={this.submit}
          value={codeHash}
        />
        <ValidateCode codeHash={codeHash} onChange={this.onValidateCode} />
        {this.renderInputName()}
        {contractAbi ? this.renderInputAbi(contractAbi) : this.renderInputAbi()}
      </>
    );
  };

  protected renderButtons = (): React.ReactNode => {
    const { isBusy, isCodeValid, isNameValid } = this.state;
    const isValid = !isBusy && isCodeValid && isNameValid;

    return (
      <Button icon="save" isDisabled={!isValid} isPrimary label={"Save"} onClick={this.onSave} ref={this.button} />
    );
  };

  private onChangeHash = (codeHash: string): void => {
    this.setState({ codeHash, isCodeValid: false });
  };

  private onValidateCode = (isCodeValid: boolean): void => {
    this.setState({ isCodeValid });
  };

  private onSave = (): void => {
    const { abi, codeHash, name, tags } = this.state;

    if (!codeHash || !name) {
      return;
    }

    this.setState({ isBusy: true }, (): void => {
      store
        .saveCode(createType(registry, "Hash", codeHash), { abi, name, tags })
        .then((): void => {
          this.onSuccess();
          this.setState({ isBusy: false }, (): void => this.onClose());
        })
        .catch((error): void => {
          console.error("Unable to save code", error);
          this.setState({ isBusy: false });
        });
    });
  };
}

export default Add;
