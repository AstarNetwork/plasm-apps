import BN from "bn.js";
import React, { useEffect, useState } from "react";
import { Icon } from "@polkadot/react-components";

interface Props {
  unstakeThreshold: BN | undefined;
  onError: (error: string | null) => void;
}

function InputValidationUnstakeThreshold({ onError, unstakeThreshold }: Props): React.ReactElement<Props> | null {
  const [error, setError] = useState<string | null>(null);

  useEffect((): void => {
    if (unstakeThreshold) {
      let newError;

      if (unstakeThreshold.ltn(0)) {
        newError = "The Threshold must be a positive number";
      } else if (unstakeThreshold.gtn(10)) {
        newError = "The Threshold must lower than 11";
      }

      if (newError !== error) {
        onError(newError);
        setError(newError);
      }
    }
  }, [unstakeThreshold]);

  if (!error) {
    return null;
  }

  return (
    <article className="warning">
      <div>
        <Icon name="warning sign" />
        {error}
      </div>
    </article>
  );
}

export default InputValidationUnstakeThreshold;
