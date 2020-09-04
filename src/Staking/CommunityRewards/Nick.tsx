import React from "react";
import { Input, InputAddress, TxButton, TxComponent, Modal } from "@polkadot/react-components";
import { ApiPromise } from "@polkadot/api";

const NICK_MIN_LENGTH = 4;
const NICK_MAX_LENGTH = 32;

interface Props {
  api: ApiPromise;
  onSuccess?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface State {
  isBusy?: boolean;
  isNickValid: boolean;
  nick: string | null;
  accountId?: string | null;
}

class Nick extends TxComponent<Props, State> {
  protected defaultState: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      isBusy: false,
      isNickValid: false,
      nick: null,
    };
    this.defaultState = this.state;
  }

  public render(): React.ReactNode {
    const { isOpen } = this.props;
    const { isBusy, isNickValid, nick } = this.state;

    return (
      <>
        <Modal header={"Add nickname to your address"} onClose={this.onClose} open={isOpen}>
          <Modal.Content>
            {this.renderInputAccount()}
            <Input
              autoFocus
              help={`Nickname of the target address. The length of the nickname must be between ${NICK_MIN_LENGTH} and ${NICK_MAX_LENGTH} characters.`}
              isDisabled={isBusy}
              isError={!isNickValid}
              label={"nickname"}
              onChange={this.onChangeNick}
              onEnter={this.submit}
              value={nick}
            />
          </Modal.Content>
          <Modal.Actions onCancel={this.onClose}>{this.renderButtons()}</Modal.Actions>
        </Modal>
      </>
    );
  }

  protected renderInputAccount(): React.ReactNode {
    const { accountId, isBusy } = this.state;

    return (
      <InputAddress
        help={"Specify the account to be named."}
        isDisabled={isBusy}
        isInput={false}
        label={"account to be named"}
        onChange={this.onChangeAccount}
        type="account"
        value={accountId}
      />
    );
  }

  protected renderButtons = (): React.ReactNode => {
    const { isBusy, isNickValid, nick, accountId } = this.state;
    const isValid = !isBusy && isNickValid && accountId;

    const { api } = this.props;

    return (
      <TxButton
        accountId={accountId}
        icon="cloud upload"
        isDisabled={!isValid}
        isPrimary
        label={"Set nickname"}
        onClick={this.toggleBusy(true)}
        onFailed={this.toggleBusy(false)}
        onSuccess={this.onSuccess}
        params={[nick]}
        tx={api.tx.nicks.setName && "nicks.setName"}
        ref={this.button}
        withSpinner
      />
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onSuccess = (): void => {
    const { onSuccess } = this.props;
    onSuccess && onSuccess();
    this.onClose();
  };

  protected onChangeAccount = (accountId: string | null): void => {
    this.setState({ accountId });
  };

  protected onChangeNick = (nick: string): void => {
    const isNickValid = NICK_MIN_LENGTH <= nick.length && nick.length <= NICK_MAX_LENGTH;
    this.setState({ nick, isNickValid });
  };

  protected toggleBusy = (isBusy?: boolean): (() => void) => (): void => {
    this.setState(
      (state: State): State => {
        return ({
          isBusy: isBusy === undefined ? !state.isBusy : isBusy,
        } as unknown) as State;
      }
    );
  };

  protected reset = (): void => {
    this.setState(this.defaultState);
  };

  protected onClose = (): void => {
    const { onClose } = this.props;

    onClose && onClose();
    this.setState({ isBusy: false });
    this.reset();
  };
}

export default Nick;
