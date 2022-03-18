import robotUtils from '../../../../utils/robot'
import { setTimeoutPromise } from '../../../../utils/toolkits'
import GameWindowControl from '../../../../utils/gameWindowControll'
import { getProcessesByName } from '../../../../utils/systemCotroll'
import robotjs from 'robotjs'
import path from 'path'
import { pythonImagesPath } from '../../../../paths'
import { screenCaptureToFile, findImagePositions } from '../../../../utils/fileOperations'
import random from 'random'
import { clipboard } from 'electron'
import { ExecuteTaskRoleInfo } from '../../testTask'

let positions: Array<[number, number]>

export async function* startGameTask(role: Required<ExecuteTaskRoleInfo>, index: number) {
  robotUtils.keyTap('d', ['command'])

  if (!positions) {
    // TODO: 优化，改到程序启动时，执行，避免每次执行登录要重新获取坐标信息
    await setTimeoutPromise(async () => {
      const screenCapture = robotjs.screen.capture()
      let srcImagePath = path.join(pythonImagesPath, 'temp/screenCapture.jpg')
      let targetImagePath = path.join(pythonImagesPath, 'GUIElements/textnote.jpg')

      await screenCaptureToFile(screenCapture, srcImagePath)
      positions = await findImagePositions(srcImagePath, targetImagePath, 10, 30, 5)
    }, 1000)
  }

  if (positions.length === 0) {
    console.log('findImagePositions error')
    throw new Error('没有找到对应坐标')
  }

  const [x, y] = positions[0]

  async function _login(role: Required<ExecuteTaskRoleInfo>, i: number) {
    const allGameWindows = GameWindowControl.getAllGameWindows()
    let gameWindow = GameWindowControl.getGameWindowByAccount(role.account)

    let type = 'changeRole'

    if (!gameWindow) {
      let left = (i % 5) * 300
      let top = Math.min(Math.max(i - 4, 0), 1) * 400

      type = 'loginRole'
      await setTimeoutPromise(() => {
        // 打开应用程序
        robotUtils.moveMouseSmooth(x, y)
        robotUtils.mouseClick('left', true)
      }, 1000)

      const processes = await getProcessesByName('notepad')
      const [_, pid] = processes.filter(([_, pid]) => !allGameWindows.has(+pid))[0]

      gameWindow = new GameWindowControl(+pid)
      gameWindow.setRoleInfo(role)
      gameWindow.setPosition(left, top)
      gameWindow.setSize(1000, 800)
      // 刷新位置信息
      gameWindow.getBounds(true)
    }

    gameWindow.showGameWindow()
    const { left, top } = gameWindow.getBounds()
    const scaleFactor = gameWindow.getScaleFactor()
    const alternateWindow = GameWindowControl.getAlternateWindow()

    alternateWindow.setBounds({
      x: left,
      y: top,
      width: Math.round(1000 / scaleFactor),
      height: Math.round(800 / scaleFactor),
    })

    alternateWindow.show()
    robotUtils.moveMouseSmooth(left + 800, top + 40)
    await setTimeoutPromise(() => {
      alternateWindow.hide()
    }, 500)

    gameWindow.showGameWindow()
    robotUtils.mouseClick('left')
    robotUtils.keyTap('enter')

    if (type === 'changeRole') {
      // 切换角色操作
      clipboard.writeText('切换角色')
      robotUtils.keyTap('v', ['control'])
      robotUtils.keyTap('enter')

      clipboard.writeText(`角色姓名: ${role.roleName || ''}`)
      robotUtils.keyTap('v', ['control'])
      robotUtils.keyTap('enter')

      clipboard.writeText(`角色等级: ${role.rank || ''}`)
      robotUtils.keyTap('v', ['control'])
      robotUtils.keyTap('enter')
    } else {
      // 登录操作
      clipboard.writeText('登录账号')
      robotUtils.keyTap('v', ['control'])
      robotUtils.keyTap('enter')

      for (const char of role.account!) {
        robotUtils.handleCharKeyTap(char)
      }
      robotUtils.keyTap('enter')
      for (const char of role.password!) {
        robotUtils.handleCharKeyTap(char)
      }
      robotUtils.keyTap('enter')

      clipboard.writeText(`角色姓名: ${role.roleName || ''}`)
      robotUtils.keyTap('v', ['control'])
      robotUtils.keyTap('enter')

      clipboard.writeText(`角色等级: ${role.rank || ''}`)
      robotUtils.keyTap('v', ['control'])
      robotUtils.keyTap('enter')
    }
  }

  await _login(role, index)
}

