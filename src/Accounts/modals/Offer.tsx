import { SubmittableExtrinsic } from "@polkadot/api/promise/types";

import BN from "bn.js";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  AddressMini,
  Toggle,
  InputAddress,
  InputNumber,
  Modal,
  TxButton,
  InputBalance,
} from "@polkadot/react-components";
import { useApi } from "@polkadot/react-hooks";
import { registry } from "@polkadot/react-api";
import { Available } from "@polkadot/react-query";
import { Vec } from "@polkadot/types";

import AccountId from "@polkadot/types/generic/AccountId";
import { Codec } from "@polkadot/types/types";

const Candidates = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .candidate {
    border: 1px solid #eee;
    border-radius: 0.25rem;
    margin: 0.25rem;
    padding-bottom: 0.25rem;
    padding-right: 0.5rem;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      border-color: transparent;
      border-style: solid;
      border-radius: 0.25em;
      border-width: 0.25em;
    }

    &.isAye {
      background: #fff;
      border-color: #ccc;
    }

    &.member::after {
      border-color: green;
    }

    &.runnerup::after {
      border-color: steelblue;
    }

    .ui--AddressMini-icon {
      z-index: 1;
    }

    .candidate-right {
      text-align: right;
    }
  }
`;

interface Props {
  className?: string;
  onClose: () => void;
  buyerId?: string;
  senderId?: string;
}

function Offer({ className, onClose, senderId: propSenderId, buyerId: propBuyerId }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic | null>(null);
  const [hasAvailable, setHasAvailable] = useState(true);
  const [buyerId, setBuyerId] = useState<string | null>(propBuyerId || null);
  const [contracts, setContracts] = useState<string[]>([]);
  const [selects, setSelects] = useState<Record<string, boolean>>(
    contracts.reduce((obj, contract): Record<string, boolean> => Object.assign(obj, { [contract]: false }), {})
  );
  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);

  const [amount, setAmount] = useState<BN | undefined>(new BN(0));
  const [expired, setExpired] = useState<BN | undefined>();

  const onOffer = (accountId: string | null): void => {
    setSenderId(accountId);
    if (accountId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      api.query.operator.operatorHasContracts<AccountId[] & Codec>(accountId as any).then((contracts): void => {
        const contractList: string[] = contracts.map((c): string => c.toString());
        setContracts(contractList);
        setSelects(
          contractList.reduce((obj, contract): Record<string, boolean> => Object.assign(obj, { [contract]: false }), {})
        );
      });
    }
  };

  const onChangeContracts = (accountId: string): ((isChecked: boolean) => void) => (isChecked: boolean): void => {
    setSelects({ ...selects, [accountId]: isChecked });
  };

  useEffect((): void => {
    const _ok = Object.values(selects).some((select): boolean => select);
    if (buyerId && senderId && _ok) {
      setExtrinsic(
        api.tx.trading.offer(
          senderId,
          new Vec(
            registry,
            AccountId,
            Object.entries(selects)
              .filter(([, select]): boolean => select)
              .map(([contractId]): string => contractId)
          ),
          amount,
          expired
        )
      );
      setHasAvailable(true);
    } else {
      setHasAvailable(false);
    }
  }, [selects, senderId, buyerId]);

  const transferrable = <span className="label">{"transferrable"}</span>;

  return (
    <Modal className="app--accounts-Modal" dimmer="inverted" open>
      <Modal.Header>{"Offer"}</Modal.Header>
      <Modal.Content>
        <div className={className}>
          <InputAddress
            defaultValue={propBuyerId}
            help={"The account is the buyer will buy operator authorship."}
            isDisabled={!!propBuyerId}
            label={"the buyer accont"}
            labelExtra={<Available label={transferrable} params={buyerId} />}
            onChange={setBuyerId}
            type="account"
          />
          <Candidates>
            {contracts.map(
              (contractId): React.ReactNode => {
                const key = contractId.toString();
                const isAye = selects[key] || false;
                return (
                  <AddressMini
                    className={`candidate ${isAye ? "isAye" : "isNay"} members}`}
                    key={key}
                    value={contractId}
                  >
                    <div className="candidate-right">
                      <Toggle label={isAye ? "Aye" : "Nay"} onChange={onChangeContracts(key)} value={isAye} />
                    </div>
                  </AddressMini>
                );
              }
            )}
          </Candidates>
          <InputAddress
            defaultValue={propSenderId}
            isDisabled={!!propSenderId}
            help={"Select a the current operator address you want to trade with."}
            label={"sebder address"}
            labelExtra={<Available label={transferrable} params={senderId} />}
            onChange={onOffer}
            type="allPlus"
          />
          <InputBalance
            autoFocus
            help={
              "Type the amount you want to trade. Note that you can select the unit on the right e.g sending 1 milli is equivalent to sending 0.001."
            }
            isError={!hasAvailable}
            isZeroable
            label={"amount"}
            onChange={setAmount}
          />
          <InputNumber
            help={"The expired blockNumber."}
            isError={!expired}
            isZeroable
            label={"expired block number"}
            onChange={setExpired}
          />
        </div>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={buyerId}
          extrinsic={extrinsic}
          icon="send"
          isDisabled={!hasAvailable}
          isPrimary
          label={"Offer"}
          onStart={onClose}
          withSpinner
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(Offer)`
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
