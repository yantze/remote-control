import { app, BrowserWindow, dialog } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import { autoUpdater } from 'electron-updater'

const isDevelopment = process.env.NODE_ENV !== 'production'

if (isDevelopment) {
  app.commandLine.appendSwitch('remote-debugging-port', '9223')
}

let mainWindow: Electron.BrowserWindow | null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 385,
    resizable: false,
    width: 460, // titlebar height 24px
  })

  if (isDevelopment) {
    mainWindow.loadURL(
      `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`,
    )
  } else {
    mainWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      }),
    )
  }

  if (isDevelopment) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow && mainWindow.focus()
    setImmediate(() => {
      mainWindow && mainWindow.focus()
    })
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

autoUpdater.on('error', error => {
  console.log('auto update error:', error)
})

autoUpdater.on('checking-for-update', () => {
  console.log('auto update checking')
})

autoUpdater.on('update-available', data => {
  console.log('auto update available:', data)
})

autoUpdater.on('update-not-available', data => {
  console.log('auto update not available:', data)
})

autoUpdater.on('download-progress', data => {
  console.log('auto update progress:', data)
})

autoUpdater.on('update-downloaded', (data, data2) => {
  console.log('auto update downloaded:', data, data2)
  const retId = dialog.showMessageBox({
    title: '有可用更新！',
    message: '最新版本已经下载，是否立即更新？',
    buttons: ['Cancel', 'OK'],
    cancelId: 0,
  } as Electron.MessageBoxOptions)
  if (retId === 1) {
    // install can not immediately
    autoUpdater.quitAndInstall()
  }
})
