import { BareProps } from "@polkadot/react-components/types";

import React from "react";
import styled from "styled-components";
import Params from "@polkadot/react-params";
import { RawParams, ComponentMap } from "@polkadot/react-params/types";
import { getTypeDef } from "@polkadot/types";

interface Props extends BareProps {
  isDisabled?: boolean;
  onChange?: (value: RawParams) => void;
  onEnter?: () => void;
  overrides?: ComponentMap;
}

const PARAMETERS_PARAMS = [
  {
    name: "StakingParameters",
    type: getTypeDef('{ "canBeNominated": "bool", "optionExpired" : "u128", "optionP" : "u32" }'),
  },
];

function InputParameters({ isDisabled, onChange, onEnter, overrides }: Props): React.ReactElement<Props> {
  return (
    <Params
      isDisabled={isDisabled}
      onChange={onChange}
      onEnter={onEnter}
      overrides={overrides}
      params={PARAMETERS_PARAMS}
    />
  );
}

export default styled(InputParameters)`
  &&:not(.label-small) .labelExtra {
    right: 6.5rem;
  }

  .ui.action.input.ui--Input
    .ui.primary.buttons
    .ui.disabled.button.compact.floating.selection.dropdown.ui--SiDropdown {
    border-style: solid;
    opacity: 1 !important;
  }
`;
