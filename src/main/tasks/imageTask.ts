import robotjs, { Bitmap } from 'robotjs'
import Jimp from 'jimp'
import { ipcMain } from 'electron'
import path from 'path'
import child_process from 'child_process'
import { pythonImagesPath, pythonPath } from '../../paths'
import robot from '../../utils/robot'
import random from 'random'
import { getProcessesByName } from '../../utils/systemCotroll'
import GameWindowControl from '../../utils/gameWindowControll'

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

// 处理字符串输入
function handleCharKeyTap(char: string) {
  if (/[A-Z]/.test(char)) {
    robotjs.keyToggle('shift', 'down')
    robot.keyTap(char.toLowerCase())
    robotjs.keyToggle('shift', 'up')
  } else if (char === '*') {
    robotjs.keyToggle('shift', 'down')
    robot.keyTap('8')
    robotjs.keyToggle('shift', 'up')
  } else {
    robot.keyTap(char)
  }
}

function findImagePositions(
  srcImage: string,
  targetImage: string,
  minOffset: number = 0,
  maxOffset: number = 0
): Promise<Array<[number, number]>> {
  const filePath = path.join(pythonPath, 'findPositions.py')

  return new Promise((resolve, reject) => {
    const workerProcess = child_process.exec(`python -u ${filePath} ${srcImage} ${targetImage}`, (error, stdout) => {
      if (error) {
        console.log('findImagePos error: ', error)
        reject(error)
      }

      const positions: Array<[number, number]> = (JSON.parse(stdout.split('\r\n')[0]) as Array<[number, number]>).map(
        ([x, y]) => [x + random.integer(minOffset, maxOffset), y + random.integer(minOffset, maxOffset)]
      )

      resolve(positions)
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
      let targetImagePath = path.join(pythonImagesPath, 'GUIElements/gameLogo_100.png')
      await screenCaptureToFile2(screenCapture, srcImagePath)

      const [[x, y]] = await findImagePositions(srcImagePath, targetImagePath, 10, 30)

      robot.moveMouseSmooth(x, y, 1.5)
      robot.mouseClick('left', true)

      setTimeout(async () => {
        const processes = await getProcessesByName('asktao')
        const allGameWindows = GameWindowControl.getAllGameWindows()
        const [_, pid] = processes.filter(([_, pid]) => !allGameWindows.has(+pid))[0]
        const instance = new GameWindowControl(+pid)
        const { left, top } = instance.getBounds()
        const scaleFactor = instance.getScaleFactor()
        const alternateWindow = GameWindowControl.getAlternateWindow()

        // 47是登录界面防沉迷位置坐标
        const color = robotjs.getPixelColor(left + 47 * scaleFactor, top + 47 * scaleFactor)

        if (color === 'f8a830') {
          // 当前界面是登录界面
          const account = 'happy745266301'
          const password = 'Aa*13673390028'
          alternateWindow.show()
          robot.moveMouseSmooth(left + 460 * scaleFactor, top + 200 * scaleFactor, 1)
          alternateWindow.hide()
          robot.mouseClick('left', true)
          robot.keyTap('a', 'control')
          for (const char of account) {
            handleCharKeyTap(char)
          }

          alternateWindow.show()
          robot.moveMouseSmooth(left + 650 * scaleFactor, top + 400 * scaleFactor)
          alternateWindow.hide()
          robot.mouseClick('left', true)

          setTimeout(() => {
            alternateWindow.show()
            robot.moveMouseSmooth(left + 460 * scaleFactor, top + 230 * scaleFactor)
            alternateWindow.hide()
            robot.mouseClick('left', true)

            for (const char of password) {
              handleCharKeyTap(char)
            }
          }, 1000)
        }
      }, 1000 * 20)
    }, 1000)
  })
}
