import React from "react";
import { createType } from "@polkadot/types";
import { registry } from "@polkadot/react-api";
import { Button, Input } from "@polkadot/react-components";

import ContractModal, { ContractModalProps as Props, ContractModalState } from "../Modal";
import ValidateCode from "./ValidateCode";
import store from "../store";

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
      codeHash: "",
      isBusy: false,
      isCodeValid: false,
    };
    this.state = this.defaultState;
    this.headerText = "Add an existing code hash";
  }

  protected renderContent = (): React.ReactNode => {
    const { codeHash, isBusy, isCodeValid } = this.state;

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
        {this.renderInputAbi()}
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
