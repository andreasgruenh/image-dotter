import React from 'react';

import { Box } from './baseComponents';

class App extends React.Component {
  render() {
    return (
      <Box height="100%" display="flex">
        <Box bg="yellow" height="100%" flex="0 0 auto">
          Navigation
        </Box>
        <Box bg="blue" flex="1 1 auto">
          Content
        </Box>
      </Box>
    );
  }
}

export default App;
