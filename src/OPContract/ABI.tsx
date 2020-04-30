import React from "react";
import styled from "styled-components";
import { Abi } from "@polkadot/api-contract";
import { registry } from "@polkadot/react-api";
import { InputFile, Labelled, Messages } from "@polkadot/react-components";
import { u8aToString } from "@polkadot/util";

interface Props {
  className?: string;
  contractAbi?: Abi;
  errorText?: string | null;
  help?: React.ReactNode;
  isError?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  label?: React.ReactNode;
  onChange: (json: string | null, contractAbi: Abi | null) => void;
  onRemove?: () => void;
  onRemoved?: () => void;
  onSelect?: () => void;
  onSelectConstructor?: (constructorIndex?: number) => void;
}

interface State {
  contractAbi: Abi | null;
  errorText: string | null;
  isAbiValid: boolean;
  isEmpty: boolean;
  isError: boolean;
}

class ABI extends React.PureComponent<Props, State> {
  public state: State = {
    contractAbi: null,
    errorText: null,
    isAbiValid: false,
    isEmpty: true,
    isError: false,
  };

  constructor(props: Props) {
    super(props);

    const { contractAbi, isError, isRequired } = this.props;
    const isAbiValid = !!contractAbi;

    this.state = {
      contractAbi: contractAbi || null,
      errorText: null,
      isAbiValid,
      isEmpty: !isAbiValid,
      isError: isError || (isRequired && !isAbiValid) || false,
    };
  }

  public static getDerivedStateFromProps({ contractAbi }: Props): Pick<State, never> | null {
    if (contractAbi) {
      return {
        contractAbi,
        isAbiValid: true,
        isError: false,
      };
    }
    return null;
  }

  public render(): React.ReactNode {
    const { className } = this.props;
    const { contractAbi, isAbiValid } = this.state;

    return (
      <div className={className}>{contractAbi && isAbiValid ? this.renderMessages() : this.renderInputFile()}</div>
    );
  }

  private renderInputFile(): React.ReactNode {
    const { className, help, isDisabled, isRequired, label } = this.props;
    const { isAbiValid, isEmpty, isError, errorText } = this.state;

    return (
      <div className={className}>
        <InputFile
          help={help}
          isDisabled={isDisabled}
          isError={!isAbiValid && (isRequired || isError)}
          label={label}
          onChange={this.onChange}
          placeholder={
            !isEmpty && !isAbiValid ? (
              <>
                {"invalid ABI file selected"}
                {!!errorText && (
                  <>
                    {" — "}
                    {errorText}
                  </>
                )}
              </>
            ) : (
              "click to select or drag and drop a JSON ABI file"
            )
          }
        />
      </div>
    );
  }

  private renderMessages(): React.ReactNode {
    const { help, isDisabled, label, onRemove, onSelectConstructor } = this.props;
    const { contractAbi } = this.state;

    if (!contractAbi) {
      return null;
    }

    return (
      <Labelled label={label} help={help} withLabel={!!label}>
        <Messages
          contractAbi={contractAbi}
          onRemove={onRemove || this.onRemove}
          isLabelled={!!label}
          isRemovable={!isDisabled}
          onSelectConstructor={onSelectConstructor}
          withConstructors
        />
      </Labelled>
    );
  }

  private onChange = (u8a: Uint8Array): void => {
    const { onChange } = this.props;
    const json = u8aToString(u8a);
    try {
      const abi = JSON.parse(json);

      if (abi.deploy || abi.messages) {
        throw new Error("You are using an ABI with an outdated format. Please generate a new one.");
      }

      const contractAbi = new Abi(registry, abi);

      this.setState(
        {
          contractAbi,
          isAbiValid: true,
          isEmpty: false,
          isError: false,
        },
        (): void => onChange(json, contractAbi)
      );
    } catch (error) {
      console.error(error);

      this.setState(
        {
          isAbiValid: false,
          isEmpty: false,
          isError: true,
          errorText: error,
        },
        (): void => onChange(null, null)
      );
    }
  };

  private onRemove = (): void => {
    const { onChange, onRemoved } = this.props;

    this.setState(
      {
        contractAbi: null,
        isAbiValid: false,
        isEmpty: true,
      },
      (): void => {
        onChange(null, null);
        onRemoved && onRemoved();
      }
    );
  };
}

export default styled(ABI as React.ComponentClass<Props, State>)`
  min-height: 4rem;
`;
