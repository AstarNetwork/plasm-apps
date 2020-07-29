import React, { useState } from "react";
import styled from "styled-components";
import { Grid } from "semantic-ui-react";
import { useDebounce } from "@polkadot/react-hooks";
import { AddressToggle, Input, InputBalance } from "@polkadot/react-components";
import BN from "bn.js";

interface Props {
  available: string[];
  className?: string;
  help: React.ReactNode;
  label: React.ReactNode;
  maxCount: number;
  onChange: (values: [string[], Map<string, BN>]) => void;
  value: [string[], Map<string, BN>];
  contract?: string;
}

function InputAddressMulti({
  available,
  className,
  help,
  label,
  maxCount,
  onChange,
  value,
  contract,
}: Props): React.ReactElement<Props> {
  const [_filter, setFilter] = useState<string>("");
  const filter = useDebounce(_filter);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [values, setValues] = useState<Map<string, BN>>(new Map());

  const _onClick = (key: string): ((isChecked: boolean) => void) => (isChecked: boolean): void => {
    const addresses = value[0];
    let newValues: string[] = addresses.filter((address): boolean => address !== key);

    if (isChecked) {
      newValues = [key].concat(newValues).slice(0, maxCount);
    }

    setAddresses(newValues);
    onChange([newValues, values]);
  };

  const contracts = contract ? [contract] : available;

  return (
    <div className={`ui--InputAddressMulti ${className}`}>
      {!contract && (
        <Input
          autoFocus
          className="ui--InputAddressMulti-Input"
          help={help}
          label={label}
          onChange={setFilter}
          placeholder={"partial name, address or account index"}
          value={_filter}
        />
      )}
      <div className="ui--InputAddressMulti-container">
        {contracts.map(
          (key): React.ReactNode => (
            <div key={key}>
              <Grid columns="equal">
                <Grid.Column>
                  <AddressToggle
                    address={key}
                    filter={filter}
                    onChange={_onClick(key)}
                    value={value[0].includes(key)}
                  />
                </Grid.Column>
                <Grid.Column>
                  <InputBalance
                    label="value"
                    onChange={(value?: BN): void => {
                      setValues(new Map(values.set(key, value ?? new BN(0))));
                      onChange([addresses, values]);
                    }}
                  />
                </Grid.Column>
              </Grid>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default styled(InputAddressMulti)``;
