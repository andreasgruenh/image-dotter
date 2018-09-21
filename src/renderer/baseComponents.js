import styled from 'react-emotion';
import {
  alignItems,
  alignSelf,
  color,
  display,
  flex,
  flexDirection,
  height,
  justifyContent,
  justifySelf,
  space,
  width,
} from 'styled-system';

export const Box = styled.div`
  ${display}
  ${space}
  ${width}
  ${color}
  ${flex}
  ${alignItems}
  ${alignSelf}
  ${flexDirection}
  ${justifyContent}
  ${justifySelf}
  ${height}
`;
