import { ipcMain } from 'electron'
import GameWindowControl from '../../utils/gameWindowControll'
import { getGameWindows } from '../../utils/systemCotroll'
import { hasMeetLaoJun } from './zhanDouTasks'

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


  ipcMain.on('monitor-game-login-failed', async () => {
    const interval = setInterval(async (): Promise<void> => {
      await getGameWindows()
      const teamLeaderWindow = await GameWindowControl.getGameWindowByRoleName('Keyの兰花')
      await teamLeaderWindow?.setForeground()

      const result = await hasMeetLaoJun(teamLeaderWindow!)

      if (result) {
        clearInterval(interval)
      }

    }, 5 * 1000)
    // let sourceImagePath = path.join(pythonImagesPath, 'temp/test123.png')

    // const result = await paddleOcr(sourceImagePath)

    // console.log('result: ', result);
  })
}
