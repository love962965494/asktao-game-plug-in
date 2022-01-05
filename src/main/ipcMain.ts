import { BrowserWindow, ipcMain, screen } from 'electron'
import robot, { Bitmap } from 'robotjs'
import Jimp from 'jimp'
import path from 'path'
import GameWindowControl from '../utils/gameWindowControll'
import { getProcessesByName } from 'utils/systemCotroll'

// 存放游戏实例和对应的electron窗口
const windows: Array<{ gameInstance: GameWindowControl; subWindow: BrowserWindow }> = []

// 将截图文件转换为png图片
function screenCaptureToFile2(robotScreenPic: Bitmap, path: string) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Jimp(robotScreenPic.width, robotScreenPic.height)
      let pos = 0
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
        image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++)
      })
      image.write(path, resolve)
    } catch (e) {
      console.error(e)
      reject(e)
    }
  })
}

async function init() {
  const processes = await getProcessesByName('asktao')

  const gameInstances = processes.map(([_pName, pId]) => {
    const gameInstance = new GameWindowControl(+pId)

    return gameInstance
  })

  for (const gameInstance of gameInstances) {
    gameInstance.showGameWindow()

    const { left, top, right, bottom } = gameInstance.getDimensions()
    const { scaleFactor } = screen.getPrimaryDisplay()

    const subWindow = new BrowserWindow({
      width: (right - left) / scaleFactor,
      height: (bottom - top) / scaleFactor,
      x: left,
      y: top,
      show: true,
      frame: false,
      webPreferences: {
        devTools: false,
      },
    })

    windows.push({
      gameInstance,
      subWindow,
    })
  }

  ipcMain.on('get-mouse-pos', (event) => {
    const { x, y } = robot.getMousePos()

    event.reply('get-mouse-pos', { x, y })
  })

  ipcMain.on('move-mouse', (_event, { x, y }) => {
    robot.moveMouseSmooth(x, y)
  })

  ipcMain.on('get-image', async (_event, { x, y, fileNmae }) => {
    robot.moveMouseSmooth(x, y)
    const bitmap = robot.screen.capture(x, y, 1920, 40)

    await screenCaptureToFile2(bitmap, path.join(__dirname, `../assets/${fileNmae}.png`))
  })

  // subWindow.loadFile(path.join(__dirname, './test.html'))
}

// 初始化各种ipcMain事件
init()
