import { ValidatorInfo } from "./types";

import React from "react";
import { AddressSmall, Icon } from "@polkadot/react-components";
import { FormatBalance } from "@polkadot/react-query";
import { formatNumber } from "@polkadot/util";

interface Props {
  info: ValidatorInfo;
  toggleFavorite: (accountId: string) => void;
}

export default function Validator({
  info: {
    accountId,
    bondOther,
    bondOwn,
    bondTotal,
    commissionPer,
    isCommission,
    isFavorite,
    isNominating,
    key,
    numNominators,
    rankOverall,
    rewardPayout,
    validatorPayment,
  },
  toggleFavorite,
}: Props): React.ReactElement<Props> {
  const _onFavorite = (): void => toggleFavorite(key);
  const _onQueryStats = (): void => {
    window.location.hash = `/staking/query/${key}`;
  };

  return (
    <tr className={`${isNominating && "isHighlight"}`}>
      <td className="favorite">
        <Icon
          className={`${isFavorite && "isSelected"}`}
          name={isFavorite ? "star" : "star outline"}
          onClick={_onFavorite}
        />
      </td>
      <td className="number">{formatNumber(rankOverall)}</td>
      <td className="address">
        <AddressSmall value={accountId} />
      </td>
      <td className="number">
        {isCommission ? (
          <>
            <label>{"commission"}</label>
            {`${commissionPer.toFixed(2)}%`}
          </>
        ) : (
          <FormatBalance label={<label>{"commission"}</label>} value={validatorPayment} />
        )}
      </td>
      <td className="number together">
        <FormatBalance label={<label>{"total stake"}</label>} value={bondTotal} />
      </td>
      <td className="number together">
        <FormatBalance label={<label>{"own stake"}</label>} value={bondOwn} />
      </td>
      <td className="number together">
        <FormatBalance label={<label>{"other stake"}</label>} value={bondOther}>
          &nbsp;({formatNumber(numNominators)})
        </FormatBalance>
      </td>
      <td className="number together">
        <FormatBalance label={<label>{"profit/era est."}</label>} value={rewardPayout} />
      </td>
      <td>
        <Icon className="staking--stats" name="line graph" onClick={_onQueryStats} />
      </td>
    </tr>
  );
}
