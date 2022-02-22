import { GameAccount, GameAccountList, Point } from '../../constants/types'
import { ipcMain } from 'electron'
import robot from 'robotjs'
import robotUtil from '../../utils/robot'
import path from 'path'
import GameWindowControl from '../../utils/gameWindowControll'
import { setTimeoutPromise } from '../../utils/toolkits'
import { constantsPath, pythonImagesPath } from '../../paths'
import { findImagePositions, screenCaptureToFile } from '../../utils/fileOperations'
import { getProcessesByName } from '../../utils/systemCotroll'
import fs from 'fs/promises'

const YouDaoPid = 10272

async function* youdaoTask() {
  const processes = await getProcessesByName('YoudaoDict')
  const [_, pid] = processes[0]
  const instance = new GameWindowControl(+pid)
  const alternateWindow = GameWindowControl.getAlternateWindow()
  const { left, top, right, bottom } = instance.getBounds()
  const scaleFactor = instance.getScaleFactor()

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtil.moveMouseSmooth(left + 600 * scaleFactor, top + 400 * scaleFactor)
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtil.mouseClick('left')
  robot.typeString('youdao ')
  yield

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtil.moveMouseSmooth(left + 800 * scaleFactor, top + 90 * scaleFactor)
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtil.mouseClick('left', true)
  robot.typeString('task ')
  yield

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtil.moveMouseSmooth(left + 800 * scaleFactor, top + 90 * scaleFactor)
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtil.mouseClick('left', true)
  robot.typeString('has ')
  yield

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtil.moveMouseSmooth(left + 800 * scaleFactor, top + 90 * scaleFactor)
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtil.mouseClick('left', true)
  robot.typeString('finished!')
  yield
}

async function* startGameTask() {
  robotUtil.keyTap('d', ['command'])
  let positions: Array<[number, number]> = []

  await setTimeoutPromise(async () => {
    const screenCapture = robot.screen.capture()
    let srcImagePath = path.join(pythonImagesPath, 'temp/screenCapture.jpg')
    let targetImagePath = path.join(pythonImagesPath, 'GUIElements/textnote.jpg')

    await screenCaptureToFile(screenCapture, srcImagePath)
    positions = await findImagePositions(srcImagePath, targetImagePath, 10, 30, 5)
  }, 1000)

  if (positions.length === 0) {
    console.log('findImagePositions error')
    throw new Error('没有找到对应坐标')
  }

  const [x, y] = positions[0]
  const gameAccountList: GameAccountList = JSON.parse(
    await fs.readFile(path.resolve(constantsPath, 'GameAccountList.json'), 'utf-8')
  )
  const accounts = gameAccountList.flatMap((group) => group.accountList)

  async function _login({ account, password }: GameAccount, i: number) {
    // 打开应用程序
    robotUtil.moveMouseSmooth(x, y)
    robotUtil.mouseClick('left', true)

    await setTimeoutPromise(async () => {
      const processes = await getProcessesByName('notepad')
      const allGameWindows = GameWindowControl.getAllGameWindows()
      const [_, pid] = processes.filter(([_, pid]) => !allGameWindows.has(+pid))[0]
      const instance = new GameWindowControl(+pid)
      const scaleFactor = instance.getScaleFactor()
      const alternateWindow = GameWindowControl.getAlternateWindow()
      const left = (i % 5) * 300
      const top = Math.min(Math.max(i - 4, 0), 1) * 400

      instance.setPosition(left, top)
      instance.setSize(1000, 800)
      alternateWindow.setBounds({
        x: Math.round(left / scaleFactor),
        y: Math.round(top / scaleFactor),
        width: Math.round(1000 / scaleFactor),
        height: Math.round(800 / scaleFactor),
      })

      alternateWindow.show()
      robotUtil.moveMouseSmooth(left + 600 * scaleFactor, top + 400 * scaleFactor)
      await setTimeoutPromise(() => {
        alternateWindow.hide()
      }, 500)

      robotUtil.mouseClick('left', true)

      for (const char of account) {
        robotUtil.handleCharKeyTap(char)
      }
      robotUtil.keyTap('enter')
      for (const char of password) {
        robotUtil.handleCharKeyTap(char)
      }
    }, 1000)

    await setTimeoutPromise(() => {
      // 输入完毕后，显示桌面，继续打开新的进程
      robotUtil.keyTap('d', ['command'])
    }, 1000)
  }

  const promises = accounts.map((account, index) => async () => await _login(account, index))

  // 依次登录所有账号
  for await (const promise of promises) {
    yield promise()
  }

  const allGameWindows = GameWindowControl.getAllGameWindows()

  // 显示所有窗口
  for (const gameWindow of allGameWindows.values()) {
    gameWindow.showGameWindow()
  }
}

export function registerTestTasks() {
  ipcMain.on('alternate-window-click', () => {
    const alternateWindow = GameWindowControl.getAlternateWindow()
    alternateWindow.hide()
    robot.mouseClick()
    alternateWindow.show()
  })

  ipcMain.on('set-position', (_event, pos: Point) => {
    const instance = new GameWindowControl(YouDaoPid)

    instance.setPosition(pos.x, pos.y)
  })

  ipcMain.on('show-window', () => {
    const instance = new GameWindowControl(YouDaoPid)

    instance.showGameWindow()
  })

  ipcMain.on('test-youdao', async () => {
    const iterator = youdaoTask()

    do {
      const value = await iterator.next()

      if (value.done) {
        break
      }
    } while (true)
  })

  ipcMain.on('test-start-game', async () => {
    const iterator = startGameTask()

    do {
      const value = await iterator.next()

      if (value.done) {
        break
      }
    } while (true)
  })
}
