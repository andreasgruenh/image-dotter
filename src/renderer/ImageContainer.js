import { instanceOf } from 'prop-types';
import React from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Subscribe } from 'resubscribe';

import AnnotationList from './AnnotationList';
import { Box, Text } from './baseComponents';
import File from './File';
import ImageAnnotater from './ImageAnnotater';
import ImageAnnotaterWithZoom from './ImageAnnotaterWithZoom';
import KeyEvents from './KeyEvents';

class ImageContainer extends React.Component {
  static propTypes = {
    keyEvents: instanceOf(KeyEvents),
    file: instanceOf(File)
  };
  state = {
    scaleActive: false,
    cursor: null,
    selectedAnnotationIndex: null,
    scale: 1
  };

  componentDidMount() {
    this.removeKeyListeners = [
      this.props.keyEvents.addDownListener('Alt', () => {
        this.setState({ scaleActive: true });
      }),
      this.props.keyEvents.addUpListener('Alt', () => {
        this.setState({ scaleActive: false });
      })
    ];
  }
  componentDidUpdate(lastProps) {
    if (this.props.file !== lastProps.file) {
      this.setState({ selectedAnnoationIndex: null, cursor: null });
    }
  }
  componentWillUnmount() {
    this.removeKeyListeners.forEach(r => r());
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
                        {availableDimensions =>
                          this.state.scaleActive ? (
                            <ImageAnnotaterWithZoom
                              addAnnotation={this.addAnnotation}
                              annotations={annotations}
                              availableDimensions={availableDimensions}
                              cursor={this.state.cursor}
                              deleteAnnotation={this.deleteAnnotation}
                              fileDimensions={dimensions}
                              filePath={this.props.file.absolutePath}
                              scale={this.state.scale}
                              selectedAnnoationIndex={this.state.selectedAnnotationIndex}
                              setCursor={this.setCursor}
                              setScale={this.setScale}
                              updateAnnotation={this.updateAnnotation}
                            />
                          ) : (
                            <ImageAnnotater
                              addAnnotation={this.addAnnotation}
                              annotations={annotations}
                              availableDimensions={availableDimensions}
                              cursor={this.state.cursor}
                              deleteAnnotation={this.deleteAnnotation}
                              fileDimensions={dimensions}
                              filePath={this.props.file.absolutePath}
                              selectedAnnoationIndex={this.state.selectedAnnotationIndex}
                              setCursor={this.setCursor}
                              updateAnnotation={this.updateAnnotation}
                            />
                          )
                        }
                      </AutoSizer>
                    )}
                  </Subscribe>
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" flex="0 0 200px" p={2}>
                <Text mb={2} flex="0 0 auto">
                  Annotations
                </Text>
                <AnnotationList
                  annotations={annotations}
                  cursor={this.state.cursor}
                  deleteAnnotation={this.deleteAnnotation}
                  keyEvents={this.props.keyEvents}
                  selectedAnnotationIndex={this.state.selectedAnnotationIndex}
                  selectAnnotation={this.selectAnnotation}
                />
              </Box>
            </Box>
          );
        }}
      </Subscribe>
    );
  }

  setScale = scale => this.setState({ scale });

  setCursor = cursor => this.setState({ cursor });
  selectAnnotation = index => this.setState({ selectedAnnotationIndex: index });
  addAnnotation = (x, y) => {
    this.props.file.addAnnotation(x, y);
    this.setState({ selectedAnnotationIndex: null });
  };
  deleteAnnotation = index => {
    this.props.file.deleteAnnotation(index);
    this.setState({ selectedAnnotationIndex: null });
  };
  updateAnnotation = (index, x, y) => {
    this.props.file.updateAnnotation(index, x, y);
    this.setState({ selectedAnnotationIndex: null });
  };
}

export default ImageContainer;
