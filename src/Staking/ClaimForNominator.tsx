import { SubmittableExtrinsic } from "@polkadot/api/promise/types";
import { Props as BaseProps } from "../types";
import { Option, u32 } from "@polkadot/types";

import React, { useState, useEffect } from "react";
import { InputAddress, Modal, TxButton, Button, Dropdown } from "@polkadot/react-components";
import { useApi, useCall } from "@polkadot/react-hooks";
import { EraIndex } from "@polkadot/types/interfaces";

interface Props extends BaseProps {
  className?: string;
  isVisible: boolean;
}

function ClaimForNominator({ className, isVisible }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [extrinsic, setExtrinsic] = useState<SubmittableExtrinsic | null>(null);
  const [hasAvailable, setHasAvailable] = useState(true);
  const [senderId, setSenderId] = useState<string | null>(null);
  const currentEra = useCall<Option<EraIndex>>(api.query.plasmRewards.currentEra, [])?.unwrap()?.toNumber() ?? 0;
  const [era, setEra] = useState<number>(currentEra);
  const historyDepth = useCall<u32>(api.query.plasmRewards.historyDepth, [])?.toNumber() ?? 1;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const _toggleModal = (): void => setIsModalOpen(!isModalOpen);

  // [n, m)
  const range = (n, m): number[] => {
    return n >= m ? [] : [n].concat(range(n + 1, m));
  };
  const oldestEra = Math.max(0, currentEra - historyDepth);
  const eraOptions = range(oldestEra, currentEra).map((era) => {
    return {
      key: era,
      text: era,
      value: era,
    };
  });

  useEffect((): void => {
    if (senderId && oldestEra <= era && era <= currentEra) {
      setExtrinsic(api.tx.dappsStaking.claimForNominator(era));
      setHasAvailable(true);
    } else {
      setHasAvailable(false);
    }
  }, [senderId, era]);

  return (
    <div className={`${className} ${!isVisible && "staking--hidden"}`}>
      <Button isPrimary key="claim-for-nominator" label={"Claim"} icon="add" onClick={_toggleModal} />
      {isModalOpen && (
        <Modal dimmer="inverted" open>
          <Modal.Header>{"Claim for nominator"}</Modal.Header>
          <Modal.Content>
            <InputAddress defaultValue={senderId} help={""} label={"Nominator"} onChange={setSenderId} type="allPlus" />
            <Dropdown
              defaultValue={currentEra}
              help={""}
              label={"Era"}
              onChange={setEra}
              options={eraOptions}
              value={era}
            />
          </Modal.Content>
          <Modal.Actions onCancel={_toggleModal}>
            <TxButton
              accountId={senderId}
              extrinsic={extrinsic}
              icon="send"
              isDisabled={!hasAvailable}
              isPrimary
              label={"Claim"}
              onStart={_toggleModal}
              withSpinner
            />
          </Modal.Actions>
        </Modal>
      )}
    </div>
  );
}

export default ClaimForNominator;
