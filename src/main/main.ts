import path from 'path'
import { app, BrowserWindow, shell } from 'electron'
import MenuBuilder from './menu'
import { resolveHtmlPath } from './util'
import registerTasks from './tasks'
import { registerGlobalShortcut, unregisterGloableShortcut } from './shortcut'
import startServer from '../server'
import { deleteDir } from '../utils/fileOperations'
import { pythonImagesPath } from '../paths'
import registerWorkers from './workers'
import { ICityMap, IGameConfig, IGamePoints, IGameTask, INPC } from 'constants/types'
import { dianXianResolve } from './tasks/monitorTask'

// 服务端端口号
const port = 3000

global.appContext = {
  isInterrupted: false,
  accounts: [],
  npc: {} as INPC,
  gameTask: {} as IGameTask,
  gamePoints: {} as IGamePoints,
  // 空白鼠标坐标
  mousePositions: [
    { position: [1760, 80], size: [50, 20] },
    { position: [130, 110], size: [40, 40] },
  ],
  gameConfig: {} as IGameConfig,
  cityMap: {} as ICityMap,
  hasFoundTarget: false,
}

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
  // if (isDevelopment) {
  //   await installExtension(REACT_DEVELOPER_TOOLS)
  // }

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

function init() {
  createWindow()

  // 启动服务端服务
  // startServer(port)
  // 创建游戏实例
  // createGameInstances()
  // 注册workers
  registerWorkers()
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

app.on('ready', () => {
  if (process.argv.includes('--relaunch')) {
    dianXianResolve()
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

app.on('before-quit', async (event) => {
  event.preventDefault()
  // 卸载全局快捷键
  unregisterGloableShortcut()
  // 删除python下临时图片文件夹
  await deleteDir(path.join(pythonImagesPath, 'temp'))

  app.quit()
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // 在这里添加处理逻辑，如记录错误、向用户显示错误信息等
  // 注意：在此处发生的错误可能导致应用程序不稳定，建议在此处仅记录错误信息，并尽快修复应用程序
})

export { mainWindow }
