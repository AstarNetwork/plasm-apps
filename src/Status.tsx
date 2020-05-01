import { EventRecord } from "@polkadot/types/interfaces";
import { KeyringOptions } from "@polkadot/ui-keyring/options/types";
import { ActionStatus, QueueStatus, QueueTx, QueueAction$Add } from "@polkadot/react-components/Status/types";

import React, { useEffect } from "react";
import { Status as StatusDisplay } from "@polkadot/react-components";
import { useAccounts, useApi, useCall } from "@polkadot/react-hooks";
import { stringToU8a } from "@polkadot/util";
import { xxhashAsHex } from "@polkadot/util-crypto";

interface Props {
  optionsAll?: KeyringOptions;
  queueAction: QueueAction$Add;
  stqueue: QueueStatus[];
  txqueue: QueueTx[];
}

let prevEventHash: string;

function filterEvents(
  allAccounts: string[],
  optionsAll?: KeyringOptions,
  events?: EventRecord[]
): ActionStatus[] | null {
  const eventHash = xxhashAsHex(stringToU8a(JSON.stringify(events)));

  if (!optionsAll || !events || eventHash === prevEventHash) {
    return null;
  }

  prevEventHash = eventHash;

  return events
    .map(({ event: { data, method, section } }): ActionStatus | null => {
      if (section === "balances" && method === "Transfer") {
        const account = data[1].toString();

        if (allAccounts.includes(account)) {
          return {
            account,
            action: `${section}.${method}`,
            message: "transfer received",
            status: "event",
          };
        }
      } else if (section === "democracy") {
        const index = data[0].toString();

        return {
          action: `${section}.${method}`,
          message: `update on #${index}`,
          status: "event",
        };
      }

      return null;
    })
    .filter((item): item is ActionStatus => !!item);
}

function Status({ optionsAll, queueAction, stqueue, txqueue }: Props): React.ReactElement<Props> {
  const { api, isApiReady } = useApi();
  const { allAccounts } = useAccounts();
  const events = useCall<EventRecord[]>(isApiReady && (api.query.system?.events as any), []);

  useEffect((): void => {
    const filtered = filterEvents(allAccounts, optionsAll, events);

    filtered && queueAction(filtered);
  }, [allAccounts, events, optionsAll, queueAction]);

  return <StatusDisplay stqueue={stqueue} txqueue={txqueue} />;
}

export default React.memo(Status);
