import React from 'react';
import { render } from 'react-dom';

import App from './App';
import addGlobalStyles from './globalStyles';

const reactContainer = document.createElement('div');
document.body.appendChild(reactContainer);

render(<App />, reactContainer);

addGlobalStyles();
