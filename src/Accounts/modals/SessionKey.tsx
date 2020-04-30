import { SubmittableExtrinsic } from "@polkadot/api/promise/types";
import { registry } from "@polkadot/react-api";
import { Vec, u8 } from "@polkadot/types";

import React, { useEffect, useState } from "react";
import { Button, InputAddress, Input, Modal, TxButton } from "@polkadot/react-components";
import { useApi } from "@polkadot/react-hooks";

import { Props as BaseProps } from "../../types";

interface Props extends BaseProps {
  senderId?: string;
  onClose: () => void;
}

const EMPTY_PROOF = new Vec(registry, u8, []);

function SetSessionKey({ className, senderId: propSenderId, onClose }: Props): React.ReactElement<Props> | null {
  const { api } = useApi();
  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic | null>(null);
  const [keys, setKeys] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(true);

  useEffect((): void => {
    if (!!keys && /^0x[0-9a-f]+$/i.test(keys)) {
      try {
        setExtrinsic(api.tx.session.setKeys(keys as any, EMPTY_PROOF as any));
        setHasError(false);
      } catch {
        setHasError(true);
      }
    } else {
      setHasError(true);
    }
  }, [keys]);

  return (
    <Modal className="session--SetSessionAccount" dimmer="inverted" open size="small">
      <Modal.Header>{"Set Session Key"}</Modal.Header>
      <Modal.Content className="ui--signer-Signer-Content">
        <div className={className}>
          <InputAddress className="medium" defaultValue={senderId} label={"account"} onChange={setSenderId} />
          <Input
            className="medium"
            help={
              "Changing the key only takes effect at the start of the next session. The input here is generates from the author_rotateKeys command"
            }
            isError={!keys}
            label={"Keys from rotateKeys"}
            onChange={setKeys}
          />
        </div>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <Button.Group>
          <Button isNegative onClick={onClose} label={"Cancel"} icon="cancel" />
          <Button.Or />
          <TxButton
            accountId={senderId}
            extrinsic={extrinsic}
            isDisabled={hasError && extrinsic}
            isPrimary
            label={"Set Session Key"}
            icon="sign-in"
            onStart={onClose}
          />
        </Button.Group>
      </Modal.Actions>
    </Modal>
  );
}

export default SetSessionKey;
