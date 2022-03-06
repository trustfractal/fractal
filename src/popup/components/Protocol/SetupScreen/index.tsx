import { useEffect, useState } from "react";

import styled from "styled-components";
import {
  Subtitle,
  Title,
  Cta,
  Icon,
  IconNames,
  VerticalSequence,
} from "@popup/components/Protocol/common";

const RedDiv = styled.div`
  color: var(--c-red);
`;

export function SetupSuccess({
  onContinue,
  mnemonic,
}: {
  mnemonic: string;
  onContinue: () => void;
}) {
  return (
    <VerticalSequence>
      <Icon name={IconNames.PROTOCOL_SETUP_SUCCESS} />

      <Title>You joined the Fractal Protocol!</Title>

      <Subtitle>This is your private key:</Subtitle>
      <Subtitle>
        <strong>
          <RedDiv>{mnemonic}</RedDiv>
        </strong>
      </Subtitle>
      <Subtitle>
        Store it somewhere safe. You will need it to recover your funds.
      </Subtitle>
      <Subtitle>
        You will <strong>never</strong> need to share it with anyone.
      </Subtitle>

      <Cta onClick={onContinue}>Continue</Cta>
    </VerticalSequence>
  );
}

export function SetupError({ onRetry }: { onRetry: () => void }) {
  return (
    <VerticalSequence>
      <Icon name={IconNames.PROTOCOL_SETUP_FAILURE} />

      <Title>Something went wrong</Title>

      <Cta onClick={onRetry}>Retry</Cta>
    </VerticalSequence>
  );
}

export function SetupInProgress({ onRetry }: { onRetry: () => void }) {
  const [showButton, setShowButton] = useState<boolean>();

  useEffect(() => {
    const timeout = setTimeout(() => setShowButton(true), 30000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <VerticalSequence>
      <Icon name={IconNames.PROTOCOL_SETUP_PENDING} />

      <Title>Setting things up</Title>

      <Subtitle>This may take some time</Subtitle>

      {showButton && <Cta onClick={onRetry}>Retry</Cta>}
    </VerticalSequence>
  );
}
