import React, { useState } from "react";
import { InputAddress, Modal, TxButton } from "@polkadot/react-components";

interface Props {
  address: string;
  className?: string;
  onClose: () => void;
}

export default function RecoverAccount({ address, className, onClose }: Props): React.ReactElement {
  const [recover, setRecover] = useState<string | null>(null);

  return (
    <Modal className={className} header={"Initiate account recovery"}>
      <Modal.Content>
        <InputAddress isDisabled label={"the account to recover to"} value={address} />
        <InputAddress
          help={"Select the account you wish to recover into this account."}
          label={"recover this account"}
          onChange={setRecover}
          type="allPlus"
        />
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={address}
          icon="recycle"
          isDisabled={!recover || recover === address}
          label={"Start recovery"}
          onStart={onClose}
          params={[recover]}
          tx="recovery.initiateRecovery"
        />
      </Modal.Actions>
    </Modal>
  );
}
