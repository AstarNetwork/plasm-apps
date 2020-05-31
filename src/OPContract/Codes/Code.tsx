import { CodeStored } from "../types";

import React from "react";
import styled from "styled-components";
import { RouteComponentProps } from "react-router";
import { withRouter } from "react-router-dom";
import { Button, Card, CodeRow, Forget } from "@polkadot/react-components";

import ABI from "../ABI";
import RemoveABI from "../RemoveABI";

import contracts from "../store";

interface Props extends RouteComponentProps<{}> {
  code: CodeStored;
  showDeploy: (codeHash?: string, constructorIndex?: number) => () => void;
}

interface State {
  isAbiOpen: boolean;
  isForgetOpen: boolean;
  isRemoveABIOpen: boolean;
}

const CodeCard = styled(Card)`
  && {
    max-width: 100%;
    min-width: 100%;
  }
`;

class Code extends React.PureComponent<Props, State> {
  public state: State = {
    isAbiOpen: false,
    isForgetOpen: false,
    isRemoveABIOpen: false,
  };

  public render(): React.ReactNode {
    const {
      code,
      code: { contractAbi },
    } = this.props;
    const { isAbiOpen } = this.state;

    const abi = (
      <ABI
        contractAbi={contractAbi}
        onChange={this.onChangeABI}
        onRemove={this.toggleRemoveABI}
        onSelectConstructor={this.onDeployConstructor}
      />
    );

    return (
      <CodeCard>
        {this.renderModals()}
        <CodeRow buttons={this.renderButtons()} code={code} isEditable withTags>
          {contractAbi ? (
            <details onClick={this.toggleAbi} open={isAbiOpen}>
              <summary>{"ABI"}</summary>
              {abi}
            </details>
          ) : (
            abi
          )}
        </CodeRow>
      </CodeCard>
    );
  }

  private renderButtons(): React.ReactNode {
    const {
      code: {
        json: { codeHash },
      },
      showDeploy,
    } = this.props;

    return (
      <>
        <Button isNegative onClick={this.toggleForget} icon="trash" size="small" tooltip={"Forget this code hash"} />
        <Button
          icon="cloud upload"
          isPrimary
          label={"deploy"}
          onClick={showDeploy(codeHash)}
          size="small"
          tooltip={"Deploy this code hash as a smart contract"}
        />
      </>
    );
  }

  private renderModals(): React.ReactNode {
    const { code } = this.props;
    const { isForgetOpen, isRemoveABIOpen } = this.state;

    if (!code) {
      return null;
    }

    const modals: JSX.Element[] = [];

    if (isForgetOpen) {
      modals.push(
        <Forget
          code={code}
          key="modal-forget-account"
          mode="code"
          onClose={this.toggleForget}
          onForget={this.onForget}
        />
      );
    }

    if (isRemoveABIOpen) {
      modals.push(
        <RemoveABI code={code} key="modal-remove-abi" onClose={this.toggleRemoveABI} onRemove={this.onChangeABI} />
      );
    }

    return modals;
  }

  private toggleAbi = (event: React.MouseEvent): (() => void) => {
    return (): void => {
      event.preventDefault();
      const { isAbiOpen } = this.state;

      this.setState({
        isAbiOpen: !isAbiOpen,
      });
    };
  };

  private toggleForget = (): void => {
    const { isForgetOpen } = this.state;

    this.setState({
      isForgetOpen: !isForgetOpen,
    });
  };

  private toggleRemoveABI = (): void => {
    const { isRemoveABIOpen } = this.state;

    this.setState({
      isRemoveABIOpen: !isRemoveABIOpen,
    });
  };

  private onDeployConstructor = (constructorIndex = 0): void => {
    const {
      code: {
        json: { codeHash },
      },
      showDeploy,
    } = this.props;

    codeHash && showDeploy && showDeploy(codeHash, constructorIndex)();
  };

  private onForget = (): void => {
    const {
      code: {
        json: { codeHash },
      },
    } = this.props;

    if (!codeHash) {
      return;
    }

    try {
      contracts.forgetCode(codeHash);
    } catch (error) {
      console.error(error);
    } finally {
      this.toggleForget();
    }
  };

  private onChangeABI = (abi: string | null = null): void => {
    const {
      code: {
        json: { codeHash },
      },
    } = this.props;

    this.setState({ isAbiOpen: true }, (): void => {
      contracts.saveCode(codeHash, { abi });
    });
  };
}

export default withRouter(Code);
