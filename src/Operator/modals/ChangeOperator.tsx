import { SubmittableExtrinsic } from "@polkadot/api/promise/types";
import { Props as BaseProps } from "../../types";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AddressMini, Toggle, InputAddress, Modal, TxButton } from "@polkadot/react-components";
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

interface Props extends BaseProps {
  className?: string;
  onClose: () => void;
  recipientId?: string;
  senderId?: string;
}

function ChangeOperator({
  className,
  onClose,
  recipientId: propRecipientId,
  senderId: propSenderId,
}: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic | null>(null);
  const [hasAvailable, setHasAvailable] = useState(true);
  const [senderId, setSenderId] = useState<string | null>(propSenderId || null);
  const [contracts, setContracts] = useState<string[]>([]);
  const [selects, setSelects] = useState<Record<string, boolean>>(
    contracts.reduce((obj, contract): Record<string, boolean> => Object.assign(obj, { [contract]: false }), {})
  );
  const [recipientId, setRecipientId] = useState<string | null>(propRecipientId || null);

  const onChangeOperator = (accountId: string | null): void => {
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
    if (senderId && recipientId && _ok) {
      setExtrinsic(
        api.tx.operator.changeOperator(
          new Vec(
            registry,
            AccountId,
            Object.entries(selects)
              .filter(([, select]): boolean => select)
              .map(([contractId]): string => contractId)
          ),
          recipientId
        )
      );
      setHasAvailable(true);
    } else {
      setHasAvailable(false);
    }
  }, [selects, recipientId, senderId]);

  const transferrable = <span className="label">{"transferrable"}</span>;

  return (
    <Modal className="app--accounts-Modal" dimmer="inverted" open>
      <Modal.Header>{"Change operator"}</Modal.Header>
      <Modal.Content>
        <div className={className}>
          <InputAddress
            defaultValue={propSenderId}
            help={"The account you will change operator authorship."}
            isDisabled={!!propSenderId}
            label={"change from account"}
            labelExtra={<Available label={transferrable} params={senderId} />}
            onChange={onChangeOperator}
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
            defaultValue={propRecipientId}
            isDisabled={!!propRecipientId}
            help={"Select a the operator address you want to change to."}
            label={"new operator address"}
            labelExtra={<Available label={transferrable} params={recipientId} />}
            onChange={setRecipientId}
            type="allPlus"
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
          label={"ChangeOperator"}
          onStart={onClose}
          withSpinner
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(ChangeOperator)`
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
