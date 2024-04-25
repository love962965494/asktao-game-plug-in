import robotUtils from '../../../utils/robot'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getTeamsInfo, liDui, yiJianZuDui } from '../basicTasks'
import { randomName, sleep } from '../../../utils/toolkits'
import { ipcMain } from 'electron/main'
import { hasGameTask, searchGameTask } from '../gameTask'
import { chiXiang } from '../wuPinTask'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import { findImagePositions, findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank, writeLog } from '../../../utils/common'
import { getCurrentCityByNpc, goToNPC, goToNPCAndTalk, hasGoneToNPC, talkToNPC } from '../npcTasks'
import { buChongZhuangTai, hasMeetLaoJun, keepZiDong, waitFinishZhanDou } from '../zhanDouTasks'
import { IGameTask } from 'constants/types'
import { xianJieShenBu } from './xianJieShenBu'

export async function registerXianRenZhiLu() {
  ipcMain.on('xian-ren-zhi-lu', xianRenZhiLu)
  ipcMain.on('shi-jue-zhen', shiJueZhen)
  ipcMain.on('xian-jie-shen-bu', xianJieShenBu)
}

async function xianRenZhiLu() {
  await xiuXingTask('仙人指路')
}

async function shiJueZhen() {
  await xiuXingTask('十绝阵')
}

async function xiuXingTask(taskType: string, isFirst: boolean = true) {
  const teamWindowsWithGroup = await getTeamsInfo()
  const { npcs } = global.appContext.gameTask[taskType as keyof IGameTask] as {
    npcs: {
      zh: string
      pinYin: string
    }[]
  }
  const allTask = teamWindowsWithGroup.map((teamWindows) => {
    const tasks = npcs.reduce((tasks, npc) => {
      tasks = [...tasks, ...teamWindows.map((gameWindow) => `${gameWindow?.roleInfo.roleName}_${npc.pinYin}`)]

      return tasks
    }, [] as string[])

    return tasks
  })

  let restTasksWithGroup: string[][] = []
  if (isFirst) {
    for (const [index, teamWindows] of Object.entries(teamWindowsWithGroup)) {
      const [teamLeaderWindow] = teamWindows
      await teamLeaderWindow.setForeground()
      const hasTask = await hasGameTask(taskType)
      let tasks: string[] = []
      if (hasTask) {
        tasks = await getTaskProgress(
          teamWindows,
          allTask[+index],
          taskType
        )
      }
      if (!hasTask || tasks.length === 0) {
        await lingQuRenWu1(teamWindows, taskType)
        tasks = allTask[+index]
      }

      restTasksWithGroup.push(tasks)
    }
  } else {
    for (const teamWindows of teamWindowsWithGroup) {
      await lingQuRenWu1(teamWindows, taskType)
    }

    restTasksWithGroup = allTask
  }

  while (true) {
    writeLog(`
      剩余任务：
      ${JSON.stringify(restTasksWithGroup, undefined, 4)}
    `)
    await loopTasks(restTasksWithGroup, taskType)
    await keepZiDong()
    await buChongZhuangTai({ needZhongCheng: true })
    await xiuXingTask(taskType, false)
  }
}

export async function lingQuRenWu(teamLeaderWindow: GameWindowControl, teamMemberWindows: GameWindowControl[]) {
  teamLeaderWindow.setForeground()
  await sleep(500)
  // 回家
  robotUtils.keyTap('f1')
  await sleep(500)
  let city = ''
  // 去天墉城
  await goToNPCAndTalk({
    npcName: 'jieYinDaoTong',
    intervalTime: 2,
    conversition: 'woYaoHuiTianYongChengBanXieShi',
    gameWindow: teamLeaderWindow,
  })
  await sleep(1000)

  city = '天墉城'
  // 去东海渔村
  await goToNPCAndTalk({
    city: '天墉城',
    npcName: 'cheFu',
    conversition: 'songWoQuDongHaiYuCun',
    gameWindow: teamLeaderWindow,
  })

  await sleep(1000)

  city = '东海渔村'
  // 柳如烟 -> 接任务
  // 去东海渔村
  await goToNPCAndTalk({
    city: '东海渔村',
    npcName: 'liuRuYan',
    conversition: '[xianRenZhiLu]WoZhengXiangQuBaiHuiXianRenQingQiuZhiDianNe',
    gameWindow: teamLeaderWindow,
    calculatePosition: async () => {
      await moveMouseToBlank()
      const templateImagePath = path.join(pythonImagesPath, `GUIElements/common/xianRenZhiLu.jpg`)
      const tempCapturePath = path.join(pythonImagesPath, `temp/calculatePosition_${randomName()}.jpg`)
      await screenCaptureToFile(tempCapturePath)
      const position = await findImagePositions(tempCapturePath, templateImagePath)
      return position
    },
  })
  await sleep(500)
  await talkToNPC(city, 'liuRuYan', '[lingQu]WoZheJiuQu')
  await sleep(1000)

  // 每个队员依次领取任务
  for (const gameWindow of teamMemberWindows) {
    await gameWindow.setForeground()
    await talkToNPC(city, 'liuRuYan', '[lingQu]WoZheJiuQu')
    await sleep(1000)
  }

  await teamLeaderWindow.setForeground()
  robotUtils.keyTap('escape')
}

