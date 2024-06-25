import { loginGame } from './loginTask'
import { displayGameWindows, isGroupedTeam, liDui, yiJianZuDui } from './basicTasks'
import { buChongZhuangTai, isInBattle_1, keepZiDong, waitFinishZhanDou_1 } from './zhanDouTasks'
import { getGameWindows, getProcessesByName } from '../../utils/systemCotroll'
import GameWindowControl from '../../utils/gameWindowControll'
import { bangPaiZuDui, yiJianRiChang } from './riChang'
import { ipcMain } from 'electron'
import { Window as WinControl } from 'win-control'
import { sleep } from '../../utils/toolkits'
import { app } from 'electron'
import { xianJieShenBu } from './xiuXing/xianJieShenBu'
import commonConfig from '../../constants/config.json'
import robotUtils from '../../utils/robot'
import { clickGamePoint } from '../../utils/common'

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
  await displayGameWindows()
  await sleep(10 * 1000)
  await loginGame()
  await getGameWindows(true)
  monitorGameDiaoXian()

  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    robotUtils.keyTap('2', ['control'])
    await sleep(1000)
  }

  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()

    await waitFinishZhanDou_1(gameWindow)
    robotUtils.keyTap('f1')
    await sleep(500)
    robotUtils.keyTap('f1')
    await sleep(1000)
  }

  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()

    let index = 0
    while (index < 3) {
      await clickGamePoint('角色图像', 'buChongZhuangTai', { rightClick: true, notCheck: true })
      await sleep(500)
      index++
    }
  }

  await bangPaiZuDui()

  await yiJianRiChang(false)
  // await xianJieShenBu()
}

export async function monitorGameDiaoXian() {
  const interval = setInterval(async () => {
    const processes = await getProcessesByName('asktao')
    const gameWindows = processes.map(([_, pId]) => {
      const gameWindow = WinControl.getByPid(+pId)

      return gameWindow
    })

    if (
      gameWindows.length !== commonConfig.accountsNum ||
      !gameWindows.every((gameWindow) => gameWindow.getTitle().includes('线'))
    ) {
      clearInterval(interval)
      await sleep(10 * 60 * 1000)
      app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
      app.exit(0)
    }
  }, 5 * 60 * 1000)
}
