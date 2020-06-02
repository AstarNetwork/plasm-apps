import { Hash } from "@polkadot/types/interfaces";
import { ApiProps } from "@polkadot/react-api/types";

import React from "react";
import { SubmittableResult } from "@polkadot/api";
import { withApi, withMulti } from "@polkadot/react-api";
import { InputFile, TxButton } from "@polkadot/react-components";
import { compactAddLength } from "@polkadot/util";

import ContractModal, { ContractModalProps, ContractModalState } from "../Modal";
import store from "../store";

interface Props extends ContractModalProps, ApiProps {}

interface State extends ContractModalState {
  isWasmValid: boolean;
  wasm?: Uint8Array | null;
}

class Upload extends ContractModal<Props, State> {
  constructor(props: Props) {
    super(props);

    this.defaultState = {
      ...this.defaultState,
      isWasmValid: false,
      wasm: null,
    };
    this.state = this.defaultState;
    this.headerText = "Upload WASM";
  }

  protected renderContent = (): React.ReactNode => {
    const { isBusy, isWasmValid, wasm } = this.state;

    return (
      <>
        {this.renderInputAccount()}
        <InputFile
          help={
            "The compiled WASM for the contract that you wish to deploy. Each unique code blob will be attached with a code hash that can be used to create new instances."
          }
          isDisabled={isBusy}
          isError={!isWasmValid}
          label={"compiled contract WASM"}
          onChange={this.onAddWasm}
          placeholder={wasm && !isWasmValid ? "The code is not recognized as being in valid WASM format" : null}
        />
        {this.renderInputName()}
        {this.renderInputAbi()}
      </>
    );
  };

  protected renderButtons = (): React.ReactNode => {
    const { api } = this.props;
    const { accountId, isBusy, isNameValid, isWasmValid, wasm } = this.state;
    const isValid = !isBusy && accountId && isNameValid && isWasmValid && !!accountId;

    return (
      <TxButton
        accountId={accountId}
        icon="upload"
        isDisabled={!isValid}
        isPrimary
        label={"Upload"}
        onClick={this.toggleBusy(true)}
        onSuccess={this.onSuccess}
        onFailed={this.toggleBusy(false)}
        params={[wasm]}
        tx={api.tx.contracts ? "contracts.putCode" : "contract.putCode"}
        ref={this.button}
        withSpinner
      />
    );
  };

  private onAddWasm = (wasm: Uint8Array, name: string): void => {
    const isWasmValid = wasm.subarray(0, 4).toString() === "0,97,115,109"; // '\0asm'

    this.setState({ wasm: compactAddLength(wasm), isWasmValid });
    this.onChangeName(name);
  };

  private onSuccess = (result: SubmittableResult): void => {
    const { api } = this.props;

    this.setState(({ abi, name, tags }): Pick<State, never> | null => {
      const section = api.tx.contracts ? "contracts" : "contract";
      const record = result.findRecord(section, "CodeStored");

      if (record) {
        const codeHash = record.event.data[0];

        if (!codeHash || !name) {
          return null;
        }

        store
          .saveCode(codeHash as Hash, { abi, name, tags })
          .then((): void => this.onClose())
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((error: any): void => {
            console.error("Unable to save code", error);
          });
      }

      return { isBusy: false };
    });
  };
}

export default withMulti(Upload, withApi);
