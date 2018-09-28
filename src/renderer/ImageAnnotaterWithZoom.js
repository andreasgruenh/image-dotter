import { css } from 'emotion';
import { arrayOf, func, number, shape, string } from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

import { Box } from './baseComponents';

class ImageAnnotaterWithZoom extends React.Component {
  static propTypes = {
    addAnnotation: func.isRequired,
    annotations: arrayOf(arrayOf(number)).isRequired,
    availableDimensions: shape({
      width: number.isRequired,
      height: number.isRequired
    }),
    deleteAnnotation: func.isRequired,
    fileDimensions: shape({
      width: number.isRequired,
      height: number.isRequired
    }).isRequired,
    filePath: string.isRequired,
    scale: number.isRequired,
    selectedAnnoationIndex: number,
    setCursor: func.isRequired,
    setScale: func.isRequired,
    updateAnnotation: func.isRequired
  };

  box = React.createRef();

  componentDidMount() {
    Object.assign(this, this.props.cursor || { x: 0, y: 0 });
    if (!this.box.current) return;
    this.box.current.requestPointerLock();
  }

  componentWillUnmount() {
    if (!this.box.current) return;
    document.exitPointerLock();
  }

  render() {
    const {
      availableDimensions,
      fileDimensions,
      scale: scaleFactor,
      filePath,
      cursor
    } = this.props;
    const scaledFileDimensions = scale(fileDimensions, scaleFactor);
    const roundedAvailableDimensions = scale(availableDimensions, 1);
    const translation = cursor || { x: 0, y: 0 };
    console.log(cursor);
    return (
      <Box
        innerRef={this.box}
        onWheel={this.handleWheel}
        onMouseMove={this.handleMouseMove}
        {...roundedAvailableDimensions}
        position="relative"
        className={css`
          overflow: hidden;
        `}
      >
        <CrossHair
          totalWidth={roundedAvailableDimensions.width}
          totalHeight={roundedAvailableDimensions.height}
        />
        <img
          className={css`
            transform: translate3d(${-translation.x}px, ${-translation.y}px, 0px);
          `}
          src={filePath}
          {...scaledFileDimensions}
        />
      </Box>
    );
  }

  handleMouseMove = event => {
    this.x += event.movementX;
    this.y += event.movementY;
    this.props.setCursor({ x: this.x, y: this.y });
  };

  coordinatesFromEvent = (ratio, event) => {
    const x = Math.round(event.nativeEvent.offsetX * ratio);
    const y = Math.round(event.nativeEvent.offsetY * ratio);
    return { x, y };
  };

  handleWheel = event => {
    const up = event.deltaY < 0;
    const newScale = this.props.scale + 0.25 * (up ? 1 : -1);
    this.props.setScale(Math.max(0.25, newScale));
  };
}

function scale(dimensions, factor) {
  return {
    width: Math.round(dimensions.width * factor),
    height: Math.round(dimensions.height * factor)
  };
}

export default ImageAnnotaterWithZoom;

const width = 1;
const size = 21;
const CrossHair = styled.div`
  /* Vertical bar */
  :before {
    transform: rotate(90deg);
    transform-origin: 50 50;
  }

  :before,
  :after {
    background-clip: padding-box;
    background-color: black;
    border: 1px solid rgba(255, 255, 255, 0.7);
    content: ' ';
    height: ${width}px;
    left: ${props => Math.floor(props.totalWidth / 2)}px;
    position: absolute;
    top: ${props => Math.floor(props.totalHeight / 2)}px;
    width: ${size}px;
    z-index: 1;
  }
`;
