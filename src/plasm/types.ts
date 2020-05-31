/* eslint-disable @typescript-eslint/camelcase */
/* eslint new-cap: ["error", { "newIsCap": false }] */
// @ts-check
// Import the API
import { Struct, u128, bool, u32, Enum, Vec } from "@polkadot/types";
import { AccountId, Balance, BlockNumber } from "@polkadot/types/interfaces";
import { BTreeMap } from "@polkadot/types/codec";
import { registry } from "@polkadot/react-api";

export class StakingParameters extends Struct {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(value?: any) {
    super(
      registry,
      {
        canBeNominated: "bool",
        optionExpired: "u128",
        optionP: "u32",
      },
      value
    );
  }

  static default(): StakingParameters {
    return new StakingParameters({
      canBeNominated: new bool(registry, true),
      optionExpired: new u128(registry, 0),
      optionP: new u32(registry, 0),
    });
  }

  public isError(): boolean {
    return false;
  }
}

/** @name OfferState */
export interface OfferState extends Enum {
  readonly isWaiting: boolean;
  readonly isReject: boolean;
  readonly isAccept: boolean;
}

/** @name Offer */
export interface OfferOf extends Struct {
  readonly buyer: AccountId;
  readonly sender: AccountId;
  readonly contracts: Vec<AccountId>;
  readonly amount: Balance;
  readonly expired: BlockNumber;
  readonly state: OfferState;
}

export interface EraStakingPoints extends Struct {
  readonly total: Balance;
  readonly individual: BTreeMap<AccountId, Balance>;
}

export const types = {
  StakingParameters: {
    canBeNominated: "bool",
    optionExpired: "u128",
    optionP: "u32",
  },
  Parameters: {
    canBeNominated: "bool",
    optionExpired: "u128",
    optionP: "u32",
  },
  OfferState: {
    _enum: ["Waiting", "Reject", "Accept"],
  },
  OfferOf: {
    buyer: "AccountId",
    sender: "AccountId",
    contracts: "Vec<AccountId>",
    amount: "Balance",
    expired: "BlockNumber",
    state: "OfferState",
  },
  EraStakingPoints: {
    total: "Balance",
    individual: "BTreeMap<AccountId, Balance>",
  },
  Releases: {
    _enum: ["V1_0_0"],
  },

  WeightToFeeCoefficient: {
    coeff_integer: "Balance",
    coeff_frac: "Perbill",
    negative: "bool",
    degree: "u8",
  },
};
