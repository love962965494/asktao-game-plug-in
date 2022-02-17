import robotjs from 'robotjs'
import { ipcMain } from 'electron'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import robotUtil from '../../utils/robot'
import { getProcessesByName } from '../../utils/systemCotroll'
import GameWindowControl from '../../utils/gameWindowControll'
import { findImagePositions, screenCaptureToFile } from '../../utils/fileOperations'

export function registerImageTasks() {
  ipcMain.on('get-image', async (_event, option: { x: number; y: number; fileName: string }) => {
    const { x, y, fileName } = option
    const bitmap = robotjs.screen.capture(x, y, 1920, 40)

    await screenCaptureToFile(bitmap, path.join(__dirname, `../assets/${fileName}.png`))
  })

  // ipcMain.handle('get-image-pos', async () => {
  //   const res = await findImagePositions('', '')

  //   const [x, y] = JSON.parse(res)
  //   robotUtil.keyTap('d', ['command'])
  //   setTimeout(() => {
  //     robotUtil.moveMouseSmooth(x, y)
  //     robotUtil.mouseClick('left', true)
  //     robotUtil.keyTap('d', ['command'])
  //   }, 1000)

  //   return res
  // })

  ipcMain.on('start-game', async () => {
    robotUtil.keyTap('d', ['command'])
    setTimeout(async () => {
      const screenCapture = robotjs.screen.capture()
      let srcImagePath = path.join(pythonImagesPath, 'temp/screenCapture.jpg')
      let targetImagePath = path.join(pythonImagesPath, 'GUIElements/gameLogo_100.png')
      await screenCaptureToFile(screenCapture, srcImagePath)

      const [[x, y]] = await findImagePositions(srcImagePath, targetImagePath, 10, 30)

      robotUtil.moveMouseSmooth(x, y, 1.5)
      robotUtil.mouseClick('left', true)

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
          robotUtil.moveMouseSmooth(left + 460 * scaleFactor, top + 200 * scaleFactor, 1)
          alternateWindow.hide()
          robotUtil.mouseClick('left', true)
          robotUtil.keyTap('a', 'control')
          for (const char of account) {
            robotUtil.handleCharKeyTap(char)
          }

          alternateWindow.show()
          robotUtil.moveMouseSmooth(left + 650 * scaleFactor, top + 400 * scaleFactor)
          alternateWindow.hide()
          robotUtil.mouseClick('left', true)

          setTimeout(() => {
            alternateWindow.show()
            robotUtil.moveMouseSmooth(left + 460 * scaleFactor, top + 230 * scaleFactor)
            alternateWindow.hide()
            robotUtil.mouseClick('left', true)

            for (const char of password) {
              robotUtil.handleCharKeyTap(char)
            }
          }, 1000)
        }
      }, 1000 * 20)
    }, 1000)
  })
}