export async function lingQuRenWu1(teamWindows: GameWindowControl[], taskType: string) {
  const [teamLeaderWindow, ...teamMemberWindows] = teamWindows
  await teamLeaderWindow.setForeground()
  await searchGameTask(taskType)
  const { content, pinYin } = global.appContext.gameTask[taskType as keyof IGameTask] as {
    content: any
    pinYin: string
  }
  const {
    taskNpc: { city, position, size, npcName, conversitions },
  } = content as {
    taskNpc: { city: string; position: number[]; size: number[]; npcName: string; conversitions: string[] }
  }
  await moveMouseToBlank()
  const tempCapturePath = path.join(pythonImagesPath, `temp/lingQuRenWu_${randomName()}.jpg`)
  await screenCaptureToFile(tempCapturePath, position, size)
  await moveMouseToAndClick(tempCapturePath, {
    buttonName: 'lingQuRenWu',
    position,
    size,
  })
  await hasGoneToNPC(teamLeaderWindow)
  await goToNPCAndTalk({
    city,
    npcName,
    conversition: conversitions[0],
    gameWindow: teamLeaderWindow,
    calculatePosition: async () => {
      await moveMouseToBlank()
      const templateImagePath = path.join(pythonImagesPath, `GUIElements/common/${pinYin}.jpg`)
      const tempCapturePath = path.join(pythonImagesPath, `temp/calculatePosition_${randomName()}.jpg`)
      await screenCaptureToFile(tempCapturePath)
      const position = await findImagePositions(tempCapturePath, templateImagePath)
      return position
    },
  })
  await sleep(500)
  await talkToNPC(city, npcName, conversitions[1])
  await sleep(500)

  // 每个队员依次领取任务
  for (const gameWindow of teamMemberWindows) {
    await gameWindow.setForeground()
    await talkToNPC(city, npcName, conversitions[0])
    await sleep(500)
    await talkToNPC(city, npcName, conversitions[1])
    await sleep(500)
  }

  await teamLeaderWindow.setForeground()
  robotUtils.keyTap('escape')
}

