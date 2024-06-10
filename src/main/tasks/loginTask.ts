import { ipcMain } from 'electron'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import robotUtil from '../../utils/robot'
import { getProcessesByName, killProcessesByName } from '../../utils/systemCotroll'
import GameWindowControl from '../../utils/gameWindowControll'
import { findImagePositions, findImageWithinTemplate, screenCaptureToFile } from '../../utils/fileOperations'
import { randomName, randomNum, sleep } from '../../utils/toolkits'
import { clickGamePoint } from '../../utils/common'

export function registerLoginTasks() {
  ipcMain.on('start-game', loginGame)
}

export async function loginGame() {
  await killProcessesByName('asktao.mod')
  await killProcessesByName('StartAsktao.exe')
  robotUtil.keyTap('d', ['command'])
  await sleep(1000)
  let srcImagePath = path.join(pythonImagesPath, 'temp/screenCapture.jpg')
  let targetImagePath = path.join(pythonImagesPath, 'GUIElements/gameLogo_100.png')
  await screenCaptureToFile(srcImagePath)

  const [x, y] = await findImagePositions(srcImagePath, targetImagePath)

  const accountsGroupData: { account: string; password: string }[][] = global.appContext.accounts

  // TODO: 之后根据界面勾选的账号分组来决定登录那一组账号，现在是登录所有账号
  let loginSuccess = true
  loginLoop: for (const groupData of accountsGroupData) {
    for (const { account, password } of groupData) {
      robotUtil.moveMouseSmooth(x + 20, y + 20)
      robotUtil.mouseClick('left', true)

      let timeout1
      const promise1 = new Promise<number>((resolve) => {
        async function _test() {
          const tempCapturePath = path.join(pythonImagesPath, `temp/loginGame_${randomName()}.jpg`)
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/loginFlag.jpg')
          await screenCaptureToFile(tempCapturePath)
          const hasFound = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          if (!hasFound) {
            timeout1 = setTimeout(() => _test(), 1000)
          } else {
            resolve(1)
          }
        }

        _test()
      })

      let timeout2
      const promise2 = new Promise<number>((resolve) => {
        timeout2 = setTimeout(() => {
          resolve(2)
        }, 15 * 1000)
      })

      const result = await Promise.race([promise1, promise2])
      clearTimeout(timeout1)
      clearTimeout(timeout2)

      if (result !== 1) {
        // 跳转登录界面失败
        const tempCapturePath = path.join(pythonImagesPath, `temp/loginGame_${randomName()}.jpg`)
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/loginMenu.jpg')
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        if (!found) {
          // 获取文件列表失败
          const { position } = global.appContext.gamePoints['登录-获取文件列表']
          robotUtil.moveMouse(position[0], position[1])
          await sleep(200)
          robotUtil.mouseClick('left')
          // await clickGamePoint('登录-获取文件列表', 'loginGame')
          await sleep(500)
        }

        {
          const { position, size } = global.appContext.gamePoints['登录-进入游戏']
          robotUtil.moveMouse(position[0] + Math.round(size[0] / 2), position[1] + Math.round(size[1] / 2))
          await sleep(200)
          robotUtil.mouseClick('left')
        }
        await sleep(3000)
        {
          const { position, size } = global.appContext.gamePoints['登录-进入游戏']
          robotUtil.moveMouse(position[0] + Math.round(size[0] / 2), position[1] + Math.round(size[1] / 2))
          await sleep(200)
          robotUtil.mouseClick('left')
        }
        await sleep(5000)
        await clickGamePoint('登录-快捷登录', 'loginGame', {
          notMoveMouse: true,
        })
        loginSuccess = false
        break loginLoop
      }

      const processes = await getProcessesByName('asktao')
      const allGameWindows = GameWindowControl.getAllGameWindows()
      const [_, pid] = processes.filter(([_, pid]) => !allGameWindows.has(+pid))[0]
      const instance = new GameWindowControl(+pid)

      {
        let timeout1
        const promise1 = new Promise<number>((resolve) => {
          const { position, size } = global.appContext.gamePoints['登陆-账号输入']
          async function _test() {
            const tempCapturePath = path.join(pythonImagesPath, `temp/loginGame_${randomName()}.jpg`)
            const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/loginInput.png')
            await screenCaptureToFile(tempCapturePath, position, size)
            const hasFound = await findImageWithinTemplate(tempCapturePath, templateImagePath)

            if (!hasFound) {
              timeout1 = setTimeout(() => _test(), randomNum(200))
            } else {
              resolve(1)
            }
          }

          _test()
        })

        let timeout2
        const promise2 = new Promise<number>((resolve) => {
          async function _test() {
            const tempCapturePath = path.join(pythonImagesPath, `temp/loginGame_${randomName()}.jpg`)
            const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/loginFailed.png')
            await screenCaptureToFile(tempCapturePath)
            const hasFound = await findImageWithinTemplate(tempCapturePath, templateImagePath)

            if (!hasFound) {
              timeout2 = setTimeout(() => _test(), 3 * 1000)
            } else {
              resolve(2)
            }
          }

          _test()
        })
        
        const result = await Promise.race([promise1, promise2])
        clearTimeout(timeout1)
        clearTimeout(timeout2)

        if (result === 2) {
          loginSuccess = false
          break loginLoop
        }
      }
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

      await sleep(2000)
      await clickGamePoint('十三线', 'login', {
        tabOptions: {
          isTab: true,
          activeTabColor: '#147882',
        },
        notMoveMouse: true,
      })
      await instance.setForeground()
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
    }
  }

  if (!loginSuccess) {
    loginGame()
    return
  }

  // // 所有账号登录完毕后，每个游戏窗口都最大化
  const allGameWindows = [...GameWindowControl.getAllGameWindows().values()]
  for (let i = 0; i < allGameWindows.length; i++) {
    const gameWindow = allGameWindows[i]
    gameWindow.refreshRoleName()
    gameWindow.maximizGameWindow()
  }
}
