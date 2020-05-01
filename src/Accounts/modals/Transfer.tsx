import { SubmittableExtrinsic } from "@polkadot/api/promise/types";

import BN from "bn.js";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { InputAddress, InputBalance, Modal, TxButton } from "@polkadot/react-components";
import { useApi } from "@polkadot/react-hooks";
import { Available } from "@polkadot/react-query";

interface Props {
  className?: string;
  onClose: () => void;
  recipientId?: string;
  senderId?: string;
}

const ZERO = new BN(0);

function Transfer({
  className,
  onClose,
  recipientId: propRecipientId,
  senderId: propSenderId,
}: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [amount, setAmount] = useState<BN | undefined>(new BN(0));
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic | null>(null);
  const [hasAvailable] = useState(true);
  const [maxBalance] = useState(new BN(0));
  const [recipientId, setRecipientId] = useState<string | null>(propRecipientId || null);
  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);

  useEffect((): void => {
    if (senderId && recipientId) {
      setExtrinsic(api.tx.balances.transfer(recipientId, amount || ZERO));
    }
  }, [amount, recipientId, senderId]);

  const transferrable = <span className="label">{"transferrable"}</span>;

  return (
    <Modal className="app--accounts-Modal" header={"Send funds"}>
      <Modal.Content>
        <div className={className}>
          <InputAddress
            defaultValue={propSenderId}
            help={"The account you will send funds from."}
            isDisabled={!!propSenderId}
            label={"send from account"}
            labelExtra={<Available label={transferrable} params={senderId} />}
            onChange={setSenderId}
            type="account"
          />
          <InputAddress
            defaultValue={propRecipientId}
            help={"Select a contact or paste the address you want to send funds to."}
            isDisabled={!!propRecipientId}
            label={"send to address"}
            labelExtra={<Available label={transferrable} params={recipientId} />}
            onChange={setRecipientId}
            type="allPlus"
          />
          <InputBalance
            autoFocus
            help={
              "Type the amount you want to transfer. Note that you can select the unit on the right e.g sending 1 milli is equivalent to sending 0.001."
            }
            isError={!hasAvailable}
            isZeroable
            label={"amount"}
            maxValue={maxBalance}
            onChange={setAmount}
            withMax
          />
        </div>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={senderId}
          extrinsic={extrinsic}
          icon="send"
          isDisabled={!hasAvailable}
          isPrimary
          label={"Make Transfer"}
          onStart={onClose}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(Transfer)`
  article.padded {
    box-shadow: none;
    margin-left: 2rem;
  }

  .balance {
    margin-bottom: 0.5rem;
    text-align: right;
    padding-right: 1rem;

    .label {
      opacity: 0.7;
    }
  }

  label.with-help {
    flex-basis: 10rem;
  }
`;
