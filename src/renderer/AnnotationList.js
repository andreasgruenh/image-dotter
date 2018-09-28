import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { arrayOf, func, instanceOf, number, shape } from 'prop-types';
import React from 'react';
import styled from 'react-emotion';

import { Box } from './baseComponents';
import KeyEvents from './KeyEvents';

class AnnotationList extends React.Component {
  static propTypes = {
    annotations: arrayOf(arrayOf(number)),
    cursor: shape({ x: number.isRequired, y: number.isRequired }),
    deleteAnnotation: func.isRequired,
    keyEvents: instanceOf(KeyEvents).isRequired,
    selectedAnnotationIndex: number,
    selectAnnotation: func.isRequired
  };

  listRef = React.createRef();

  componentDidUpdate() {
    if (!this.listRef.current) return;
    const indexToFocus =
      this.props.selectedAnnotationIndex === null
        ? this.props.annotations.length - 1
        : this.props.selectedAnnotationIndex;
    const focusThis = this.listRef.current.childNodes[indexToFocus];
    if (!focusThis) return;
    focusThis.scrollIntoView();
  }

  componentDidMount() {
    this.removeKeyListeners = [
      this.props.keyEvents.addDownListener(' ', () => {
        console.log(this.props.annotations.length);
        const nextIndex =
          this.props.selectedAnnotationIndex === null
            ? this.props.annotations.length - 1
            : this.props.selectedAnnotationIndex - 1;

        if (nextIndex < 0) return;
        this.props.selectAnnotation(nextIndex);
      })
    ];
  }
  componentWillUnmount() {
    this.removeKeyListeners.forEach(r => r());
  }

  render() {
    const { annotations, deleteAnnotation, selectedAnnotationIndex, selectAnnotation } = this.props;
    return (
      <List flex="1 1 auto" innerRef={this.listRef}>
        {annotations.map(([x, y], index) => {
          const selected = index === selectedAnnotationIndex;
          const onClick = selected ? () => deleteAnnotation(index) : () => selectAnnotation(index);
          return (
            <ListItem key={index} selected={selected} onClick={onClick}>
              {x}:{y}
              {selected && <FontAwesomeIcon icon="trash-alt" />}
            </ListItem>
          );
        })}
        <ListItem
          color="#53605C"
          onClick={() => this.props.selectAnnotation(null)}
          selected={this.props.selectedAnnotationIndex === null}
        >
          {this.props.cursor ? (
            <>
              {this.props.cursor.x}:{this.props.cursor.y}
            </>
          ) : (
            <>?:?</>
          )}
        </ListItem>
      </List>
    );
  }
}

const List = styled(Box)`
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

export default AnnotationList;
