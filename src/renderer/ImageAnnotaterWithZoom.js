import { css } from 'emotion';
import { arrayOf, func, number, shape, string } from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

import { Box } from './baseComponents';

class ImageAnnotaterWithZoom extends React.PureComponent {
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
  img = React.createRef();
  canvas = React.createRef();

  constructor(props) {
    super(props);
    if (this.props.cursor) {
      const { x: cx, y: cy } = this.props.cursor;
      const { x: mx, y: my } = this.getMidpoint();
      this.x = cx * this.props.scale - mx;
      this.y = cy * this.props.scale - my;
    } else {
      this.x = 0;
      this.y = 0;
    }
  }

  componentDidMount() {
    if (!this.box.current) return;
    this.box.current.requestPointerLock();
    this.paintAnnotations(this.props.annotations, this.props.scale);
  }

  componentDidUpdate() {
    this.paintAnnotations(this.props.annotations, this.props.scale);
  }

  componentWillUnmount() {
    if (!this.box.current) return;
    document.exitPointerLock();
  }

  render() {
    const {
      annotations,
      availableDimensions,
      fileDimensions,
      scale: scaleFactor,
      filePath
    } = this.props;
    const scaledFileDimensions = scale(fileDimensions, scaleFactor);
    const roundedAvailableDimensions = scale(availableDimensions, 1);
    const translation = { x: this.x, y: this.y };
    return (
      <Box
        innerRef={this.box}
        onWheel={this.handleWheel}
        onMouseMove={this.handleMouseMove}
        onClick={this.handleClick}
        {...roundedAvailableDimensions}
        position="relative"
        className={css`
          overflow: hidden;
        `}
      >
        <img
          ref={this.img}
          style={{ transform: `translate3d(${-translation.x}px, ${-translation.y}px, 0px)` }}
          src={filePath}
          {...scaledFileDimensions}
        />
        <Canvas
          {...scaledFileDimensions}
          style={{ transform: `translate3d(${-translation.x}px, ${-translation.y}px, 0px)` }}
          innerRef={this.canvas}
        />
        <CrossHair
          totalWidth={roundedAvailableDimensions.width}
          totalHeight={roundedAvailableDimensions.height}
        />
      </Box>
    );
  }

  getMidpoint() {
    return {
      x: Math.floor(this.props.availableDimensions.width / 2),
      y: Math.floor(this.props.availableDimensions.height / 2)
    };
  }

  getCursorLocation(scale = this.props.scale) {
    const { x: mx, y: my } = this.getMidpoint();
    const cursor = {
      x: Math.round((this.x + mx) / scale),
      y: Math.round((this.y + my) / scale)
    };
    return cursor;
  }

  paintAnnotations = (annotations, scale) => {
    const canvas = this.canvas.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';

    annotations.forEach(([x, y], index) => {
      if (index === this.props.selectedAnnoationIndex) {
        ctx.fillStyle = 'lime';
      } else {
        ctx.fillStyle = 'red';
      }
      ctx.beginPath();
      ctx.arc(x * scale, y * scale, 3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    });
  };

  handleClick = event => {
    if (!this.props.cursor) return;
    const { x, y } = this.props.cursor;
    if (this.props.selectedAnnoationIndex !== null) {
      this.props.updateAnnotation(this.props.selectedAnnoationIndex, x, y);
    } else {
      this.props.addAnnotation(x, y);
    }
  };

  handleMouseMove = event => {
    this.x += event.movementX;
    this.y += event.movementY;
    this.img.current.style.transform = `translate3d(${-this.x}px, ${-this.y}px, 0px)`;
    this.canvas.current.style.transform = `translate3d(${-this.x}px, ${-this.y}px, 0px)`;
    this.paintAnnotations(this.props.annotations, this.props.scale);
    const newCursor = this.getCursorLocation();
    if (
      newCursor.x > this.props.fileDimensions.width ||
      newCursor.x < 0 ||
      newCursor.y > this.props.fileDimensions.height ||
      newCursor.y < 0
    ) {
      this.props.setCursor(null);
    } else {
      this.props.setCursor(newCursor);
    }
  };

  handleWheel = event => {
    const up = event.deltaY < 0;
    const factor = up ? 1.25 : 1 / 1.25;
    const newScale = Math.max(0.25, this.props.scale * factor);
    const cursor = this.getCursorLocation();
    const { x: cx, y: cy } = cursor;
    const { x: mx, y: my } = this.getMidpoint();
    this.x = cx * newScale - mx;
    this.y = cy * newScale - my;
    this.props.setScale(newScale);
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
    left: ${props => Math.floor(props.totalWidth / 2) - size / 2}px;
    position: absolute;
    top: ${props => Math.floor(props.totalHeight / 2)}px;
    width: ${size}px;
    z-index: 1;
  }
`;

const Canvas = styled(Box)`
  position: absolute;
  pointer-events: none;
  z-index: 1;
  top: 0;
  left: 0;
`.withComponent('canvas');
