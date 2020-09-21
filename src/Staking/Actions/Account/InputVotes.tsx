/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import styled from "styled-components";
import { Grid, Checkbox, Form } from "semantic-ui-react";
import { AddressSmall, Input } from "@polkadot/react-components";

interface Props {
  available: string[];
  className?: string;
  help: React.ReactNode;
  label: React.ReactNode;
  onChange: (values: any[]) => void;
  contract?: string;
}

function InputVotes({ available, className, help, label, onChange, contract }: Props): React.ReactElement<Props> {
  const [filter, setFilter] = useState<string>("");

  const [values, setValues] = useState<Map<string, number>>(new Map());

  const contracts = contract ? [contract] : available;

  const onChangeCheckBox = (contract: string): any => {
    return (e, { value }: any): void => {
      setValues(new Map(values.set(contract, value)));
      const filteredValues: [string, string][] = [];
      for (const [key, value] of values) {
        if (value >= 0) {
          // TODO: change to enum
          filteredValues.push([key, value === 0 ? "Bad" : "Good"]);
        }
      }
      onChange(filteredValues);
    };
  };

  return (
    <div className={`ui--InputVotes ${className}`}>
      {!contract && (
        <Input
          autoFocus
          className="ui--InputVotes-Input"
          help={help}
          label={label}
          onChange={setFilter}
          placeholder={"partial name, address or account index"}
          value={filter}
        />
      )}
      <div className="ui--InputVotes-container">
        {contracts.map(
          (key): React.ReactNode => (
            <div key={key}>
              <Grid columns="equal" style={{ marginTop: "1rem" }}>
                <Grid.Column>
                  <AddressSmall value={key} />
                </Grid.Column>
                <Grid.Column>
                  <Form>
                    <Form.Group inline>
                      <Form.Field>
                        <Checkbox
                          radio
                          label="Good"
                          value={1}
                          checked={values.get(key) === 1}
                          onChange={onChangeCheckBox(key)}
                        />
                      </Form.Field>
                      <Form.Field>
                        <Checkbox
                          radio
                          label="Bad"
                          value={0}
                          checked={values.get(key) === 0}
                          onChange={onChangeCheckBox(key)}
                        />
                      </Form.Field>
                      <Form.Field>
                        <Checkbox
                          radio
                          label="Not Vote"
                          value={-1}
                          checked={values.get(key) !== 0 && values.get(key) !== 1}
                          onChange={onChangeCheckBox(key)}
                        />
                      </Form.Field>
                    </Form.Group>
                  </Form>
                </Grid.Column>
              </Grid>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default styled(InputVotes)``;
