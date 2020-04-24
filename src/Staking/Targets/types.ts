import { AccountId, Balance } from "@polkadot/types/interfaces";

import BN from "bn.js";

export interface ValidatorInfo {
  accountId: AccountId;
  bondOther: BN;
  bondOwn: Balance;
  bondShare: number;
  bondTotal: Balance;
  commissionPer: number;
  isCommission: boolean;
  isFavorite: boolean;
  isNominating: boolean;
  key: string;
  numNominators: number;
  rankBondOther: number;
  rankBondOwn: number;
  rankBondTotal: number;
  rankComm: number;
  rankOverall: number;
  rankPayment: number;
  rankReward: number;
  rewardPayout: BN;
  rewardSplit: BN;
  validatorPayment: BN;
}
