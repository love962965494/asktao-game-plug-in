import { globalShortcut, app } from 'electron'
import GameWindowControl from '../utils/gameWindowControll'
import { getGameWindows } from '../utils/systemCotroll'
import path from 'path'
import { logPath, pythonImagesPath } from '../paths'
import {
  findImagePositions,
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
import { hasMeetLaoJun, isInBattle, keepZiDong, waitFinishZhanDou } from './tasks/zhanDouTasks'
import { getTaskProgress, lingQuRenWu } from './tasks/xiuXing'
import { moveMouseToAndClick, moveMouseToBlank, readLog, writeLog } from '../utils/common'
import {
  fuShengLu,
  gouMaiYaoPin,
  meiRiRiChang_DanRen,
  meiRiRiChang_ZuDui,
  openFuLiCenter,
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
  xunHuanZiDong,
  yiJianZuDui,
} from './tasks/basicTasks'
import robotUtils from '../utils/robot'
import fs from 'fs'
import { loginGame } from './tasks/loginTask'
import { monitorGameDiaoXian } from './tasks/monitorTask'
import { xianJieTongJi } from './tasks/quanMin'
import { exec } from 'child_process'

export function registerGlobalShortcut() {
  for (let i = 0; i < 9; i++) {
    globalShortcut.register(`CommandOrControl+Alt+num${i}`, () => {
      const instance = [...GameWindowControl.getAllGameWindows().values()][i]
      const alternateWindow = GameWindowControl.getAlternateWindow()
      if (instance) {
        const { left, top } = instance.getBounds()

        alternateWindow.setPosition(left, top)
        alternateWindow.show()
      }
    })
  }

  globalShortcut.register('CommandOrControl+Alt+Enter', () => {
    const alternateWindow = GameWindowControl.getAlternateWindow()

    alternateWindow.hide()
  })

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
    await screenCaptureToFile(srcImagePath, [1337, 459], [136, 34])

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
  globalShortcut.register('CommandOrControl+Shift+F', async () => {
    await getGameWindows()
    const gameWindow = await GameWindowControl.getGameWindowByRoleName('Keyの旺财')!
    const findTarget = await findTargetInMap(gameWindow, '天墉城',  true)
    LOOP: while (true) {
      const position = await findTarget('wenQuXing')
      if (position.length === 2) {
        const distance = Math.sqrt(Math.pow(960 - position[0], 2) + Math.pow(540 - position[1], 2))
        if (distance > 400) {
          robotUtils.moveMouse(Math.round((position[0] + 960) / 2), Math.round((position[1] + 540) / 2))
          robotUtils.mouseClick('left', true)
          await sleep(2 * 1000)
          continue LOOP
        }
        robotUtils.keyToggle('shift', 'down')
        await moveMouseToAndClick(
          '',
          {
            buttonName: '',
            position: [position[0], position[1] - 200],
            size: [60, 200],
          },
          {
            callback: async () => {
              const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/findTarget.png')
              const tempCapturePath = path.join(pythonImagesPath, `temp/findTargetOfCheFu_${randomName()}.jpg`)
              await screenCaptureToFile(tempCapturePath)
  
              const found = await findImageWithinTemplate(tempCapturePath, templateImagePath, 0.9)
  
              return found
            },
          }
        )
        robotUtils.keyToggle('shift', 'up')
        break
      }
    }

    {
      const position = await findTarget('cheFu')
      if (position.length === 2) {
        robotUtils.keyToggle('shift', 'down')
        await moveMouseToAndClick(
          '',
          {
            buttonName: '',
            position: [position[0], position[1] - 200],
            size: [60, 200],
          },
          {
            callback: async () => {
              const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/findTarget.png')
              const tempCapturePath = path.join(pythonImagesPath, `temp/findTargetOfCheFu_${randomName()}.jpg`)
              await screenCaptureToFile(tempCapturePath)
  
              const found = await findImageWithinTemplate(tempCapturePath, templateImagePath, 0.9)
  
              return found
            },
          }
        )
        robotUtils.keyToggle('shift', 'up')
      }
    }
    // monitorGameDiaoXian()
    meiRiRiChang_DanRen()
    // await xianJieTongJi()
  })

  globalShortcut.register('CommandOrControl+Alt+L', async () => {
    app.exit(0)
  })

  globalShortcut.register('CommandOrControl+Alt+P', async () => {
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
    app.exit(0)
  })
}

export function unregisterGloableShortcut() {
  globalShortcut.unregisterAll()
}
