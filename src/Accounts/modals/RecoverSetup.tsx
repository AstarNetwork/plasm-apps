import BN from "bn.js";
import React, { useEffect, useState } from "react";
import { InputAddressMulti, InputAddress, InputNumber, Modal, TxButton } from "@polkadot/react-components";
import { useAccounts, useAddresses } from "@polkadot/react-hooks";

interface Props {
  address: string;
  className?: string;
  onClose: () => void;
}

const MAX_HELPERS = 16;

export default function RecoverSetup({ address, className, onClose }: Props): React.ReactElement {
  const { allAccounts } = useAccounts();
  const { allAddresses } = useAddresses();
  const [availableHelpers, setAvailableHelpers] = useState<string[]>([]);
  const [delay, setDelay] = useState<BN | undefined>();
  const [helpers, setHelpers] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<BN | undefined>();

  useEffect((): void => {
    if (allAccounts && allAddresses) {
      setAvailableHelpers([...allAccounts, ...allAddresses].filter((a): boolean => a !== address));
    }
  }, [address, allAccounts, allAddresses]);

  const isErrorDelay = !delay;
  const isErrorHelpers = !helpers.length;
  const isErrorThreshold = !threshold || !threshold.gtn(0) || threshold.gtn(helpers.length);

  return (
    <Modal className={className} header={"Setup account as recoverable"}>
      <Modal.Content>
        <InputAddress isDisabled label={"the account to make recoverable"} value={address} />
        <InputAddressMulti
          available={availableHelpers}
          help={`The addresses that are able to help in recovery. You can select up to ${MAX_HELPERS} trusted helpers.`}
          label={"trusted social recovery helpers"}
          onChange={setHelpers}
          maxCount={MAX_HELPERS}
          value={helpers}
        />
        <InputNumber
          help={"The threshold of vouches that is to be reached for the account to be recovered."}
          isError={isErrorThreshold}
          label={"recoverey threshold"}
          onChange={setThreshold}
        />
        <InputNumber
          help={"The delay between vouching and the availability of the recovered account."}
          isError={isErrorDelay}
          isZeroable
          label={"recoverey block delay"}
          onChange={setDelay}
        />
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={address}
          icon="share alternate"
          isDisabled={isErrorHelpers || isErrorThreshold || isErrorDelay}
          label={"Make recoverable"}
          onStart={onClose}
          params={[helpers, threshold, delay]}
          tx="recovery.createRecovery"
        />
      </Modal.Actions>
    </Modal>
  );
}
