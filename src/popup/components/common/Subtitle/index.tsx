import React from "react";

import styled from "styled-components";

interface Props {
  underline?: boolean;
  uppercase?: boolean;
  fontSize?: string;
  lineHeight?: string;
}

const Root = styled.h3<Props>`
  font-size: ${(props) => props.fontSize || "var(--s-16)"};
  font-variant: ${(props) => (props.uppercase ? "small-caps" : "normal")};
  line-height: ${(props) => props.lineHeight || "var(--s-24)"};
  text-transform: ${(props) => (props.uppercase ? "uppercase" : "none")};
  text-decoration: ${(props) => (props.underline ? "underline" : "none")};
  color: var(--c-white);
  opacity: 0.6;
`;

function Subtitle(props: React.HTMLProps<HTMLHeadingElement> & Props) {
  const { children, underline, uppercase } = props;

  return (
    <Root underline={underline} uppercase={uppercase}>
      {children}
    </Root>
  );
}

export function Subsubtitle(
  props: React.HTMLProps<HTMLHeadingElement> & Props,
) {
  const { children, underline, uppercase } = props;

  return (
    <Root
      fontSize="var(--s-12)"
      lineHeight="var(--s-16)"
      underline={underline}
      uppercase={uppercase}
    >
      {children}
    </Root>
  );
}

export default Subtitle;
