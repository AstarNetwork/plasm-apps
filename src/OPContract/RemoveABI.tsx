import { CodeStored } from "./types";

import React from "react";
import { Button, CodeRow, Modal } from "@polkadot/react-components";

interface Props {
  code: CodeStored;
  onClose: () => void;
  onRemove: () => void;
}

function RemoveABI({ code, onClose, onRemove }: Props): React.ReactElement<Props> {
  const _onRemove = (): void => {
    onClose && onClose();
    onRemove();
  };
  return (
    <Modal className="app--accounts-Modal" dimmer="inverted" onClose={onClose} open>
      <Modal.Header>{"Confirm ABI removal"}</Modal.Header>
      <Modal.Content>
        <CodeRow code={code} isInline>
          <p>
            {
              "You are about to remove this code's ABI. Once completed, should you need to access it again, you will have to manually re-upload it."
            }
          </p>
          <p>{"This operation does not impact the associated on-chain code or any of its contracts."}</p>
        </CodeRow>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <Button.Group>
          <Button isNegative onClick={onClose} label={"Cancel"} icon="cancel" />
          <Button.Or />
          <Button isPrimary onClick={_onRemove} label={"Remove"} icon="trash" />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
}

export default RemoveABI;
