import robotUtils from '../../../../utils/robot'
import { setTimeoutPromise } from '../../../../utils/toolkits'
import GameWindowControl from '../../../../utils/gameWindowControll'
import { getProcessesByName } from '../../../../utils/systemCotroll'
import robotjs from 'robotjs'
import path from 'path'
import { pythonImagesPath, constantsPath } from '../../../../paths'
import { screenCaptureToFile, findImagePositions } from '../../../../utils/fileOperations'
import { GameAccountList, GameAccount } from '../../../../constants/types'
import fs from 'fs/promises'
import random from 'random'
import { clipboard } from 'electron'

export async function* youdaoTask() {
  const processes = await getProcessesByName('YoudaoDict')
  const [_, pid] = processes[0]
  const instance = new GameWindowControl(+pid)
  instance.showGameWindow()
  const alternateWindow = GameWindowControl.getAlternateWindow()
  const { left, top, right, bottom } = instance.getBounds(true)
  const scaleFactor = instance.getScaleFactor(true)

  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtils.moveMouseSmooth(left + 600 * scaleFactor, top + 400 * scaleFactor)
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtils.mouseClick('left')
  robotjs.typeString('youdao ')
  instance.hideGameWindow()
  yield

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtils.moveMouseSmooth(left + 800 * scaleFactor, top + 90 * scaleFactor)
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtils.mouseClick('left', true)
  robotjs.typeString('task ')
  instance.hideGameWindow()
  yield

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtils.moveMouseSmooth(left + 800 * scaleFactor, top + 90 * scaleFactor)
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtils.mouseClick('left', true)
  robotjs.typeString('has ')
  instance.hideGameWindow()
  yield

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtils.moveMouseSmooth(left + 800 * scaleFactor, top + 90 * scaleFactor)
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtils.mouseClick('left', true)
  robotjs.typeString('finished!')
  instance.hideGameWindow()
  yield
}

export async function* startGameTask() {
  robotUtils.keyTap('d', ['command'])
  let positions: Array<[number, number]> = []

  await setTimeoutPromise(async () => {
    const screenCapture = robotjs.screen.capture()
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
    robotUtils.moveMouseSmooth(x, y)
    robotUtils.mouseClick('left', true)

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
      robotUtils.moveMouseSmooth(left + 600 * scaleFactor, top + 400 * scaleFactor)
      await setTimeoutPromise(() => {
        alternateWindow.hide()
      }, 500)

      robotUtils.mouseClick('left', true)

      for (const char of account) {
        robotUtils.handleCharKeyTap(char)
      }
      robotUtils.keyTap('enter')
      for (const char of password) {
        robotUtils.handleCharKeyTap(char)
      }
    }, 1000)

    await setTimeoutPromise(() => {
      // 输入完毕后，显示桌面，继续打开新的进程
      robotUtils.keyTap('d', ['command'])
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

export async function* wangyiTask() {
  const pid = 5032
  const instance = new GameWindowControl(+pid)
  instance.showGameWindow()
  const alternateWindow = GameWindowControl.getAlternateWindow()
  const { left, top, right, bottom } = instance.getBounds(true)
  const scaleFactor = instance.getScaleFactor(true)

  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtils.moveMouseSmooth(left + 440 * scaleFactor, top + Math.round(35 * scaleFactor))
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtils.mouseClick('left')
  robotUtils.keyTap('a', ['control'])
  robotjs.typeString('wang ')
  instance.hideGameWindow()
  yield

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtils.moveMouseSmooth(left + 440 * scaleFactor, top + Math.round(35 * scaleFactor))
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtils.mouseClick('left')
  robotjs.typeString('yi ')
  instance.hideGameWindow()
  yield

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtils.moveMouseSmooth(left + 440 * scaleFactor, top + Math.round(35 * scaleFactor))
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtils.mouseClick('left')
  robotjs.typeString('cloud ')
  instance.hideGameWindow()
  yield

  instance.showGameWindow()
  alternateWindow.setBounds({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  })
  alternateWindow.show()
  robotUtils.moveMouseSmooth(left + 440 * scaleFactor, top + Math.round(35 * scaleFactor))
  await setTimeoutPromise(() => alternateWindow.hide(), 500)
  robotUtils.mouseClick('left')
  robotjs.typeString('music')
  instance.hideGameWindow()
  yield
}

// 单人限时任务
export async function* testTimeLimitSingleTask() {
  const allGameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const alternateWindow = GameWindowControl.getAlternateWindow()

  async function* executeTask(gameWindow: GameWindowControl) {
    const { left, top, right, bottom } = gameWindow.getBounds(true)
    const scaleFactor = gameWindow.getScaleFactor(true)

    alternateWindow.setBounds({
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    })
    alternateWindow.show()
    robotUtils.moveMouseSmooth(left + 600 * scaleFactor, top + 400 * scaleFactor)
    await setTimeoutPromise(() => alternateWindow.hide(), 500)
    gameWindow.showGameWindow()
    robotUtils.mouseClick('left')
    robotUtils.keyTap('enter')
    robotUtils.keyTap('enter')
    robotUtils.keyTap('enter')

    await clipboard.writeText('开始执行单人限时任务')
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    await clipboard.writeText('接收到任务')
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    yield

    alternateWindow.setBounds({
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    })
    alternateWindow.show()
    robotUtils.moveMouseSmooth(left + 600 * scaleFactor, top + 400 * scaleFactor)
    await setTimeoutPromise(() => alternateWindow.hide(), 500)
    gameWindow.showGameWindow()
    robotUtils.mouseClick('left')
    await clipboard.writeText('执行任务中。。。')
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    yield

    alternateWindow.setBounds({
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    })
    alternateWindow.show()
    robotUtils.moveMouseSmooth(left + 600 * scaleFactor, top + 400 * scaleFactor)
    await setTimeoutPromise(() => alternateWindow.hide(), 500)
    gameWindow.showGameWindow()
    robotUtils.mouseClick('left')
    const executeTime = random.integer(500, 1000)
    await setTimeoutPromise(async () => {
      await clipboard.writeText(`任务执行完成，用时${executeTime}ms`)
      robotUtils.keyTap('v', ['control'])
    }, executeTime)
    yield
  }

  const iterators = allGameWindows.map((gameWindow) => executeTask(gameWindow))
  const allFinished = allGameWindows.map(() => false)

  do {
    for await (const [index, iterator] of iterators.entries()) {
      const value = await iterator.next()

      if (value.done) {
        allFinished[index] = true
      }
    }
  } while (allFinished.filter(Boolean).length !== allGameWindows.length)
}
