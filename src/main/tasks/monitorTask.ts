import { loginGame } from './loginTask'
import { isGroupedTeam, liDui, yiJianZuDui } from './basicTasks'
import { keepZiDong } from './zhanDouTasks'
import { getGameWindows, getProcessesByName } from '../../utils/systemCotroll'
import GameWindowControl from '../../utils/gameWindowControll'
import { yiJianRiChang } from './riChangQianDao'
import { ipcMain } from 'electron'
import { Window as WinControl } from 'win-control'
import { sleep } from '../../utils/toolkits'
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

async function dianXianResolve() {
  await loginGame()
  await getGameWindows()
  const gameWindows = await [...GameWindowControl.getAllGameWindows().values()]

  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    const isGrouped = await isGroupedTeam(gameWindow)
    if (isGrouped) {
      await liDui()
      await sleep(500)
    }
  }

  for (const gameWindow of gameWindows) {
    if (gameWindow.roleInfo.defaultTeamLeader) {
      await yiJianZuDui(gameWindow.roleInfo.roleName)
    }
  }

  await keepZiDong()

  await yiJianRiChang()
}
export async function monitorGameDiaoXian() {
  const interval = setInterval(async () => {
    const processes = await getProcessesByName('asktao')
    const gameWindows = processes.map(([_, pId]) => {
      const gameWindow = WinControl.getByPid(+pId)
      
      return gameWindow
    })

    if (gameWindows.length !== 10 || !gameWindows.every((gameWindow) => gameWindow.getTitle().includes('线'))) {
      dianXianResolve()
      clearInterval(interval)
    }
  }, 5 * 1000)
}
