import robotjs, { Bitmap } from 'robotjs'
import Jimp from 'jimp'
import { ipcMain } from 'electron'
import path from 'path'
import child_process from 'child_process'
import { pythonImagesPath, pythonPath } from '../../paths'
import robot from '../../utils/robot'
import random from 'random'

// 将截图文件转换为png图片
function screenCaptureToFile2(robotScreenPic: Bitmap, path: string) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Jimp(robotScreenPic.width, robotScreenPic.height)
      let pos = 0
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (_x, _y, idx) => {
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

function findImagePositions(srcImage: string, targetImage: string): Promise<Array<[number, number]>> {
  const filePath = path.join(pythonPath, 'findPositions.py')

  return new Promise((resolve, reject) => {
    const workerProcess = child_process.exec(`python -u ${filePath} ${srcImage} ${targetImage}`, (error, stdout) => {
      if (error) {
        console.log('findImagePos error: ', error)
        reject(error)
      }

      resolve(JSON.parse(stdout))
    })

    workerProcess.on('exit', () => {
      console.log('执行python脚本完成')
    })
  })
}

export function registerImageTasks() {
  ipcMain.on('get-image', async (_event, option: { x: number; y: number; fileName: string }) => {
    const { x, y, fileName } = option
    const bitmap = robotjs.screen.capture(x, y, 1920, 40)

    await screenCaptureToFile2(bitmap, path.join(__dirname, `../assets/${fileName}.png`))
  })

  // ipcMain.handle('get-image-pos', async () => {
  //   const res = await findImagePositions('', '')

  //   const [x, y] = JSON.parse(res)
  //   robot.keyTap('d', ['command'])
  //   setTimeout(() => {
  //     robot.moveMouseSmooth(x, y)
  //     robot.mouseClick('left', true)
  //     robot.keyTap('d', ['command'])
  //   }, 1000)

  //   return res
  // })

  ipcMain.on('start-game', async () => {
    robot.keyTap('d', ['command'])
    setTimeout(async () => {
      const screenCapture = robotjs.screen.capture()
      let srcImagePath = path.join(pythonImagesPath, 'temp/screenCapture.jpg')
      let targetImagePath = path.join(pythonImagesPath, 'GUIElements/gameLogo.png')
      await screenCaptureToFile2(screenCapture, srcImagePath)

      const [[x, y]] = await findImagePositions(srcImagePath, targetImagePath)

      robot.moveMouseSmooth(x + random.integer(10, 30), y + random.integer(10, 30))
      robot.mouseClick('left', true)

      srcImagePath = path.join(pythonImagesPath, 'temp/gameWindowCapture.jpg')
      targetImagePath = path.join(pythonImagesPath, 'GUIElements/startGame.png')
    }, 1000)
  })
}
