import { AccountId, Nominations, RewardDestination, StakingLedger } from "@polkadot/types/interfaces";
import { Option } from "@polkadot/types";

import { StakingParameters } from "../../plasm";
import { EraStakingPoints } from "../../plasm/types";

export type DeriveOperators = [AccountId[], Option<AccountId>[]];

export interface DerivedDappsStakingQuery {
  operatorId: undefined | AccountId;
  stakingPoints?: EraStakingPoints;
  contractId: AccountId;
  contractParameters: undefined | StakingParameters;
}

export interface DerivedDappsStakingAccount {
  stashId: AccountId;
  controllerId: undefined | AccountId;
  payee: RewardDestination;
  ledger: undefined | StakingLedger;
  nominations: undefined | Nominations;
}
