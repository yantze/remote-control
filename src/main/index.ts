import { app, BrowserWindow, dialog, Tray, Menu, shell } from 'electron'
import * as path from 'path'
// import { format as formatUrl } from 'url'
import { autoUpdater } from 'electron-updater'
import autoLaunch from './auto-launch'
// import controlServer from './control-server'

const isDevelopment = process.env.NODE_ENV !== 'production'

if (isDevelopment) {
  app.commandLine.appendSwitch('remote-debugging-port', '9223')
}

app.allowRendererProcessReuse = false

if (process.platform === 'darwin') {
  app.dock.hide()
}

let mainWindow: Electron.BrowserWindow | null
let tray: Tray | null

const staticPath = path.join(__dirname, isDevelopment ? '../../static' : '../static')

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 311,
    resizable: false,
    width: 310, // titlebar height 24px
    show: false,
    frame: false,
    fullscreenable: false,
    // transparent: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    }

    // backgroundColor: '#2e2c2900',
    // hasShadow: false,
  })

  if (isDevelopment) {
    mainWindow!.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    mainWindow!.loadFile(path.resolve(__dirname, 'index.html'))
    // mainWindow!.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  }

  if (isDevelopment) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow!.webContents.on('devtools-opened', () => {
    mainWindow && mainWindow.focus()
    setImmediate(() => {
      mainWindow && mainWindow.focus()
    })
  })

  // Close window only hide it.
  mainWindow!.on('close', event => { })

  // Emitted when the window is closed.
  mainWindow!.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  return mainWindow
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  console.log('close4')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createTray()
  autoUpdater.checkForUpdatesAndNotify()

  // const locale = app.getLocale()
})

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  showWindow()
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

autoUpdater.on('update-downloaded', async (data, data2) => {
  console.log('auto update downloaded:', data, data2)
  const retId = await dialog.showMessageBox({
    title: 'Update available!',
    message: 'Update now?',
    buttons: ['Cancel', 'Yes'],
    cancelId: 0,
  } as Electron.MessageBoxOptions)
  if (retId.response === 1) {
    // install can not immediately
    autoUpdater.quitAndInstall()
  }
})

const createTray = async () => {
  const trayPath = path.join(staticPath, 'tray/tray.png')
  tray = new Tray(trayPath)

  const isEnabled = await autoLaunch.isEnabled()
  // const isShow = mainWindow && mainWindow.isVisible()
  // const isStartServer = controlServer.isStarted()
  const menuObject: any = [
    {
      label: 'Project Adress',
      click: () => {
        shell.openExternal('https://github.com/yantze/remote-control')
      },
    },
    {
      // label: (isStartServer ? 'Stop' : 'Start') + ' Server',
      label: 'Start Server',
      click: () => startServer(),
      checked: true,
    },
    {
      // label: (isShow ? 'Show' : 'Hide') + ' Remote Control',
      label: 'Toggle Remote control',
      click: toggleWindow,
    },
    {
      label: (isEnabled ? 'Stop' : 'Start') + ' at login',
      click: async () => {
        autoLaunch.setAutoLaunch(!isEnabled)
      },
    },
    {
      label: 'About',
      role: 'about',
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      click: () => {
        app.quit()
        console.log('go to quit:')
      },
    },
  ]
  const contextMenu = Menu.buildFromTemplate(menuObject)
  tray.setToolTip('Remote control')
  // tray.setContextMenu(contextMenu)

  tray.on('right-click', () => tray!.popUpContextMenu(contextMenu))
  // tray.on('double-click', toggleWindow)
  tray.on('click', event => {
    toggleWindow()

    // Show devtools when alt clicked
    if (mainWindow && mainWindow!.isVisible() && event.altKey) {
      mainWindow!.webContents.openDevTools({ mode: 'detach' })
    }
  })
}

const getWindowPosition = () => {
  const windowBounds = mainWindow!.getBounds()
  const trayBounds = tray!.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)

  let yOffset = 0
  if (process.platform == 'win32') {
    yOffset = -1 * windowBounds.height
  } else {
    yOffset += trayBounds.height
  }


  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + yOffset)

  return { x, y }
}

const showWindow = () => {
  if (!mainWindow) {
    mainWindow = createWindow()
  }

  const position = getWindowPosition()
  mainWindow!.setPosition(position.x, position.y, false)
  mainWindow!.show()
  mainWindow!.focus()
}

const toggleWindow = () => {
  if (!mainWindow || !mainWindow.isVisible()) {
    setTimeout(() => {
      showWindow()
    })
    return
  }

  return mainWindow.hide()
}

const startServer = () => {
  mainWindow!.webContents.send('operate-server', { set: 'start' })
}
