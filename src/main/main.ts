import path from 'path'
import { app, BrowserWindow, shell } from 'electron'
import MenuBuilder from './menu'
import { resolveHtmlPath } from './util'
import registerTasks from './tasks'
import { registerGlobalShortcut, unregisterGloableShortcut } from './shortcut'
import { getProcessesByName } from '../utils/systemCotroll'
import GameWindowControl from '../utils/gameWindowControll'
import startServer from '../server'
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer'

// 服务端端口号
const port = 3000

let mainWindow: BrowserWindow | null = null

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

if (isDevelopment) {
  require('electron-debug')()
}

const createWindow = async () => {
  if (isDevelopment) {
    await installExtension(REACT_DEVELOPER_TOOLS)
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.loadURL(resolveHtmlPath('index.html'))

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })
}

/**
 * 获取游戏进程，创建对应实例和伴生的控制窗口
 */
async function createGameInstances() {
  const processes = await getProcessesByName('asktao')

  processes.map(([_pName, pId], index) => {
    const instance = new GameWindowControl(+pId)

    instance.setPosition(1920 + (index % 5) * 300, Math.min(Math.max(index - 4, 0), 1) * 400)
  })
}

function init() {
  createWindow()
  // 启动服务端服务
  startServer(port)
  // 创建游戏实例
  // createGameInstances()
  // 启动ipc通信，注册各种任务
  registerTasks()
  // 注册全局快捷键
  registerGlobalShortcut()
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app
  .whenReady()
  .then(() => {
    init()
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow()
    })
  })
  .catch(console.log)

app.on('will-quit', () => {
  // 卸载全局快捷键
  unregisterGloableShortcut()
})

export { mainWindow }
