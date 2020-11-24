import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { setupScreenSharingMain, initPopupsConfigurationMain } from "jitsi-meet-electron-utils";
import express from "express";

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
function isDebug() {
  return process.env.npm_lifecycle_event === "start";
}

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
    },
    show: false
  });
  //Splash Screen when app is loading
  const splash = new BrowserWindow({ width: 500, height: 400, frame: false, resizable: false });
  splash.loadURL(path.join(__dirname, "../../src/main/splash.html"));

  // and load the index.html of the app.
  if (isDebug()) {
    mainWindow.webContents.openDevTools();
    mainWindow.loadURL(APP_WEBPACK_ENTRY);
  } else {
    const exApp = express();
    exApp.set("port", process.env.PORT || 3000);
    exApp.use(express.static(path.resolve(__dirname, "..", "renderer")));
    exApp.use("/app/assets", express.static(path.resolve(__dirname, "..", "renderer/assets")));
    const server = exApp.listen(exApp.get("port"), () => {
      mainWindow.loadURL(`http://localhost:${(server.address() as any).port}/app`);
    });
  }
  mainWindow.setIcon(path.join(__dirname, "../../src/components/sidebar/logo.png"));
  initPopupsConfigurationMain(mainWindow);
  setupScreenSharingMain(mainWindow, "DYSTANCE");

  //Removes the splash screen and display the app when it is done loading
  mainWindow.once("ready-to-show", () => {
    splash.destroy();
    mainWindow.show();
  });

  ipcMain.on("restore-and-focus", () => {
    mainWindow.restore();
    mainWindow.focus();
  });

  //Send app-close event to ipcRenderer
  mainWindow.on("close", () => {
    mainWindow.webContents.send("app-close");
  });
  // mainWindow.setMenu(null);
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
app.setAppUserModelId(process.execPath);
// app.userAgentFallback = app.userAgentFallback.replace(/Electron\/*/, '');
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
