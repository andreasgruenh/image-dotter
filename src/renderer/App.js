import React from 'react';
import styled from 'react-emotion';

import { Box } from './baseComponents';
import FilePicker from './FilePicker';
import { load, save } from './peristentState';

class App extends React.Component {
  state = {
    activeFileIndex: load('active-file-index'),
    files: []
  };
  render() {
    return (
      <Box height="100%" display="flex">
        <Box
          bg="#293436"
          color="white"
          display="flex"
          flex="0 0 200px"
          flexDirection="column"
          height="100%"
        >
          <Section>
            <FilePicker
              activeFileIndex={this.state.activeFileIndex}
              files={this.state.files}
              setActiveFileIndex={this.setActiveFileIndex}
              setFiles={this.setFiles}
            />
          </Section>
        </Box>
        <Box flex="1 1 auto">Content</Box>
      </Box>
    );
  }

  setFiles = files => {
    const hasOldFiles = this.state.files.length > 0;
    const oldFile = this.state.files[this.state.activeFileIndex] || {};
    const newFile = files[this.state.activeFileIndex] || {};

    if (hasOldFiles && oldFile.absolutePath !== newFile.absolutePath) {
      this.setState({ activeFileIndex: undefined });
    }

    this.setState({ files });
  };

  setActiveFileIndex = index => {
    this.setState({ activeFileIndex: index });
    save('active-file-index', index);
  };
}

export default App;

const Section = styled(Box)();
Section.defaultProps = {
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  p: 2,
  mb: 2,
  borderColor: 'blue'
};
