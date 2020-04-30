import { ComponentProps } from "../types";

import React from "react";
import { Button, CardGrid } from "@polkadot/react-components";

import contracts from "../store";

import Code from "./Code";
import Upload from "./Upload";
import Add from "./Add";

type Props = ComponentProps;

interface State {
  isAddOpen: boolean;
  isUploadOpen: boolean;
}

class Codes extends React.PureComponent<Props, State> {
  public state: State = {
    isAddOpen: false,
    isUploadOpen: false,
  };

  public render(): React.ReactNode {
    const { basePath, showDeploy } = this.props;
    const { isAddOpen, isUploadOpen } = this.state;

    return (
      <>
        <CardGrid
          emptyText={"No code hashes available"}
          buttons={
            <Button.Group>
              <Button icon="upload" isPrimary label={"Upload WASM"} onClick={this.showUpload} />
              <Button.Or />
              <Button icon="add" label={"Add an existing code hash"} onClick={this.showAdd} />
            </Button.Group>
          }
        >
          {contracts.getAllCode().map(
            (code): React.ReactNode => {
              return <Code key={code.json.codeHash} code={code} showDeploy={showDeploy} />;
            }
          )}
        </CardGrid>
        <Upload basePath={basePath} isNew onClose={this.hideUpload} isOpen={isUploadOpen} />
        <Add basePath={basePath} onClose={this.hideAdd} isOpen={isAddOpen} />
      </>
    );
  }

  private showUpload = (): void => {
    this.setState({ isUploadOpen: true });
  };

  private hideUpload = (): void => {
    this.setState({ isUploadOpen: false });
  };

  private showAdd = (): void => {
    this.setState({ isAddOpen: true });
  };

  private hideAdd = (): void => {
    this.setState({ isAddOpen: false });
  };
}

export default Codes;
