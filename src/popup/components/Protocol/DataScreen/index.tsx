import styled from "styled-components";
import { useState, useEffect, useContext } from "react";

import { getProtocolOptIn, getProtocolService } from "@services/Factory";
import { useLoadedState } from "@utils/ReactHooks";

import {
  Subsubtitle,
  Text,
  BoldText,
  VerticalSequence,
} from "@popup/components/Protocol/common";

import Wallet from "@models/Wallet";
import Button from "@popup/components/common/Button";
import { SendTokens } from "@popup/components/Protocol/SendTokens";
import { StakeTokens } from "@popup/components/Protocol/StakeTokens";
import { ActivityStackContext } from "@popup/containers/ActivityStack";

// @ts-ignore
import Copy from "@assets/copy.svg";
import { Minting } from "./Minting";
import WebpageViews from "./WebpageViews";

interface AddressProps {
  wallet: Wallet;
}

const AddressContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LineWithCopy = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  > *:not(:last-child) {
    margin-right: 8px;
  }

  > svg {
    &:hover {
      cursor: pointer;
    }
  }
`;

function Address({ wallet }: AddressProps) {
  return (
    <AddressContainer>
      <BoldText>Your Address</BoldText>

      <LineWithCopy>
        <Subsubtitle>{wallet.address}</Subsubtitle>

        <Copy onClick={() => navigator.clipboard.writeText(wallet.address)} />
      </LineWithCopy>
    </AddressContainer>
  );
}

const LivenessContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

function AddLiveness() {
  const hasLiveness = useLoadedState(() =>
    getProtocolOptIn().hasCompletedLiveness(),
  );

  if (hasLiveness.unwrapOrDefault(true)) return null;

  const postOptInLiveness = async () => {
    await getProtocolOptIn().postOptInLiveness();
  };

  return (
    <LivenessContainer>
      <Text>Add liveness to unlock minting rewards:</Text>
      <Button onClick={postOptInLiveness}>Add Liveness</Button>
    </LivenessContainer>
  );
}

const ActionsContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`;

function DataScreen() {
  const [wallet, setWallet] = useState<Wallet>();
  const { updater: activityStack } = useContext(ActivityStackContext);

  const canStake = useLoadedState(() => getProtocolService().canStake());

  useEffect(() => {
    (async () => {
      const mnemonic = await getProtocolOptIn().getMnemonic();
      if (mnemonic) setWallet(Wallet.fromMnemonic(mnemonic));
    })();
  }, []);

  if (!wallet || !wallet.address) return <></>;

  return (
    <VerticalSequence>
      <AddLiveness />
      <Minting />
      <WebpageViews />
      <Address wallet={wallet} />
      <ActionsContainer>
        <Button
          onClick={() =>
            activityStack.push(
              <SendTokens onFinish={() => activityStack.pop()} />,
            )
          }
        >
          Send FCL
        </Button>

        {!canStake.unwrapOrDefault(false) ? null : (
          <Button
            onClick={() =>
              activityStack.push(
                <StakeTokens onFinish={() => activityStack.pop()} />,
              )
            }
          >
            Stake FCL
          </Button>
        )}
      </ActionsContainer>
    </VerticalSequence>
  );
}

DataScreen.defaultProps = {};

export default DataScreen;
