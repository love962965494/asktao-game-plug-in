import { ipcMain } from 'electron'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import { randomName } from '../../utils/toolkits'
import { findImageWithinTemplate, screenCaptureToFile } from '../../utils/fileOperations'
import { loginGame } from './imageTask'

export function registerMonitorTasks() {
  // TODO: 当需要循环检测老君查岗时，再把这段代码打开
  // const worker = new Worker(path.join(__dirname, '../workers/monitor.js'))
  // setInterval(async () => {
  //   const gameWindow = Window.getForeground()
  //   const gameWindowTitle = gameWindow.getTitle()
  //   const { left, right, top, bottom } = gameWindow.getDimensions()
  //   if (gameWindowTitle.includes('问道')) {
  //     const fileName = 'LaoJun_' + randomName()
  //     const filePath = path.join(pythonImagesPath, `temp/${fileName}.jpg`)
  //     await screenCaptureToFile(filePath, { x: left, y: top, width: right - left, height: bottom - top })
  //     worker.postMessage({ type: 'monitor LaoJun',  payload: { filePath } })
  //   }
  // }, 1000 * 10)


  monitorGameDiaoXian()
}

export async function monitorGameDiaoXian() {
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/diaoXian.jpg')
  const interval = setInterval(async () => {
    const tempCapturePath = path.join(pythonImagesPath, `temp/monitorGameDiaoXian_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath)

    const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

    if (found) {
      clearInterval(interval)
      await loginGame()
    }
  }, 5 * 1000)
}
