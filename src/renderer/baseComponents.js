import styled from 'react-emotion';
import {
  alignItems,
  alignSelf,
  borders,
  color,
  display,
  flex,
  flexDirection,
  fontFamily,
  fontSize,
  fontWeight,
  height,
  justifyContent,
  justifySelf,
  letterSpacing,
  lineHeight,
  space,
  textAlign,
  width,
} from 'styled-system';

export const Box = styled.div`
  ${display}
  ${space}
  ${width}
  ${color}
  ${flex}
  ${fontSize}
  ${alignItems}
  ${alignSelf}
  ${flexDirection}
  ${justifyContent}
  ${justifySelf}
  ${height}
  ${borders}
`;

export const Text = styled(Box)(fontFamily, fontWeight, textAlign, lineHeight, letterSpacing);

Text.defaultProps = {
  as: 'p',
  mb: 1
};
