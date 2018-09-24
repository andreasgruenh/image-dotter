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
    cursor: null,
    selectedIndex: null
  };

  componentDidUpdate() {
    if (!this.annotationList) return;
    const focusThis = this.annotationList.childNodes[this.state.selectedIndex];
    if (!focusThis) return;
    focusThis.scrollIntoView();
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.resetMouseOver);
  }
  componentWillUnmount() {
    document.removeEventListener('mousemove', this.resetMouseOver);
  }
  render() {
    if (!this.props.file) return <Text>No image selected.</Text>;
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
                    return (
                      <img
                        style={style}
                        src={this.props.file.absolutePath}
                        onMouseDown={preventDefault}
                        onMouseMove={this.getMouseOver(useHeight ? heightRatio : widthRatio)}
                        onClick={this.getOnClick(useHeight ? heightRatio : widthRatio)}
                      />
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
            <Subscribe to={this.props.file.getState()}>
              {({ annotations }) => (
                <>
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
                    onClick={() => this.setState({ selectedIndex: Infinity })}
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
                </>
              )}
            </Subscribe>
          </AnnotationList>
        </Box>
      </Box>
    );
  }

  handleAnnotationListRef = list => (this.annotationList = list);

  getMouseOver = memoizeOne(ratio => event => {
    const x = Math.round(event.nativeEvent.offsetX * ratio);
    const y = Math.round(event.nativeEvent.offsetY * ratio);
    this.setState({ cursor: { x, y } });
  });

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
