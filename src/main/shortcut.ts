import { globalShortcut, app, dialog } from 'electron'
import GameWindowControl from '../utils/gameWindowControll'
import { gameWindows, getGameWindows, getProcessesByName } from '../utils/systemCotroll'
import path from 'path'
import { logPath, pythonImagesPath } from '../paths'
import {
  extractThemeColors,
  findImageWithinTemplate,
  findMultiMatchPositions,
  prePorcessingImage,
  removeBackground,
  screenCaptureToFile,
} from '../utils/fileOperations'
import robotjs from 'robotjs'
import { goToNPCAndTalk, hasGoneToNPC, hasNPCDialog, talkToNPC } from './tasks/npcTasks'
import { randomName, sleep } from '../utils/toolkits'
import { escShouCangTasks, searchGameTask } from './tasks/gameTask'
import {
  hasMeetLaoJun,
  isInBattle,
  isInBattleOfSmallScreen,
  isInBattle_1,
  keepZiDong,
  waitFinishZhanDou,
  waitFinishZhanDouOfSmallScreen,
  waitFinishZhanDou_1,
} from './tasks/zhanDouTasks'
import { getTaskProgress, lingQuRenWu } from './tasks/xiuXing'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank, readLog, writeLog } from '../utils/common'
import {
  fuShengLu,
  gouMaiYaoPin,
  meiRiRiChang_DanRen,
  meiRiRiChang_ZuDui,
  openFuLiCenter,
  shiMenRenWu,
  wuLeiLing,
  yiJianRiChang,
} from './tasks/riChang'
import {
  displayGameWindows,
  findTargetInMap,
  getCurrentGamePosition,
  getTeamsInfo,
  isGroupedTeam,
  liDui,
  yiJianZuDui,
} from './tasks/basicTasks'
import robotUtils from '../utils/robot'
import fs from 'fs'
import { loginGame } from './tasks/loginTask'
import { monitorGameDiaoXian } from './tasks/monitorTask'
import { jiuYaoShenYou, quanMinShengJi, xianJieTongJi } from './tasks/quanMin'
import { exec } from 'child_process'
import {
  HWND,
  SWP,
  WinControlInstance,
  Window as WinControl,
  WindowStates,
  WindowStatesTypeEnum,
  SWPTypeEnum,
} from 'win-control'
import { shiChen } from './tasks/basicFunction/shiChen'
import { getDirection, huangJinLuoPan } from './tasks/xianShiTasks/huangJinLuoPan'
import { gouMaiPingTai } from './tasks/basicFunction/gouMaiPingTai'
import { useWuPin } from './tasks/wuPinTask'

export function registerGlobalShortcut() {
  // TODO: 截图
  globalShortcut.register('CommandOrControl+Shift+S', async () => {
    async function _smallScreenCapture() {
      await getGameWindows()

      const allGameWindows = [...GameWindowControl.getAllGameWindows().values()]

      for (const gameWindow of allGameWindows) {
        gameWindow.restoreGameWindow()
      }

      const gameWindow = GameWindowControl.getGameWindowByRoleName('Kanonの')
      await gameWindow?.setForeground()
      const { left, top } = gameWindow?.getDimensions()!
      const randomName1 = 'testScreenCapture'
      let srcImagePath = path.join(pythonImagesPath, `testCapture/${randomName1}.jpg`)
      await screenCaptureToFile(srcImagePath, [left + 355, top + 275], [308, 139])
    }

    // _smallScreenCapture()
    const randomName1 = 'testScreenCapture'
    let srcImagePath = path.join(pythonImagesPath, `testCapture/${randomName1}.jpg`)
    // 1304, 464
    await screenCaptureToFile(srcImagePath, [1122, 535], [90, 15])

    // await screenCaptureToFile(srcImagePath)
    // const colors = await extractThemeColors(srcImagePath, 10)
    // for (const color of colors.split('\r\n')[0].replace('[', '').replace(']', '').split(',')) {
    //   console.log('color: ', color)
    // }
  })

  // TODO: 获取坐标
  globalShortcut.register('CommandOrControl+Shift+A', async () => {
    const alternateWindow = GameWindowControl.getAlternateWindow()
    alternateWindow.show()
    const { x, y } = robotjs.getMousePos()

    console.log('x: ', x)
    console.log('y: ', y)
  })

  // TODO: 放大
  globalShortcut.register('CommandOrControl+Shift+D', async () => {
    await getGameWindows()
  })

  // TODO: 缩小
  globalShortcut.register('CommandOrControl+Shift+G', async () => {
    await displayGameWindows()
  })

  // TODO: 测试用
  // 543 580
  // 543 616
  async function _setWindowTopMost() {
    const process = await getProcessesByName('ToDesk')
    const instance = WinControl.getByPid(+process[1][1])
    instance.setShowStatus(WindowStates.SHOW)
    instance.setPosition(HWND.TOPMOST, 1620, 0, 200, 200, SWP.SHOWWINDOW)
    console.log('process: ', process)
  }
  globalShortcut.register('CommandOrControl+Shift+F', async () => {
    await getGameWindows()
    // const gameWindows = [...(await GameWindowControl.getAllGameWindows().values())]
    // const teamLeaderWindow = await GameWindowControl.getGameWindowByRoleName('Kanonの')!
    // const gameWindow = await GameWindowControl.getGameWindowByRoleName('AngelBeat')!
    // // await teamLeaderWindow.setForeground()
    // // await escShouCangTasks('quanMinShuaDao', true, true)
    // // await fuShengLu(gameWindow)
    await meiRiRiChang_DanRen()
    // // await shiMenRenWu()

    // _setWindowTopMost()
  })

  globalShortcut.register('CommandOrControl+Alt+L', async () => {
    app.exit(0)
  })

  globalShortcut.register('CommandOrControl+Alt+Z', async () => {
    const processes = await getProcessesByName('asktao')
    const gameWindows = processes.map(([_, pId]) => {
      const gameWindow = WinControl.getByPid(+pId)

      return gameWindow
    })

    const allAccounts = global.appContext.accounts.flat(2)
    const loginAccounts: typeof allAccounts = []
    for (const gameWindow of gameWindows) {
      const title = gameWindow.getTitle()
      const loginAccount = allAccounts.find((accountInfo) =>
        accountInfo.roles.find((roleName) => title.includes(roleName))
      )

      if (loginAccount) {
        loginAccounts.push(loginAccount)
      }
    }

    const diaoXianAccounts = allAccounts.filter(
      (accountInfo) => !loginAccounts.find((loginAccountInfo) => loginAccountInfo.account === accountInfo.account)
    )

    if (diaoXianAccounts.length > 0) {
      await dialog.showMessageBox({
        type: 'info',
        buttons: ['知道了'],
        message: `掉线账号：${JSON.stringify(
          diaoXianAccounts.map((item) => item.account),
          undefined,
          4
        )}`,
      })
    }
  })
}

export function unregisterGloableShortcut() {
  globalShortcut.unregisterAll()
}
