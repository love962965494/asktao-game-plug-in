import robot, { Bitmap } from 'robotjs'
import Jimp from 'jimp'
import { ipcMain } from 'electron'
import path from 'path'
import child_process from 'child_process'
import { pythonPath } from '../../paths'
import { mainWindow } from '../main'
import { sleep } from '../../utils/toolkits'

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

function findImagePos(): Promise<string> {
  const filePath = path.join(pythonPath, 'findPos.py')

  return new Promise((resolve, reject) => {
    const workerProcess = child_process.exec(`python -u ${filePath}`, (error, stdout) => {
      if (error) {
        console.log('findImagePos error: ', error)
        reject(error)
      }

      resolve(stdout)
    })

    workerProcess.on('exit', () => {
      console.log('执行python脚本完成')
    })
  })
}

export function registerImageTasks() {
  ipcMain.on('get-image', async (_event, option: { x: number; y: number; fileName: string }) => {
    const { x, y, fileName } = option
    const bitmap = robot.screen.capture(x, y, 1920, 40)

    await screenCaptureToFile2(bitmap, path.join(__dirname, `../assets/${fileName}.png`))
  })

  ipcMain.handle('get-image-pos', async () => {
    const res = await findImagePos()

    const [x, y] = JSON.parse(res)
    robot.keyTap('d', ['command'])
    setTimeout(() => {
      robot.moveMouseSmooth(x, y)
      robot.mouseClick('left', true)
      robot.keyTap('d', ['command'])
    }, 1000)

    return res
  })
}
