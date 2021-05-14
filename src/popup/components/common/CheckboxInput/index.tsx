import React from "react";

import styled from "styled-components";

const CheckboxIcon = styled.span`
  position: absolute;
  top: 0;
  left: 0;

  border-radius: 4px;

  width: calc(var(--s-24) - 1px);
  height: calc(var(--s-24) - 1px);
  border: 1px solid var(--c-dark-blue);

  background-color: var(--c-white);

  :after {
    content: "";
    display: block;
    position: absolute;
    content: "✓";
    position: absolute;
    color: var(--c-white);
    font-weight: bold;
    left: 4px;
    top: 2px;
  }
`;

const Checkbox = styled.input`
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;

  :checked ~ ${CheckboxIcon} {
    background-color: var(--c-orange);
    border: 1px solid var(--c-white);
  }
`;

const RootContainer = styled.div`
  user-select: none;
  cursor: pointer;
  position: relative;

  width: var(--s-24);
  height: var(--s-24);

  :hover ${Checkbox}:not(:checked) ~ ${CheckboxIcon} {
    background-color: var(--c-dark-gray);
  }
`;

function CheckboxInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { children, ...otherProps } = props;

  const ref = React.createRef<HTMLInputElement>();

  return (
    <RootContainer>
      <Checkbox ref={ref} type="checkbox" {...otherProps} />
      <CheckboxIcon onClick={() => ref.current?.click()} />
    </RootContainer>
  );
}

export default CheckboxInput;
