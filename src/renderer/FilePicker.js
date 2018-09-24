import { remote } from 'electron';
import { extname, join } from 'path';
import { array, func, number } from 'prop-types';
import React from 'react';
import styled from 'react-emotion';
import { Subscribe } from 'resubscribe';

import { Box, Text } from './baseComponents';
import File from './File';
import { load, save } from './peristentState';

const fs = remote.require('fs-extra');

class FilePicker extends React.Component {
  static propTypes = {
    activeFileIndex: number,
    setActiveFileIndex: func.isRequired,
    files: array,
    setFiles: func.isRequired
  };

  state = {
    directory: null
  };

  componentDidMount() {
    this.refreshFiles();
  }

  render() {
    return (
      <Box flex="1 1 auto" display="flex" flexDirection="column" height="100%">
        <Text flex="0 0 auto" mb={2}>
          Files
        </Text>
        <PickerBox flex="1 1 200px" bg="#53605C" as="ul" py="2">
          {this.props.files.map((file, index) => (
            <ListItem
              key={file.fileName}
              selected={this.props.activeFileIndex === index}
              onClick={() => this.props.setActiveFileIndex(index)}
            >
              <Box>{file.fileName}</Box>
              <Subscribe to={file.getState()}>{({ annotations }) => annotations.length}</Subscribe>
            </ListItem>
          ))}
        </PickerBox>
        <Box flex="0 0 auto" display="flex" justifyContent="space-between" pt={2}>
          <button onClick={this.selectDirectory}>Select directory</button>
          <button onClick={this.refreshFiles}>Refresh</button>
        </Box>
      </Box>
    );
  }

  selectDirectory = async () => {
    const directories = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (!directories) return;
    const directory = directories[0];
    this.setState({ directory });

    save('file-picker-dir', directory);
    this.refreshFiles();
  };

  refreshFiles = async () => {
    const directory = this.state.directory || load('file-picker-dir');
    if (!directory) return;

    const files = await fs.readdir(directory);
    if (!files) return;

    const fileInstances = files
      .filter(relativePath => extname(relativePath) !== '.txt')
      .map(relativePath => join(directory, relativePath))
      .map(absolutePath => new File(absolutePath));

    this.props.setFiles(fileInstances);
  };
}

export default FilePicker;

const PickerBox = styled(Box)`
  overflow-y: auto;

  li {
    list-style-type: none;
  }
`;

const ListItem = styled(Box)`
  align-items: center;
  cursor: pointer;
  display: flex;
  background: ${props => (props.selected ? '#293436' : 'transparent')};

  &:hover {
    background: #293436;
  }
`;
ListItem.defaultProps = {
  as: 'li',
  fontSize: '0',
  display: 'flex',
  justifyContent: 'space-between',
  px: 2,
  py: 1
};
