import { Registration } from "@polkadot/types/interfaces";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Input, Modal, Toggle, TxButton } from "@polkadot/react-components";
import { getAddressMeta } from "@polkadot/react-components/util";
import { useApi, useCall } from "@polkadot/react-hooks";
import { Data, Option } from "@polkadot/types";
import { u8aToString } from "@polkadot/util";

interface Props {
  address: string;
  className?: string;
  onClose: () => void;
}

interface WrapProps {
  children: React.ReactNode;
  onChange: (isChecked: boolean) => void;
  value: boolean;
}

function setData(data: Data, setActive: null | ((isActive: boolean) => void), setVal: (val: string) => void): void {
  if (data.isRaw) {
    setActive && setActive(true);
    setVal(u8aToString(data.asRaw.toU8a(true)));
  }
}

function WrapToggle({ children, onChange, value }: WrapProps): React.ReactElement<WrapProps> {
  return (
    <div className="toggle-Wrap">
      {children}
      <Toggle
        className="toggle-Toggle"
        label={value ? "include value" : "exclude value"}
        onChange={onChange}
        value={value}
      />
    </div>
  );
}

function Identity({ address, className, onClose }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const identityOpt = useCall<Option<Registration>>(api.query.identity.identityOf, [address]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [info, setInfo] = useState<any>({});
  const [hasEmail, setHasEmail] = useState(false);
  const [hasLegal, setHasLegal] = useState(false);
  const [hasRiot, setHasRiot] = useState(false);
  const [hasTwitter, setHasTwitter] = useState(false);
  const [hasWeb, setHasWeb] = useState(false);
  const [valDisplay, setValDisplay] = useState(getAddressMeta(address).name || "");
  const [valEmail, setValEmail] = useState("");
  const [valLegal, setValLegal] = useState("");
  const [valRiot, setValRiot] = useState("");
  const [valTwitter, setValTwitter] = useState("");
  const [valWeb, setValWeb] = useState("");

  useEffect((): void => {
    if (identityOpt?.isSome) {
      const { info } = identityOpt.unwrap();

      setData(info.display, null, setValDisplay);
      setData(info.email, setHasEmail, setValEmail);
      setData(info.legal, setHasLegal, setValLegal);
      setData(info.riot, setHasRiot, setValRiot);
      setData(info.twitter, setHasTwitter, setValTwitter);
      setData(info.web, setHasWeb, setValWeb);
    }
  }, [identityOpt]);

  useEffect((): void => {
    setInfo({
      display: { [valDisplay ? "raw" : "none"]: valDisplay || null },
      email: { [hasEmail ? "raw" : "none"]: hasEmail ? valEmail : null },
      legal: { [hasLegal ? "raw" : "none"]: hasLegal ? valLegal : null },
      riot: { [hasRiot ? "raw" : "none"]: hasRiot ? valRiot : null },
      twitter: { [hasTwitter ? "raw" : "none"]: hasTwitter ? valTwitter : null },
      web: { [hasWeb ? "raw" : "none"]: hasWeb ? valWeb : null },
    });
  }, [hasEmail, hasLegal, hasRiot, hasTwitter, hasWeb, valDisplay, valEmail, valLegal, valRiot, valTwitter, valWeb]);

  return (
    <Modal className={className} header={"Register identity"}>
      <Modal.Content>
        <Input
          autoFocus
          help={"The name that will be displayed in your accounts list."}
          label={"display name"}
          onChange={setValDisplay}
          maxLength={32}
          value={valDisplay}
        />
        <WrapToggle onChange={setHasLegal} value={hasLegal}>
          <Input
            help={"The legal name for this identity."}
            isDisabled={!hasLegal}
            label={"legal name"}
            onChange={setValLegal}
            maxLength={32}
            value={hasLegal ? valLegal : "<none>"}
          />
        </WrapToggle>
        <WrapToggle onChange={setHasEmail} value={hasEmail}>
          <Input
            help={"The email address associated with this identity."}
            isDisabled={!hasEmail}
            label={"email"}
            onChange={setValEmail}
            maxLength={32}
            value={hasEmail ? valEmail : "<none>"}
          />
        </WrapToggle>
        <WrapToggle onChange={setHasWeb} value={hasWeb}>
          <Input
            help={"An URL that is linked to this identity."}
            isDisabled={!hasWeb}
            label={"web"}
            onChange={setValWeb}
            maxLength={32}
            value={hasWeb ? valWeb : "<none>"}
          />
        </WrapToggle>
        <WrapToggle onChange={setHasTwitter} value={hasTwitter}>
          <Input
            help={"The twitter name for this identity."}
            isDisabled={!hasTwitter}
            label={"twitter"}
            onChange={setValTwitter}
            value={hasTwitter ? valTwitter : "<none>"}
          />
        </WrapToggle>
        <WrapToggle onChange={setHasRiot} value={hasRiot}>
          <Input
            help={"a riot name linked to this identity"}
            isDisabled={!hasRiot}
            label={"riot name"}
            onChange={setValRiot}
            maxLength={32}
            value={hasRiot ? valRiot : "<none>"}
          />
        </WrapToggle>
      </Modal.Content>
      <Modal.Actions onCancel={onClose}>
        <TxButton
          accountId={address}
          icon="send"
          isPrimary
          label={"Set Identity"}
          onStart={onClose}
          params={[info]}
          tx="identity.setIdentity"
        />
      </Modal.Actions>
    </Modal>
  );
}

export default styled(Identity)`
  .toggle-Wrap {
    position: relative;

    .toggle-Toggle {
      position: absolute;
      right: 3.5rem;
      top: 0.5rem;
    }
  }
`;
