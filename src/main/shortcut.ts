import { globalShortcut, app } from 'electron'
import GameWindowControl from '../utils/gameWindowControll'
import { getGameWindows } from '../utils/systemCotroll'
import path from 'path'
import { pythonImagesPath } from '../paths'
import {
  findImagePositions,
  findImageWithinTemplate,
  findMultiMatchPositions,
  matchImageWithTemplate,
  prePorcessingImage,
  screenCaptureToFile,
} from '../utils/fileOperations'
import robotjs from 'robotjs'
import { goToNPCAndTalk, hasGoneToNPC, talkToNPC } from './tasks/npcTasks'
import { randomName, sleep } from '../utils/toolkits'
import { escShouCangTasks, searchGameTask } from './tasks/gameTask'
import { hasMeetLaoJun, isInBattle, keepZiDong, waitFinishZhanDou } from './tasks/zhanDouTasks'
import { getTaskProgress, lingQuRenWu } from './tasks/xiuXing'
import { moveMouseToBlank, writeLog } from '../utils/common'
import { meiRiRiChang_DanRen, meiRiRiChang_ZuDui, xianJieTongJi, yiJianRiChang } from './tasks/riChangQianDao'
import { displayGameWindows, liDui, yiJianZuDui } from './tasks/basicTasks'
import robotUtils from '../utils/robot'

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

  globalShortcut.register('CommandOrControl+Alt+Q', () => {
    global.appContext.isInterrupted = true
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
    // 891, 967
    await screenCaptureToFile(srcImagePath, [932, 921], [36, 22])


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
    await keepZiDong()
  })

  globalShortcut.register('CommandOrControl+Alt+Q', async () => {
    app.quit()
  })
}

export function unregisterGloableShortcut() {
  globalShortcut.unregisterAll()
}
