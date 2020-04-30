import React from "react";
import { AddressRow, Button, Modal } from "@polkadot/react-components";

interface Props {
  address: string;
  name: string;
  onClose: () => void;
  onCommit: () => void;
}

export default function CreateConfirmation({
  address,
  name,
  onClose,
  onCommit,
}: Props): React.ReactElement<Props> | null {
  return (
    <Modal header={"Important notice"}>
      <Modal.Content>
        <AddressRow defaultName={name} isInline noDefaultNameOpacity value={address}>
          <p>
            {
              'We will provide you with a generated backup file after your account is created. As long as you have access to your account you can always download this file later by clicking on "Backup" button from the Accounts section.'
            }
          </p>
          <p>
            {
              "Please make sure to save this file in a secure location as it is required, together with your password, to restore your account."
            }
          </p>
        </AddressRow>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <Button icon="plus" isPrimary label={"Create and backup account"} onClick={onCommit} />
      </Modal.Actions>
    </Modal>
  );
}
