import { app, BrowserWindow, session, systemPreferences } from "electron";
import installExtension, { REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import path from "path";
import { setupScreenSharingMain, setupAlwaysOnTopMain, initPopupsConfigurationMain } from "jitsi-meet-electron-utils";
declare const APP_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}
app.commandLine.appendSwitch("disable-site-isolation-trials");

// https://bugs.chromium.org/p/chromium/issues/detail?id=1086373
app.commandLine.appendSwitch("disable-webrtc-hw-encoding");
app.commandLine.appendSwitch("disable-webrtc-hw-decoding");

// Needed until robot.js is fixed: https://github.com/octalmage/robotjs/issues/580
app.allowRendererProcessReuse = false;
const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 720,
    width: 1280,
    minWidth: 1024,
    minHeight: 576,
    webPreferences: {
      enableBlinkFeatures: "RTCInsertableStreams",
      nodeIntegration: true,
      enableRemoteModule: true,
      plugins: true,
      autoplayPolicy: "no-user-gesture-required",
      allowRunningInsecureContent: true,
      nativeWindowOpen: true,
      webSecurity: false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(APP_WEBPACK_ENTRY);
  initPopupsConfigurationMain(mainWindow);
  setupScreenSharingMain(mainWindow, "DYSTANCE");
  // mainWindow.setMenu(null);
  // console.log(__dirname);
  mainWindow.setIcon(path.join(__dirname, "../../src/components/sidebar/logo.png"));
};
// installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
//   .then((name) => console.log(`Added Extension:  ${name}`))
//   .catch((err) => console.log("An error occurred: ", err));
// Open the DevTools.
// mainWindow.webContents.openDevTools();

app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// app.userAgentFallback = app.userAgentFallback.replace(/Electron\/*/, '');
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
