import { detect } from "detect-browser";
import React from "react";
import styled from "styled-components";
import { isWeb3Injected } from "@polkadot/extension-dapp";
import { stringUpperFirst } from "@polkadot/util";

type Browser = "chrome" | "firefox";

interface Extension {
  desc: string;
  link: string;
  name: string;
}

interface Props {
  className?: string;
}

const available: Record<Browser, Extension[]> = {
  chrome: [],
  firefox: [],
};

[
  {
    browsers: {
      chrome: "https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd",
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/",
    },
    desc: "Basic account injection and signer",
    name: "polkadot-js extension",
  },
].forEach(({ browsers, desc, name }): void => {
  Object.entries(browsers).forEach(([browser, link]): void => {
    available[browser as Browser].push({ link, desc, name });
  });
});

const browserInfo = detect();
const browserName: Browser | null = (browserInfo && (browserInfo.name as Browser)) || null;
const isSupported = browserName && Object.keys(available).includes(browserName);

function Banner({ className }: Props): React.ReactElement<Props> | null {
  if (isWeb3Injected || !isSupported || !browserName) {
    return null;
  }

  return (
    <div className={className}>
      <div className="box">
        <div className="info">
          <p>
            {`It is recommended that you create/store your accounts securely and externally from the app. On ${stringUpperFirst(
              browserName
            )} the following browser extensions are available for use -`}
          </p>
          <ul>
            {available[browserName].map(
              ({ desc, name, link }): React.ReactNode => (
                <li key={name}>
                  <a href={link} rel="noopener noreferrer" target="_blank">
                    {name}
                  </a>{" "}
                  ({desc})
                </li>
              )
            )}
          </ul>
          <p>
            {
              "Accounts injected from any of these extensions will appear in this application and be available for use. The above list is updated as more extensions with external signing capability become available."
            }
            &nbsp;
            <a href="https://github.com/polkadot-js/extension" rel="noopener noreferrer" target="_blank">
              {"Learn more..."}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default styled(Banner)`
  padding: 0 0.5rem 0.5rem;

  .box {
    background: #fff6e5;
    border-left: 0.25rem solid darkorange;
    border-radius: 0 0.25rem 0.25rem 0;
    box-sizing: border-box;
    padding: 1rem 1.5rem;

    .info {
      max-width: 50rem;
    }
  }
`;
