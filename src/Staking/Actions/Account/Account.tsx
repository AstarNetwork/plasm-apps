/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeriveBalancesAll } from "@polkadot/api-derive/types";
import { AccountId, Exposure, StakingLedger, ValidatorPrefs } from "@polkadot/types/interfaces";
import { StakingParameters } from "../../../plasm";
import { DerivedDappsStakingAccount } from "../../../Api/derive/types";
import { Props as BaseProps } from "../../../types";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AddressInfo, AddressMini, AddressSmall, Button, Menu, Popup, TxButton } from "@polkadot/react-components";
import { useApi, useCall, useToggle } from "@polkadot/react-hooks";

import BondExtra from "./BondExtra";
import Nominate from "./Nominate";
import SetControllerAccount from "./SetControllerAccount";
import SetRewardDestination from "./SetRewardDestination";
import Unbond from "./Unbond";

interface Props extends BaseProps {
  allContracts?: string[];
  onUpdateType: (stashId: string, type: "validator" | "nominator" | "started" | "other") => void;
  stashId: string;
}

interface StakeState {
  controllerId: string | null;
  destination: number;
  isStashNominating: boolean;
  nominees?: string[];
  stakers?: Exposure;
  stakingLedger?: StakingLedger;
  contractParameters?: StakingParameters;
  validatorPrefs?: ValidatorPrefs;
}

function toIdString(id?: AccountId | null): string | null {
  return id ? id.toString() : null;
}

function getStakeState({ controllerId, payee, ledger, nominations }: DerivedDappsStakingAccount): StakeState {
  const targets: AccountId[] = nominations ? nominations.targets : [];
  const isStashNominating = !!targets.length;
  return {
    controllerId: toIdString(controllerId),
    destination: payee?.toNumber() || 0,
    isStashNominating,
    // we assume that all ids are non-null
    nominees: targets.map(toIdString) as string[],
    stakingLedger: ledger,
  };
}

function Account({ allContracts, className, onUpdateType, stashId }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const balancesAll = useCall<DeriveBalancesAll>(api.derive.balances.all as any, [stashId]);
  const stakingAccount = useCall<DerivedDappsStakingAccount>((api.derive as any).plasmStaking.account, [stashId]);
  const [{ controllerId, destination, isStashNominating, nominees }, setStakeState] = useState<StakeState>({
    controllerId: null,
    destination: 0,
    isStashNominating: false,
  });
  const [isBondExtraOpen, toggleBondExtra] = useToggle();
  const [isNominateOpen, toggleNominate] = useToggle();
  const [isRewardDestinationOpen, toggleRewardDestination] = useToggle();
  const [isSetControllerOpen, toggleSetController] = useToggle();
  const [isSettingsOpen, toggleSettings] = useToggle();
  const [isUnbondOpen, toggleUnbond] = useToggle();

  useEffect((): void => {
    if (stakingAccount) {
      const state = getStakeState(stakingAccount);
      setStakeState(state);

      if (state.isStashNominating) {
        onUpdateType(stashId, "nominator");
      } else {
        onUpdateType(stashId, "other");
      }
    }
  }, [stakingAccount, stashId]);

  return (
    <tr className={className}>
      <td className="top">
        <BondExtra controllerId={controllerId} isOpen={isBondExtraOpen} onClose={toggleBondExtra} stashId={stashId} />
        <Unbond controllerId={controllerId} isOpen={isUnbondOpen} onClose={toggleUnbond} stashId={stashId} />
        {isNominateOpen && controllerId && (
          <Nominate
            controllerId={controllerId}
            nominees={nominees}
            onClose={toggleNominate}
            allContracts={allContracts}
            stashId={stashId}
          />
        )}
        {isSetControllerOpen && (
          <SetControllerAccount
            defaultControllerId={controllerId}
            isValidating={false}
            onClose={toggleSetController}
            stashId={stashId}
          />
        )}
        {isRewardDestinationOpen && controllerId && (
          <SetRewardDestination
            controllerId={controllerId}
            defaultDestination={destination}
            onClose={toggleRewardDestination}
          />
        )}
        <AddressSmall value={stashId} />
      </td>
      <td className="top ">
        <AddressMini className="mini-nopad" label={"controller"} value={controllerId} />
      </td>
      <td className="top">
        <AddressInfo
          address={stashId}
          withBalance={{
            available: true,
            bonded: true,
            free: true,
            redeemable: true,
            unlocking: true,
          }}
          withRewardDestination
        />
      </td>
      {
        <td>
          {isStashNominating && nominees && (
            <details>
              <summary>{`Nominating (${nominees.length})`}</summary>
              {nominees.map(
                (nomineeId, index): React.ReactNode => (
                  <AddressMini key={index} value={nomineeId} withBalance={false} withBonded />
                )
              )}
            </details>
          )}
        </td>
      }
      <td className="top number together">
        <>
          {isStashNominating ? (
            <TxButton
              accountId={controllerId}
              isNegative
              label={"Stop Nominating"}
              icon="stop"
              key="stop"
              tx="dappsStaking.chill"
            />
          ) : (
            <Button.Group>
              <Button isPrimary key="unbond" onClick={toggleUnbond} label={"Unbond"} icon="unlock" />
              <Button.Or key="nominate.or" />
              <Button isPrimary key="nominate" onClick={toggleNominate} label={"Nominate"} icon="hand paper outline" />
            </Button.Group>
          )}
          <Popup
            key="settings"
            onClose={toggleSettings}
            open={isSettingsOpen}
            position="bottom right"
            trigger={<Button icon="setting" onClick={toggleSettings} />}
          >
            <Menu vertical text onClick={toggleSettings}>
              {balancesAll?.freeBalance.gtn(0) && <Menu.Item onClick={toggleBondExtra}>{"Bond more funds"}</Menu.Item>}
              <Menu.Item onClick={toggleUnbond}>{"Unbond funds"}</Menu.Item>
              <Menu.Item onClick={toggleSetController}>{"Change controller account"}</Menu.Item>
              <Menu.Item onClick={toggleRewardDestination}>{"Change reward destination"}</Menu.Item>
              {isStashNominating && <Menu.Item onClick={toggleNominate}>{"Change nominee(s)"}</Menu.Item>}
            </Menu>
          </Popup>
        </>
      </td>
    </tr>
  );
}

export default styled(Account)`
  .ui--Button-Group {
    display: inline-block;
    margin-right: 0.25rem;
    vertical-align: inherit;
  }

  .mini-nopad {
    padding: 0;
  }
`;
