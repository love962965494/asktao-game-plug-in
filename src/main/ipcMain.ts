import { ipcMain } from 'electron'
import robot, { Bitmap } from 'robotjs'
import Jimp from 'jimp'
import path from 'path'

ipcMain.on('get-mouse-pos', (event) => {
  const { x, y } = robot.getMousePos()

  event.reply('get-mouse-pos', { x, y })
})

ipcMain.on('move-mouse', (_event, { x, y }) => {
  robot.moveMouseSmooth(1433, 858)
  robot.mouseClick('left')
  robot.keyTap('Q', 'alt')
  // robot.mouseToggle()
  // robot.setMouseDelay(2000)
  // robot.moveMouseSmooth(1404, 884)
  // robot.mouseClick('left')
  // robot.setMouseDelay(500)
  // robot.mouseClick('left')
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
