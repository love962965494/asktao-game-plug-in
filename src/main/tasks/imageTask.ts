import robot, { Bitmap } from 'robotjs'
import Jimp from 'jimp'
import { ipcMain } from 'electron'
import path from 'path'
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

export function registerImageTasks() {
  ipcMain.on('get-image', async (_event, option: { x: number; y: number; fileName: string }) => {
    const { x, y, fileName } = option
    const bitmap = robot.screen.capture(x, y, 1920, 40)

    await screenCaptureToFile2(bitmap, path.join(__dirname, `../assets/${fileName}.png`))
  })
}
