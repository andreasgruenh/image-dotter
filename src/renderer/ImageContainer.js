import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import memoizeOne from 'memoize-one';
import { instanceOf } from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Subscribe } from 'resubscribe';

import { Box, Text } from './baseComponents';
import File from './File';

class ImageContainer extends React.Component {
  static propTypes = {
    file: instanceOf(File)
  };
  state = {
    scaleActive: false,
    cursor: null,
    selectedIndex: null,
    scale: 2,
    offset: { x: 0, y: 0 }
  };

  componentDidUpdate() {
    if (!this.annotationList) return;
    const index =
      this.state.selectedIndex === null ? this.annotationCount - 1 : this.state.selectedIndex;
    const focusThis = this.annotationList.childNodes[index];
    if (!focusThis) return;
    focusThis.scrollIntoView();
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.resetMouseOver);
    this.removeKeyListeners = [
      this.props.keyEvents.addDownListener('Alt', () => {
        this.setState({ scaleActive: true });
        if (!this.canvas) return;
        this.canvas.requestPointerLock();
      }),
      this.props.keyEvents.addUpListener('Alt', () => {
        this.setState({ scaleActive: false, offset: { x: 0, y: 0 } });
        document.exitPointerLock();
      }),
      this.props.keyEvents.addDownListener(' ', () => {
        const nextIndex =
          this.state.selectedIndex === null
            ? this.annotationCount - 1
            : this.state.selectedIndex - 1;

        this.setState({ selectedIndex: nextIndex });
      })
    ];
  }
  componentWillUnmount() {
    this.removeKeyListeners.forEach(r => r());
    document.removeEventListener('mousemove', this.resetMouseOver);
  }
  render() {
    if (!this.props.file) return <Text>No image selected.</Text>;
    return (
      <Subscribe to={this.props.file.getState()}>
        {({ annotations }) => {
          this.annotationCount = annotations.length;
          return (
            <Box height="100%" display="flex">
              <Box flex="1 1 auto" p={2} display="flex" flexDirection="column">
                <Text flex="0 0 auto" mb={2}>
                  {this.props.file.fileName}
                </Text>
                <Box height="100%" width="100%" flex="1 1 auto">
                  <Subscribe to={this.props.file.getImageData()}>
                    {({ buffer, dimensions }) => (
                      <AutoSizer>
                        {({ height, width }) => {
                          const heightRatio = dimensions.height / height;
                          const widthRatio = dimensions.width / width;
                          const useHeight = heightRatio > widthRatio;
                          const style = {
                            [useHeight ? 'height' : 'width']: useHeight ? height : width
                          };
                          const ratio = useHeight ? heightRatio : widthRatio;
                          return (
                            <>
                              <Canvas
                                height={height}
                                width={width}
                                innerRef={this.paintAnnotations(annotations, ratio)}
                                onMouseMove={this.handleCanvasMouseMove}
                              />
                              <TranslatedBox
                                height={height}
                                width={width}
                                offset={this.state.offset}
                                scale={this.state.scaleActive ? this.state.scale : 1}
                              >
                                <Img
                                  style={style}
                                  src={this.props.file.absolutePath}
                                  onMouseDown={preventDefault}
                                  onMouseMove={this.getMouseOver(ratio)}
                                  onClick={this.getOnClick(ratio)}
                                  onWheel={this.handleWheel}
                                />
                              </TranslatedBox>
                            </>
                          );
                        }}
                      </AutoSizer>
                    )}
                  </Subscribe>
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" flex="0 0 200px" p={2}>
                <Text mb={2} flex="0 0 auto">
                  Annotations
                </Text>
                <AnnotationList flex="1 1 auto" innerRef={this.handleAnnotationListRef}>
                  {annotations.map(([x, y], index) => {
                    const selected = index === this.state.selectedIndex;
                    const onClick = selected
                      ? () => this.deleteAnnotation(index)
                      : () => this.selectAnnotation(index);
                    return (
                      <ListItem key={index} selected={selected} onClick={onClick}>
                        {x}:{y}
                        {selected && <FontAwesomeIcon icon="trash-alt" />}
                      </ListItem>
                    );
                  })}
                  <ListItem
                    color="#53605C"
                    onClick={() => this.setState({ selectedIndex: null })}
                    selected={
                      this.state.selectedIndex === null || !annotations[this.state.selectedIndex]
                    }
                  >
                    {this.state.cursor ? (
                      <>
                        {this.state.cursor.x}:{this.state.cursor.y}
                      </>
                    ) : (
                      <>?:?</>
                    )}
                  </ListItem>
                </AnnotationList>
              </Box>
            </Box>
          );
        }}
      </Subscribe>
    );
  }

  handleAnnotationListRef = list => (this.annotationList = list);

  getMouseOver = memoizeOne(ratio => event => {
    const x = Math.round(event.nativeEvent.offsetX * ratio);
    const y = Math.round(event.nativeEvent.offsetY * ratio);
    this.setState({
      cursor: { x, y },
      origin: `${event.nativeEvent.offsetX}px ${event.nativeEvent.offsetY}px`
    });
  });

  handleCanvasMouseMove = event => {
    const dx = event.movementX;
    const dy = event.movementY;
    this.setState(({ offset }) => ({
      offset: { x: offset.x - dx, y: offset.y - dy }
    }));
  };

  handleWheel = event => {
    const up = event.deltaY < 0;
    this.setState({ scale: Math.max(0.25, this.state.scale + 0.25 * (up ? 1 : -1)) });
  };

  getOnClick = memoizeOne(ratio => event => {
    const x = Math.round(event.nativeEvent.offsetX * ratio);
    const y = Math.round(event.nativeEvent.offsetY * ratio);
    if (this.state.selectedIndex !== null) {
      this.props.file.updateAnnotation(this.state.selectedIndex, x, y);
    } else {
      this.props.file.addAnnotation(x, y);
    }
    this.setState(state => ({
      selectedIndex: state.selectedIndex !== null ? state.selectedIndex + 1 : null
    }));
  });

  resetMouseOver = () => {
    if (this.state.cursor) this.setState({ cursor: null });
  };

  paintAnnotations = (annotations, ratio) => canvas => {
    this.canvas = canvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scale = this.state.scaleActive ? this.state.scale : 1;
    ctx.scale(scale, scale);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2 / scale;

    annotations.forEach(([x, y], index) => {
      if (index === this.state.selectedIndex) {
        ctx.fillStyle = 'lime';
      } else {
        ctx.fillStyle = 'red';
      }
      ctx.beginPath();
      ctx.arc(x / ratio, y / ratio, 3 / scale, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  selectAnnotation = index => this.setState({ selectedIndex: index });
  deleteAnnotation = index => this.props.file.deleteAnnotation(index);
}

export default ImageContainer;

function preventDefault(event) {
  event.preventDefault();
}

const AnnotationList = styled(Box)`
  overflow-y: auto;

  padding: 0;
`.withComponent('ul');

const ListItem = styled(Box)`
  align-items: center;
  cursor: pointer;
  display: flex;
  text-decoration: ${props => (props.selected ? 'underline' : 'none')};

  &:hover {
    text-decoration: underline;

    svg {
      color: #ef3054;
    }
  }
`.withComponent('li');

ListItem.defaultProps = {
  fontSize: '0',
  display: 'flex',
  justifyContent: 'space-between',
  px: 2,
  py: 1
};

const Img = styled.img`
  cursor: crosshair;
`;

const Canvas = styled(Box)`
  position: absolute;
  pointer-events: none;
  z-index: 1;
`.withComponent('canvas');

const TranslatedBox = styled(Box)`
  /* transition: transform 0.2s; */
  transform: translate3d(${props => props.offset.x}px, ${props => props.offset.y}px, 0)
    scale(${props => props.scale});
  transform-origin: 0 0;
`;
