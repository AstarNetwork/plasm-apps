import { Abi } from "@polkadot/api-contract";
import { AppProps } from "@polkadot/react-components/types";
import { SubjectInfo } from "@polkadot/ui-keyring/observable/types";

export interface ComponentProps extends AppProps {
  accounts: SubjectInfo[];
  contracts: SubjectInfo[];
  hasCode: boolean;
  showDeploy: (codeHash?: string, constructorIndex?: number) => () => void;
  updated: number;
}

export interface CodeJson {
  abi?: string | null;
  codeHash: string;
  name: string;
  genesisHash: string;
  tags: string[];
}

export interface CodeStored {
  json: CodeJson;
  contractAbi?: Abi;
}

export interface ContractJsonOld {
  genesisHash: string;
  abi: string;
  address: string;
  name: string;
}