// 单人限时任务
export async function* testTimeLimitSingleTask() {
  const processes = await getProcessesByName('notepad')
  for (const [_, pId] of processes) {
    new GameWindowControl(+pId)
  }
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

const shimenTaskType = ['师门任务之入世修行', '师门任务之修山巡逻', '师门任务之寻亲访友', '师门任务之师门物资']

// 师门任务
export async function* shimenTask(role: Required<ExecuteTaskRoleInfo>, _: number, taskNo: number) {
  const gameWindow = GameWindowControl.getGameWindowByAccount(role.account)!

  await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

  if (taskNo === 0) {
    clipboard.writeText('判断当前组队状态，如果组队则执行离队操作')
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    robotUtils.keyTap('enter')
  }

  let task
  // 接受师门任务
  await setTimeoutPromise(() => {
    clipboard.writeText(`开始第${taskNo + 1}个师门任务，回到师门`)
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    robotUtils.keyTap('enter')

    clipboard.writeText('找到师尊，接受师门任务')
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    clipboard.writeText('判断当前师门任务类型。。。')
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    task = shimenTaskType[random.integer(0, 3)]

    clipboard.writeText('当前师门任务为：' + task)
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    robotUtils.keyTap('enter')
  }, 500)

  // 执行师门任务
  await setTimeoutPromise(() => {
    clipboard.writeText('师门任务第一步，前往目标位置。。。')
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    robotUtils.keyTap('enter')

    gameWindow.hideGameWindow()
  }, 500)
  yield

  await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

  // 执行师门任务
  await setTimeoutPromise(() => {
    clipboard.writeText('师门任务第二步，找到npc进行对话，进行任务')
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    robotUtils.keyTap('enter')

    gameWindow.hideGameWindow()
  }, 500)
  yield

  await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

  // 执行师门任务
  await setTimeoutPromise(() => {
    clipboard.writeText('师门任务第三步，师门任务完成')
    robotUtils.keyTap('v', ['control'])
    robotUtils.keyTap('enter')
    robotUtils.keyTap('enter')

    gameWindow.hideGameWindow()
  }, 500)
  yield
}

// 刷道任务
export async function* shuadaoTask(roles: Required<ExecuteTaskRoleInfo>[], taskNo: number) {
  const captainRoles = roles.filter((role) => role.isCaptain)
  const teamRoles = roles.filter((role) => !role.isCaptain)
  const captainGameWindows = captainRoles.map((role) => GameWindowControl.getGameWindowByAccount(role.account)!)
  const teamGameWindows = teamRoles.map((role) => GameWindowControl.getGameWindowByAccount(role.account)!)

  if (taskNo === 0) {
    let promise = Promise.resolve()
    for (const gameWindow of captainGameWindows) {
      promise = promise.then(
        () =>
          new Promise(async (resolve) => {
            await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

            clipboard.writeText('判断当前组队状态，如果离队则执行组队操作')
            robotUtils.keyTap('v', ['control'])
            robotUtils.keyTap('enter')
            robotUtils.keyTap('enter')

            resolve()
          })
      )
    }
  }
  yield

  // 接受刷道任务
  await setTimeoutPromise(async () => {
    let promise = Promise.resolve()

    for (const gameWindow of captainGameWindows) {
      promise = promise.then(
        () =>
          new Promise(async (resolve) => {
            await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

            clipboard.writeText(`开始第${taskNo + 1}个刷道任务，前往伏魔真人`)
            robotUtils.keyTap('v', ['control'])
            robotUtils.keyTap('enter')
            robotUtils.keyTap('enter')

            clipboard.writeText('接受任务，前往目的地，开始寻路。。。')
            robotUtils.keyTap('v', ['control'])
            robotUtils.keyTap('enter')
            robotUtils.keyTap('enter')

            gameWindow.hideGameWindow()

            resolve()
          })
      )
    }

    await promise
  }, 500)
  yield

  // 进行战斗
  await setTimeoutPromise(async () => {
    let promise = Promise.resolve()
    let currentNo = 0
    let hasFinishBattle = false

    for (const gameWindow of captainGameWindows) {
      promise = promise.then(
        () =>
          new Promise(async (resolve) => {
            await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

            clipboard.writeText('到达目的地')
            robotUtils.keyTap('v', ['control'])
            robotUtils.keyTap('enter')
            robotUtils.keyTap('enter')

            gameWindow.hideGameWindow()
            resolve()
          })
      )
    }

    // 战斗前设置好战斗策略
    for (const gameWindow of [...captainGameWindows, ...teamGameWindows]) {
      promise = promise.then(
        () =>
          new Promise(async (resolve) => {
            await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

            clipboard.writeText('战斗即将开始，设置战斗策略')
            robotUtils.keyTap('v', ['control'])
            robotUtils.keyTap('enter')
            robotUtils.keyTap('enter')

            clipboard.writeText(
              `点击自动，补充自动回合，当前战斗方案是方案${gameWindow.roleInfo?.battlePlan?.[currentNo]}`
            )
            robotUtils.keyTap('v', ['control'])
            robotUtils.keyTap('enter')
            robotUtils.keyTap('enter')

            gameWindow.hideGameWindow()

            resolve()
          })
      )
    }

    // 进入战斗
    for (const gameWindow of captainGameWindows) {
      promise = promise.then(
        () =>
          new Promise(async (resolve) => {
            await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

            clipboard.writeText('点击对话，进入战斗')
            robotUtils.keyTap('v', ['control'])
            robotUtils.keyTap('enter')
            robotUtils.keyTap('enter')

            gameWindow.hideGameWindow()
            resolve()
          })
      )
    }

    let interval: NodeJS.Timer
    while (!hasFinishBattle) {
      // 战斗进行中
      for (const gameWindow of [...captainGameWindows, ...teamGameWindows]) {
        promise = promise.then(
          () =>
            new Promise(async (resolve) => {
              await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

              clipboard.writeText(`当前第${currentNo + 1}回合`)
              robotUtils.keyTap('v', ['control'])
              robotUtils.keyTap('enter')
              robotUtils.keyTap('enter')

              gameWindow.hideGameWindow()

              resolve()
            })
        )
      }

      promise = promise.then(async () => {
        await new Promise<void>(resolve => {
          interval = setInterval(() => {
            // 每2秒检测一次当前回合是否结束
            if (random.integer(0, 1) === 1) {
              currentNo++
              resolve()
              clearInterval(interval)
            }
          }, 2000)
        })
      })

      promise.then(() => {
        if (currentNo > 5) {
          hasFinishBattle = true
        }
      })

      await promise

      // timeout = setTimeout(() => {
      //   // 设置下一回合的战斗策略
      //   for (const gameWindow of [...captainGameWindows, ...teamGameWindows]) {
      //     promise = promise.then(
      //       () =>
      //         new Promise(async (resolve) => {
      //           await gameWindow.toggleGameWindowAndAlternateWindow(800, 40)

      //           clipboard.writeText(
      //             `点击自动，补充自动回合，当前战斗方案是方案${gameWindow.roleInfo?.battlePlan?.[currentNo + 1]}`
      //           )
      //           robotUtils.keyTap('v', ['control'])
      //           robotUtils.keyTap('enter')
      //           robotUtils.keyTap('enter')

      //           gameWindow.hideGameWindow()
      //           resolve()
      //         })
      //     )
      //   }
      // }, 4000)
    }
  }, 500)
  yield
}
