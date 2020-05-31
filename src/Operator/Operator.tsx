import React, { useState } from "react";

import { Props } from "../types";
import ChangeOperator from "./modals/ChangeOperator";

export default function Operator({ basePath, onStatusChange }: Props): React.ReactElement {
  const [isHidden, setIsHidden] = useState(false);
  if (isHidden) {
    return <></>;
  }
  const onClose = (): void => setIsHidden(true);
  return (
    <>
      <ChangeOperator basePath={`${basePath}`} onStatusChange={onStatusChange} onClose={onClose} />
    </>
  );
}
