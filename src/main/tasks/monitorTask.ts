import path from 'path'
import { pythonImagesPath } from '../../paths'
import { randomName } from '../../utils/toolkits'
import { findImageWithinTemplate, screenCaptureToFile } from '../../utils/fileOperations'
import { loginGame } from './loginTask'
import { yiJianZuDui } from './basicTasks'
import { keepZiDong } from './zhanDouTasks'
import { getGameWindows } from '../../utils/systemCotroll'
import GameWindowControl from '../../utils/gameWindowControll'
import { yiJianRiChang } from './riChangQianDao'
import { ipcMain } from 'electron'

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

  ipcMain.on('monitor-game', monitorGameDiaoXian)
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
      await getGameWindows()
      const gameWindows = await [...GameWindowControl.getAllGameWindows().values()]

      for (const gameWindow of gameWindows) {
        if (gameWindow.roleInfo.defaultTeamLeader) {
          await gameWindow.setForeground()
          await yiJianZuDui(gameWindow.roleInfo.roleName)
        }
      }

      await keepZiDong()
      await yiJianRiChang()
    }
  }, 5 * 60 * 1000)
}
