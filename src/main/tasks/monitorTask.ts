import { loginGame } from './loginTask'
import { isGroupedTeam, liDui, yiJianZuDui } from './basicTasks'
import { keepZiDong } from './zhanDouTasks'
import { getGameWindows, getProcessesByName } from '../../utils/systemCotroll'
import GameWindowControl from '../../utils/gameWindowControll'
import { yiJianRiChang } from './riChang'
import { ipcMain } from 'electron'
import { Window as WinControl } from 'win-control'
import { sleep } from '../../utils/toolkits'
import { app } from 'electron'
import { xianJieShenBu } from './xiuXing/xianJieShenBu'
import commonConfig from '../../constants/config.json'

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

export async function dianXianResolve() {
  await loginGame()
  await getGameWindows()
  const gameWindows = await [...GameWindowControl.getAllGameWindows().values()]
  monitorGameDiaoXian()

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

  // for (const gameWindow of gameWindows) {
  //   await gameWindow.setForeground()
  //   // 检查每个角色是否在队伍中，没有暂离
  // }

  await keepZiDong()

  await yiJianRiChang()
  // await xianJieShenBu()
}

export async function monitorGameDiaoXian() {
  const interval = setInterval(async () => {
    const processes = await getProcessesByName('asktao')
    const gameWindows = processes.map(([_, pId]) => {
      const gameWindow = WinControl.getByPid(+pId)

      return gameWindow
    })

    if (gameWindows.length !== commonConfig.accountsNum || !gameWindows.every((gameWindow) => gameWindow.getTitle().includes('线'))) {
      clearInterval(interval)
      await sleep(10 * 60 * 1000)
      app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
      app.exit(0)
    }
  }, 5 * 60 * 1000)
}
