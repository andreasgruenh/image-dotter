import { app, BrowserWindow } from 'electron';
import windowStateKeeper from 'electron-window-state';

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

let mainWindow;

function createWindow() {
  const mainWindowState = windowStateKeeper();
  mainWindow = new BrowserWindow({ ...mainWindowState, webPreferences: { webSecurity: false } });
  mainWindow.setMenuBarVisibility(false);
  mainWindowState.manage(mainWindow);

  mainWindow.loadURL('http://localhost:3000');

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function() {
  app.quit();
});
