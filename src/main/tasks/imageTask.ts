import robotjs from 'robotjs'
import { ipcMain, screen } from 'electron'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import robotUtil from '../../utils/robot'
import { getProcessesByName, killProcessesByName } from '../../utils/systemCotroll'
import GameWindowControl from '../../utils/gameWindowControll'
import { findImagePositions, screenCaptureToFile } from '../../utils/fileOperations'
import { sleep } from '../../utils/toolkits'

export function registerImageTasks() {
  ipcMain.on('start-game', async () => {
    await killProcessesByName('asktao.mod')
    robotUtil.keyTap('d', ['command'])
    await sleep(1000)
    let srcImagePath = path.join(pythonImagesPath, 'temp/screenCapture.jpg')
    let targetImagePath = path.join(pythonImagesPath, 'GUIElements/gameLogo_100.png')
    await screenCaptureToFile(srcImagePath)

    const [x, y] = await findImagePositions(srcImagePath, targetImagePath)

    const accountsGroupData: { account: string; password: string }[][] = global.appContext.accounts

    // TODO: 之后根据界面勾选的账号分组来决定登录那一组账号，现在是登录所有账号
    for (const groupData of accountsGroupData) {
      for (const { account, password } of groupData) {
        robotUtil.moveMouseSmooth(x + 20, y + 20)
        robotUtil.mouseClick('left', true)
        // TODO: 后续改成检测到游戏进入登录界面后，再处理
        await sleep(1000 * 15)
        const processes = await getProcessesByName('asktao')
        const allGameWindows = GameWindowControl.getAllGameWindows()
        const [_, pid] = processes.filter(([_, pid]) => !allGameWindows.has(+pid))[0]
        const instance = new GameWindowControl(+pid)
        const { left, top } = instance.getBounds()
        const scaleFactor = instance.getScaleFactor()

        // 47是登录界面防沉迷位置坐标
        const color = robotjs.getPixelColor(left + 47 * scaleFactor, top + 47 * scaleFactor)

        if (color === 'ffaa31') {
          // 当前界面是登录界面
          for (const char of account.toUpperCase()) {
            robotUtil.handleCharKeyTap(char)
          }
          
          robotUtil.keyTap('tab')

          await sleep(500)

          for (const char of password) {
            robotUtil.handleCharKeyTap(char)
          }

          // 输入完账号密码后，按Enter键进入选择线路界面
          robotUtil.keyTap('enter')

          // TODO: 后续实现选择指定线路功能
          await sleep(1000)
          robotUtil.keyTap('enter')

          // TODO: 后续实现选择指定角色
          await sleep(1000)
          robotUtil.keyTap('enter')

          await sleep(2000)
          robotUtil.keyTap('B', ['control'])
          await sleep(1000)
          robotUtil.keyTap('1', 'alt')

          // 登录一个角色后，重新回到桌面，继续登录下一个角色
          await sleep(2000)
          robotUtil.keyTap('d', ['command'])
        } else {
          // TODO: 如果没有自动跳入登录界面，需要手动选择区的话，到时候考虑实现
        }
      }
    }

    // // 所有账号登录完毕后，每个游戏窗口都最大化
    const allGameWindows = [...GameWindowControl.getAllGameWindows().values()]
    // const {
    //   size: { width, height },
    // } = screen.getPrimaryDisplay()
    for (let i = 0; i < allGameWindows.length; i++) {
      const gameWindow = allGameWindows[i]
      gameWindow.refreshRoleName()
      gameWindow.maximizGameWindow()
      // const { left, right, top, bottom } = gameWindow.getBounds()
      // const gameWindowWidth = right - left
      // const gameWindowHeight = bottom - top
      // switch (i) {
      //   case 0:
      //     gameWindow.setPosition(0, 0)
      //     break
      //   case 1:
      //     gameWindow.setPosition(width - gameWindowWidth, 0)
      //     break
      //   case 2:
      //     gameWindow.setPosition(Math.round((width - gameWindowWidth) / 2), Math.round((height - gameWindowHeight) / 2))
      //     break
      //   case 3:
      //     gameWindow.setPosition(0, height - gameWindowHeight - 50)
      //     break
      //   case 4:
      //     gameWindow.setPosition(width - gameWindowWidth, height - gameWindowHeight - 50)
      // }
    }
  })
}
