import memoizeOne from 'memoize-one';
import { arrayOf, func, number, shape, string } from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

import { Box } from './baseComponents';

class NoZoomImageAnnotater extends React.Component {
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
    selectedAnnoationIndex: number,
    setCursor: func.isRequired,
    updateAnnotation: func.isRequired
  };

  componentDidMount() {
    document.addEventListener('mousemove', this.resetCursor);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.resetCursor);
  }

  render() {
    const { availableDimensions, fileDimensions, filePath, annotations } = this.props;
    const heightRatio = fileDimensions.height / availableDimensions.height;
    const widthRatio = fileDimensions.width / availableDimensions.width;
    const useHeight = heightRatio > widthRatio;
    const style = {
      [useHeight ? 'height' : 'width']: useHeight
        ? availableDimensions.height
        : availableDimensions.width
    };
    const ratio = useHeight ? heightRatio : widthRatio;
    return (
      <>
        <Canvas
          height={availableDimensions.height}
          width={availableDimensions.width}
          innerRef={this.paintAnnotations(annotations, ratio)}
        />
        <Img
          style={style}
          src={filePath}
          innerRef={img => (this.img = img)}
          onMouseDown={e => e.preventDefault()}
          onMouseMove={this.getHandleMouseMove(ratio)}
          onClick={this.getOnClick(ratio)}
        />
      </>
    );
  }

  resetCursor = event => {
    if (!this.img) return;
    if (this.img === event.target) return;
    this.props.setCursor(null);
  };
  getHandleMouseMove = memoizeOne(ratio => event => {
    event.preventDefault();
    event.stopPropagation();
    this.props.setCursor(this.coordinatesFromEvent(ratio, event));
  });

  getOnClick = memoizeOne(ratio => event => {
    const { x, y } = this.coordinatesFromEvent(ratio, event);
    if (this.props.selectedAnnoationIndex !== null) {
      this.props.updateAnnotation(this.props.selectedAnnoationIndex, x, y);
    } else {
      this.props.addAnnotation(x, y);
    }
  });

  coordinatesFromEvent = (ratio, event) => {
    const x = Math.round(event.nativeEvent.offsetX * ratio);
    const y = Math.round(event.nativeEvent.offsetY * ratio);
    return { x, y };
  };

  paintAnnotations = (annotations, ratio) => canvas => {
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
      ctx.arc(x / ratio, y / ratio, 3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    });
  };
}

const Img = styled.img`
  cursor: crosshair;
`;

const Canvas = styled(Box)`
  position: absolute;
  pointer-events: none;
  z-index: 1;
`.withComponent('canvas');

export default NoZoomImageAnnotater;
