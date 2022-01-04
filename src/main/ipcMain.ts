import { BrowserWindow, ipcMain, screen } from 'electron'
import robot, { Bitmap } from 'robotjs'
import Jimp from 'jimp'
import path from 'path'
import { exec } from 'child_process'
import GameWindowControl from '../utils/gameWindowControll'

const pids = [16092]
const gameInstances = pids.map((pid) => new GameWindowControl(pid))
// TODO: 临时测试使用
const firstInstance = gameInstances[0]

ipcMain.on('get-mouse-pos', (event) => {
  const { x, y } = robot.getMousePos()

  event.reply('get-mouse-pos', { x, y })
})

ipcMain.on('move-mouse', (_event, { x, y }) => {
  robot.moveMouseSmooth(x, y)
  firstInstance.showGameWindow()

  robot.mouseClick('left', true)
})

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

ipcMain.on('get-image', async (_event, { x, y }) => {
  robot.moveMouseSmooth(222, 1056)
  robot.mouseClick()
  robot.moveMouseSmooth(x, y)
  const bitmap = robot.screen.capture(x, y, 1920, 40)

  await screenCaptureToFile2(bitmap, path.join(__dirname, '../assets/test.png'))
})

let subWindow: BrowserWindow | null = null

ipcMain.on('get-process', (event) => {
  const cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux'
  exec(cmd, function (err, stdout) {
    if (err) {
      console.log('get-process error: ', err)
      return
    }

    const processes = stdout
      .split('\n')
      .filter((item) => item.includes('cloudmusic'))
      .map((item) => {
        const [pName, pId] = item.trim().split(/\s+/)

        return [pName, pId]
      })

    firstInstance.showGameWindow()

    const { left, top, right, bottom } = firstInstance.getDimensions()
    const { scaleFactor } = screen.getPrimaryDisplay()

    subWindow = new BrowserWindow({
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

    console.log('bounds: ', subWindow.getBounds())

    subWindow.loadFile(path.join(__dirname, './test.html'))

    event.reply('get-process', processes)
  })
})
