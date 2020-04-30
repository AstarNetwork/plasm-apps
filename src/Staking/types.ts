import { DeriveFees, DeriveBalancesAll } from "@polkadot/api-derive/types";
import { AccountId, Balance, BlockNumber, Hash, SessionIndex } from "@polkadot/types/interfaces";

export type Nominators = Record<string, string[]>;

export interface CalculateBalanceProps {
  balances_fees?: DeriveFees;
  balances_all?: DeriveBalancesAll;
}

export type AccountFilter = "all" | "controller" | "session" | "stash" | "unbonded";

export type ContractFilter = "all" | "hasNominators" | "noNominators" | "hasWarnings" | "noWarnings" | "iNominated";

export interface Slash {
  accountId: AccountId;
  amount: Balance;
}

export interface SessionRewards {
  blockHash: Hash;
  blockNumber: BlockNumber;
  isEventsEmpty: boolean;
  parentHash: Hash;
  reward: Balance;
  sessionIndex: SessionIndex;
  slashes: Slash[];
  treasury: Balance;
}
