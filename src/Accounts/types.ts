import { AppProps } from "@polkadot/react-components/types";
import { ActionStatus } from "@polkadot/react-components/Status/types";

import { WithTranslation } from "react-i18next";

export interface BareProps {
  className?: string;
  style?: Record<string, any>;
}

export type I18nProps = BareProps & WithTranslation;

export type ComponentProps = AppProps;

export interface ModalProps {
  onClose: () => void;
  onStatusChange: (status: ActionStatus) => void;
}
