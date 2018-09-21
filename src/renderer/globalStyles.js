import { injectGlobal } from 'emotion';

function addGlobalStyles() {
  injectGlobal`
    * {
      box-sizing: border-box;
      overflow: hidden;
    }

    html {
      font-family: Tahoma;
      font-size: 16px;
    }

    body {
      padding: 0;
      margin: 0;
    }

    html, body, body > div {
      height: 100%;
    }
  `;
}

export default addGlobalStyles;
