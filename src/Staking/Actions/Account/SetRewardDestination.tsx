import React from "react";
import { Dropdown, InputAddress, Modal, TxButton, TxComponent } from "@polkadot/react-components";
import { withMulti } from "@polkadot/react-api/hoc";

import { rewardDestinationOptions } from "../constants";

interface Props {
  defaultDestination?: number;
  controllerId: string;
  onClose: () => void;
}

interface State {
  destination: number;
}

class SetRewardDestination extends TxComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      destination: 0,
    };
  }

  public render(): React.ReactNode {
    const { controllerId, onClose } = this.props;
    const { destination } = this.state;
    const canSubmit = !!controllerId;

    return (
      <Modal className="staking--Bonding" header={"Bonding Preferences"} open size="small">
        {this.renderContent()}
        <Modal.Actions onCancel={onClose}>
          <TxButton
            accountId={controllerId}
            isDisabled={!canSubmit}
            isPrimary
            label={"Set reward destination"}
            icon="sign-in"
            onClick={onClose}
            params={[destination]}
            tx={"dappsStaking.setPayee"}
            ref={this.button}
          />
        </Modal.Actions>
      </Modal>
    );
  }

  private renderContent(): React.ReactNode {
    const { controllerId, defaultDestination } = this.props;
    const { destination } = this.state;

    return (
      <Modal.Content className="ui--signer-Signer-Content">
        <InputAddress
          className="medium"
          isDisabled
          defaultValue={controllerId}
          help={
            "The controller is the account that is be used to control any nominating or validating actions. I will sign this transaction."
          }
          label={"controller account"}
        />
        <Dropdown
          className="medium"
          defaultValue={defaultDestination}
          help={"The destination account for any payments as either a nominator or validator"}
          label={"payment destination"}
          onChange={this.onChangeDestination}
          options={rewardDestinationOptions}
          value={destination}
        />
      </Modal.Content>
    );
  }

  private onChangeDestination = (destination: number): void => {
    this.setState({ destination });
  };
}

export default withMulti(SetRewardDestination);
