import styled from "styled-components";

import Button from "@popup/components/common/Button";
import Text from "@popup/components/common/Text";
import Title from "@popup/components/common/Title";
import TopComponent from "@popup/components/common/TopComponent";
import { withNavBar } from "@popup/components/common/NavBar";
import Icon, { IconNames } from "@popup/components/common/Icon";
import Link from "@popup/components/common/Link";

const ContentContainer = styled.div`
  margin-top: var(--s-24);
  margin-bottom: var(--s-10);
`;
const Version = styled.span``;
const IconsContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
`;
const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s-24) 0;
`;

type AboutProps = {
  version: string;
  onNext: () => void;
  onClickFractalLink: () => void;
  onClickFractalTelegram: () => void;
};

function About(props: AboutProps) {
  const { onNext, onClickFractalLink, onClickFractalTelegram, version } = props;

  return (
    <TopComponent>
      <ContentContainer>
        <Title>
          Fractal Wallet{" "}
          <Version>
            <Text>{`v${version}`}</Text>
          </Version>
        </Title>
        <Text>
          <br />
        </Text>
        <Text>
          The Fractal Wallet is a browser extension that allows users to store
          their validated decentralized identity (DID) credentials. Verification
          checks can be completed on{" "}
          <Link onClick={onClickFractalLink} span>
            https://fractal.id/
          </Link>
          . Integrated with Fractal Protocol, the Fractal ID Wallet also logs
          browsing activity locally in a privacy-preserving way and lets you
          earn FCL through our community programs. Please follow our official
          Telegram channel for more details:{" "}
          <Link onClick={onClickFractalTelegram} span>
            https://t.me/fractal_protocol
          </Link>
        </Text>
        <Text>
          <br />
        </Text>
        <IconsContainer>
          <Icon name={IconNames.FRACTAL_FULL_LOGO} />
        </IconsContainer>
      </ContentContainer>
      <ActionContainer>
        <Button onClick={onNext}>Go to Dashboard</Button>
      </ActionContainer>
    </TopComponent>
  );
}

export default withNavBar(About);
