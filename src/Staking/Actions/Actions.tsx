/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountId, StakingLedger } from "@polkadot/types/interfaces";

import React, { useEffect, useState } from "react";
import { Button, Table } from "@polkadot/react-components";
import { useCall, useApi, useAccounts } from "@polkadot/react-hooks";
import { Option } from "@polkadot/types";
import { Props as BaseProps } from "../../types";

import Account from "./Account/Account";
import StartStaking from "./NewStake";

interface Props extends BaseProps {
  allContracts: string[];
  isVisible: boolean;
}

function getStashes(
  allAccounts: string[],
  stashTypes: Record<string, number>,
  queryBonded?: Option<AccountId>[],
  queryLedger?: Option<StakingLedger>[]
): string[] | null {
  const result: string[] = [];

  if (!queryBonded || !queryLedger) {
    return null;
  }

  queryBonded.forEach((value, index): void => {
    value.isSome && result.push(allAccounts[index]);
  });

  queryLedger.forEach((ledger): void => {
    if (ledger.isSome) {
      const stashId = ledger.unwrap().stash.toString();

      !result.some(([accountId]): boolean => accountId === stashId) && result.push(stashId);
    }
  });

  const uniqResult: string[] = Array.from(result.reduce((s, r: string) => s.add(r), new Set<string>()));
  return uniqResult.sort((a, b): number => (stashTypes[a[0]] || 99) - (stashTypes[b[0]] || 99));
}

function Actions({ allContracts, className, isVisible }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const { allAccounts } = useAccounts();
  const queryBonded = useCall<Option<AccountId>[]>(api.query.dappsStaking.bonded.multi as any, [allAccounts]);
  const queryLedger = useCall<Option<StakingLedger>[]>(api.query.dappsStaking.ledger.multi as any, [allAccounts]);
  const [isNewStakeOpen, setIsNewStateOpen] = useState(false);
  const [foundStashes, setFoundStashes] = useState<string[] | null>(null);
  const [stashTypes, setStashTypes] = useState<Record<string, number>>({});

  useEffect((): void => {
    setFoundStashes(getStashes(allAccounts, stashTypes, queryBonded, queryLedger));
  }, [allAccounts, queryBonded, queryLedger, stashTypes]);

  const _toggleNewStake = (): void => setIsNewStateOpen(!isNewStakeOpen);
  const _onUpdateType = (stashId: string, type: "validator" | "contract" | "nominator" | "started" | "other"): void =>
    setStashTypes({
      ...stashTypes,
      [stashId]: type === "validator" ? 1 : type === "nominator" ? 5 : 9,
    });

  return (
    <div className={`${className} ${!isVisible && "staking--hidden"}`}>
      <Button.Group>
        <Button isPrimary key="new-stake" label={"New stake"} icon="add" onClick={_toggleNewStake} />
      </Button.Group>
      {isNewStakeOpen && <StartStaking onClose={_toggleNewStake} />}
      {foundStashes?.length ? (
        <Table>
          <Table.Body>
            {foundStashes.map(
              (stashId): React.ReactNode => (
                <Account allContracts={allContracts} key={stashId} onUpdateType={_onUpdateType} stashId={stashId} />
              )
            )}
          </Table.Body>
        </Table>
      ) : (
        "No funds staked yet. Bond funds to validate or nominate a validator."
      )}
    </div>
  );
}

export default Actions;