export async function getTaskProgress(gameWindows: GameWindowControl[], allTask: string[], taskType: string) {
  const restTasks = []
  // 获取每个队员的任务进度
  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()

    await searchGameTask(taskType)
    const { npcs, content } = global.appContext.gameTask[taskType as keyof IGameTask] as {
      npcs: { zh: string; pinYin: string }[]
      content: any
    }
    const { position, size } = content
    const tempCapturePath = path.join(pythonImagesPath, `temp/getTaskProgress_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath, position, size)

    for (const npc of npcs) {
      const npcTemplatePath = path.join(pythonImagesPath, `GUIElements/taskRelative/${npc.pinYin}.jpg`)
      const found = await findImageWithinTemplate(tempCapturePath, npcTemplatePath, 0.6)

      if (found) {
        restTasks.push(`${gameWindow.roleInfo.roleName}_${npc.pinYin}`)
      }
    }
  }

  restTasks.sort((a, b) => (allTask.indexOf(a) > allTask.indexOf(b) ? 1 : -1))

  return restTasks
}

async function loopTasks(tasksWithGroup: string[][], taskType: string) {
  let prevPairTask: (string | undefined)[] = []
  let taskIndex = 0
  while (true) {
    const hasFinished = tasksWithGroup.every((tasks) => tasks.length === 0)
    if (hasFinished) {
      // TODO: 当完成一轮任务后，可以考虑再检查下每个角色的任务进度，看是否有角色因为死亡而导致任务没有完成的
      return
    }
    const pairTask = tasksWithGroup.map((tasks) => tasks.shift())

    writeLog(`
      当前任务：
      ${JSON.stringify(pairTask, undefined, 4)}
    `)
    await executePairTask(pairTask, taskType, prevPairTask, taskIndex)
    prevPairTask = pairTask
    taskIndex++
  }
}

const conversitionMap = {
  仙人指路: 'qingXianRenCiJiao',
  十绝阵: 'qingDaShenZhiDian',
}
async function executePairTask(
  pairTask: (string | undefined)[],
  taskType: string,
  prevPairTask: (string | undefined)[],
  taskIndex: number
) {
  const conversition = conversitionMap[taskType as keyof typeof conversitionMap]
  const teamLeaderWindows: GameWindowControl[] = []
  const npcs: string[] = []
  for (const [index, taskName] of Object.entries(pairTask)) {
    if (!taskName) {
      continue
    }

    const [roleName, npc] = taskName.split('_')
    const [prevRoleName, prevNpc] = (prevPairTask[+index] || '_').split('_')
    const nowGameWindow = GameWindowControl.getGameWindowByRoleName(roleName)!
    const prevTeamLeaderWindow = prevRoleName
      ? GameWindowControl.getGameWindowByRoleName(prevRoleName)
      : (await GameWindowControl.getTeamWindowsWithSequence(+index + 1))[0]

    if (prevRoleName !== roleName) {
      await prevTeamLeaderWindow?.setForeground()
      await liDui()
      await sleep(200)
      await yiJianZuDui(roleName)
    } else {
      await nowGameWindow.setForeground()
    }

    // 第一个执行任务的
    if (taskType === '仙人指路' && prevPairTask.length === 0) {
      await chiXiang(2)
    }

    teamLeaderWindows.push(nowGameWindow)
    npcs.push(npc)

    if (prevNpc !== npc) {
      await searchGameTask(taskType)
      await sleep(500)
      await clickGamePoint(`${taskType}-NPC`, 'singleTask')
      await sleep(500)
    } else {
      const city = getCurrentCityByNpc(npc)
      await goToNPC(city, npc)
    }
  }

  // 两个队伍都到了NPC处，开始战斗
  for (const [index, teamLeaderWindow] of Object.entries(teamLeaderWindows)) {
    const npc = npcs[+index]
    await hasGoneToNPC(teamLeaderWindow)
    await sleep(500)
    const city = getCurrentCityByNpc(npc)
    await goToNPCAndTalk({
      city,
      npcName: npc,
      conversition,
      intervalTime: 1,
      gameWindow: teamLeaderWindow,
    })
    await sleep(500)
  }

  // 补充自动回合，每5个任务补充一次
  if (taskIndex && taskIndex % 5 === 0) {
    await keepZiDong()
  }

  // 等待战斗结束
  for (const teamLeaderWindow of teamLeaderWindows) {
    await waitFinishZhanDou(teamLeaderWindow)
  }

  // 战斗结束
  await sleep(3000)
  // 检查是否遇到老君
  for (const teamLeaderWindow of teamLeaderWindows) {
    await hasMeetLaoJun(teamLeaderWindow)
  }

  // 补充状态，每5个任务补充一次
  if (taskType === '仙人指路' && taskIndex && taskIndex % 5 === 0) {
    await buChongZhuangTai()
  }

  // // 再次校验当前npc任务是否完成
  // const results = await Promise.all(
  //   teamLeaderWindows.map(
  //     async (teamLeaderWindow, index) => await recheckHasFinishNpcTask(pairTask[index], taskType, teamLeaderWindow)
  //   )
  // )

  // return results
}

async function recheckHasFinishNpcTask(taskName: string, taskType: string, gameWindow: GameWindowControl) {
  await gameWindow.setForeground()
  const { content } = global.appContext.gameTask[taskType as keyof IGameTask] as {
    content: { position: number[]; size: number[] }
  }
  const { position, size } = content

  const [_, npc] = taskName.split('_')
  await moveMouseToBlank()
  robotUtils.keyTap('B', ['control'])
  await sleep(200)
  robotUtils.keyTap('Q', ['alt'])
  await sleep(200)
  const tempCapturePath = path.join(pythonImagesPath, `temp/recheckHasFinishNpcTask_${randomName()}.jpg`)
  await screenCaptureToFile(tempCapturePath, position, size)
  const npcTemplatePath = path.join(pythonImagesPath, `GUIElements/taskRelative/${npc}.jpg`)
  const notFinished = await findImageWithinTemplate(tempCapturePath, npcTemplatePath, 0.65)

  return !notFinished
}
