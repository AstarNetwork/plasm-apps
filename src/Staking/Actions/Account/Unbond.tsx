/* eslint-disable @typescript-eslint/camelcase */
import { AccountId, StakingLedger } from "@polkadot/types/interfaces";
import { ApiProps } from "@polkadot/react-api/types";

import BN from "bn.js";
import React from "react";
import styled from "styled-components";
import { Option } from "@polkadot/types";
import { Button, InputAddress, InputBalance, Modal, TxButton, TxComponent } from "@polkadot/react-components";
import { withCalls, withApi, withMulti } from "@polkadot/react-api/hoc";

import AddressInfo from "../../../Accounts/AddressInfo";

interface Props extends ApiProps {
  controllerId?: AccountId | null;
  isOpen: boolean;
  onClose: () => void;
  stashId: string;
  staking_ledger?: Option<StakingLedger>;
}

interface State {
  maxBalance?: BN;
  maxUnbond?: BN;
}

const BalanceWrapper = styled.div`
  & > div {
    justify-content: flex-end;

    & .column {
      flex: 0;
    }
  }
`;

class Unbond extends TxComponent<Props, State> {
  public state: State = {};

  public componentDidUpdate(prevProps: Props): void {
    const { staking_ledger } = this.props;

    if (staking_ledger !== prevProps.staking_ledger) {
      this.setMaxBalance();
    }
  }

  public render(): React.ReactNode {
    const { controllerId, isOpen, onClose } = this.props;
    const { maxUnbond } = this.state;
    const canSubmit = !!maxUnbond && maxUnbond.gtn(0);

    if (!isOpen) {
      return null;
    }

    return (
      <Modal className="staking--Unbond" header={"Unbond funds"} open size="small">
        {this.renderContent()}
        <Modal.Actions onCancel={onClose}>
          <Button.Group>
            <Button isNegative onClick={onClose} label={"Cancel"} icon="cancel" />
            <Button.Or />
            <TxButton
              accountId={controllerId}
              isDisabled={!canSubmit}
              isPrimary
              label={"Unbond"}
              icon="sign-out"
              onClick={onClose}
              params={[maxUnbond]}
              tx="dappsStaking.unbond"
              ref={this.button}
            />
          </Button.Group>
        </Modal.Actions>
      </Modal>
    );
  }

  private renderContent(): React.ReactNode {
    const { controllerId, stashId } = this.props;
    const { maxBalance } = this.state;

    return (
      <Modal.Content className="ui--signer-Signer-Content">
        <InputAddress className="medium" defaultValue={controllerId} isDisabled label={"controller account"} />
        <BalanceWrapper>
          <AddressInfo
            accountId={stashId}
            withBalance={{
              bonded: true,
            }}
          />
        </BalanceWrapper>
        <InputBalance
          autoFocus
          className="medium"
          help={"The amount of funds to unbond, this is adjusted using the bonded funds on the stash account."}
          label={"unbond amount"}
          maxValue={maxBalance}
          onChange={this.onChangeValue}
          onEnter={this.sendTx}
          withMax
        />
      </Modal.Content>
    );
  }

  private nextState(newState: Partial<State>): void {
    this.setState(
      (prevState: State): State => {
        const { maxUnbond = prevState.maxUnbond, maxBalance = prevState.maxBalance } = newState;

        return {
          maxUnbond,
          maxBalance,
        };
      }
    );
  }

  private setMaxBalance = (): void => {
    const { staking_ledger } = this.props;

    if (!staking_ledger || staking_ledger.isNone) {
      return;
    }

    const { active } = staking_ledger.unwrap();

    this.nextState({
      maxBalance: active.unwrap(),
    });
  };

  private onChangeValue = (maxUnbond?: BN): void => {
    this.nextState({ maxUnbond });
  };
}

export default withMulti(
  Unbond,
  withApi,
  withCalls<Props>(["query.dappsStaking.ledger", { paramName: "controllerId" }])
);
