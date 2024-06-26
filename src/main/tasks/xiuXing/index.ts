import robotUtils from '../../../utils/robot'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getTeamsInfo, liDui, yiJianZuDui } from '../basicTasks'
import { randomName, sleep } from '../../../utils/toolkits'
import { ipcMain } from 'electron/main'
import { hasGameTask, searchGameTask } from '../gameTask'
import { chiXiang } from '../wuPinTask'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import {
  findImagePositionsWithErrorHandle,
  findImageWithinTemplate,
  paddleOcr,
  screenCaptureToFile,
} from '../../../utils/fileOperations'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank, readLog, writeLog } from '../../../utils/common'
import { getCurrentCity, getCurrentCityByNpc, goToNPC, goToNPCAndTalk, hasGoneToNPC, talkToNPC } from '../npcTasks'
import { buChongZhuangTai, hasMeetLaoJun, keepZiDong, waitFinishZhanDou, waitFinishZhanDou_1 } from '../zhanDouTasks'
import { IGameTask } from 'constants/types'
import { xianJieShenBu } from './xianJieShenBu'
import commonConfig from '../../../constants/config.json'
import { shuaDaiJin } from './shuaDaiJin'

export async function registerXiuXing() {
  ipcMain.on('xian-ren-zhi-lu', xianRenZhiLu)
  // ipcMain.on('shi-jue-zhen', shiJueZhen)
  ipcMain.on('xian-jie-shen-bu', xianJieShenBu)
  // ipcMain.on('xiu-xing-ren-wu', xiuXingRenWu)
  // ipcMain.on('xun-xian-ren-wu', xunXianRenWu)
  ipcMain.on('shua-dai-jin', () => shuaDaiJin(true))
}

async function xianRenZhiLu() {
  await xiuXingTask('仙人指路')
}

async function shiJueZhen() {
  await xiuXingTask('十绝阵')
}

async function xiuXingRenWu() {
  await xiuXingTask('修行任务')
}

async function xunXianRenWu() {
  await xiuXingTask('寻仙任务')
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
    const defaultTeamLeaderWindow = teamWindows.find((teamWindow) => teamWindow.roleInfo.defaultTeamLeader)!
    const restTeamWindows = teamWindows.filter((teamWindow) => !teamWindow.roleInfo.defaultTeamLeader)
    const tasks = npcs.reduce((tasks, npc) => {
      tasks = [
        ...tasks,
        ...[defaultTeamLeaderWindow, ...restTeamWindows].map(
          (gameWindow) => `${gameWindow?.roleInfo.roleName}_${npc.pinYin}`
        ),
      ]

      return tasks
    }, [] as string[])

    return tasks
  })

  let restTasksWithGroup: string[][] = []
  if (isFirst) {
    for (const teamWindows of teamWindowsWithGroup) {
      for (const teamWindow of teamWindows) {
        await teamWindow.setForeground()
        robotUtils.keyTap('w', ['control'])
      }
    }
    const restTasksContent = await readLog(taskType)
    if (restTasksContent.trim()) {
      restTasksWithGroup = JSON.parse(restTasksContent)
    } else {
      for (const [index, teamWindows] of Object.entries(teamWindowsWithGroup)) {
        let tasks: string[] = []
        const [teamLeaderWindow] = teamWindows
        await teamLeaderWindow.setForeground()
        const hasTask = await hasGameTask(taskType)
        if (hasTask) {
          tasks = await getTaskProgress(teamWindows, allTask[+index], taskType)
        }
        if (!hasTask || tasks.length === 0) {
          await lingQuRenWu(teamWindows, taskType)
          tasks = [...allTask[+index]]
        }

        restTasksWithGroup.push(tasks)
      }
    }
  } else {
    for (const teamWindows of teamWindowsWithGroup) {
      await lingQuRenWu(teamWindows, taskType)
    }

    restTasksWithGroup = allTask
  }

  while (true) {
    if (taskType !== '十绝阵') {
      for (const [index, teamWindows] of Object.entries(teamWindowsWithGroup)) {
        const defaultTeamLeaderWindow = teamWindows.find((teamWindow) => teamWindow.roleInfo.defaultTeamLeader)!
        await defaultTeamLeaderWindow.setForeground()
        await chiXiang(2)
        if (taskType === '寻仙任务' && restTasksWithGroup[+index].length > 0) {
          const currentCity = await getCurrentCity()
          if (currentCity !== '蓬莱岛') {
            await searchGameTask(taskType)
            await clickGamePoint('寻仙任务-蓬莱岛', 'xunXianRenWu')
            await sleep(2 * 60 * 1000)
          }
        }
      }
    }
    await loopTasks(restTasksWithGroup, taskType)
    await keepZiDong()
    await buChongZhuangTai({ needZhongCheng: true })
    const nowTeamWindowsWithGroup = await getTeamsInfo()
    for (const teamWindows of nowTeamWindowsWithGroup) {
      const [teamLeaderWindow] = teamWindows
      const defaultTeamLeaderWindow = teamWindows.find((teamWindow) => teamWindow.roleInfo.defaultTeamLeader)!
      await teamLeaderWindow.setForeground()
      await liDui()
      await sleep(200)
      await yiJianZuDui(defaultTeamLeaderWindow.roleInfo.roleName)
    }
    await xiuXingTask(taskType, false)
  }
}

export async function lingQuRenWu(teamWindows: GameWindowControl[], taskType: string) {
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
  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('lingQuRenWu')}.jpg`)
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
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('calculatePosition1')}.jpg`)
      const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
      return position
    },
  })
  await sleep(500)
  await talkToNPC(city, npcName, conversitions[1])
  await sleep(500)

  // 每个队员依次领取任务
  for (const gameWindow of teamMemberWindows) {
    await gameWindow.setForeground()
    await talkToNPC(city, npcName, conversitions[0], async () => {
      await moveMouseToBlank()
      const templateImagePath = path.join(pythonImagesPath, `GUIElements/common/${pinYin}.jpg`)
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('calculatePosition2')}.jpg`)
      const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
      return position
    })
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

    const found = await searchGameTask(taskType)

    if (taskType === '修行任务' && !found) {
      await sleep(3000)
    }

    {
      await gameWindow.restoreGameWindow()
      const { npcs, content } = global.appContext.gameTask[taskType as keyof IGameTask] as {
        npcs: { zh: string; pinYin: string }[]
        content: any
      }

      const { position, size } = content.smallWindow
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('getTaskProgress')}.jpg`)
      const { left, top } = gameWindow.getDimensions()!
      await screenCaptureToFile(tempCapturePath, [left + position[0], top + position[1]], size)
      const taskContent = await paddleOcr(tempCapturePath, false, 'ch')
      const taskString = taskContent.join('')

      for (const npc of npcs) {
        let found = false
        if (npc.zh === '天阙阵主') {
          if (taskString.includes('天')) {
            found = true
          }
        } else {
          if (taskType === '寻仙任务') {
            if (taskString.includes(npc.zh.slice(0, 2))) {
              found = true
            }
          } else {
            if (taskString.includes(npc.zh)) {
              found = true
            }
          }
        }
        // const npcTemplatePath = path.join(pythonImagesPath, `GUIElements/taskRelative/${npc.pinYin}.jpg`)
        // const found = await findImageWithinTemplate(tempCapturePath, npcTemplatePath, 0.7)

        if (found) {
          restTasks.push(`${gameWindow.roleInfo.roleName}_${npc.pinYin}`)
        }
      }

      await gameWindow.maximizGameWindow()
    }
  }

  restTasks.sort((a, b) => (allTask.indexOf(a) > allTask.indexOf(b) ? 1 : -1))

  return restTasks
}

let taskIndex = 0
async function loopTasks(tasksWithGroup: string[][], taskType: string) {
  let prevPairTask: (string | undefined)[] = []
  while (true) {
    writeLog(taskType, JSON.stringify(tasksWithGroup, undefined, 4), true)

    const hasFinished = tasksWithGroup.every((tasks) => tasks.length === 0)
    if (hasFinished) {
      // TODO: 当完成一轮任务后，可以考虑再检查下每个角色的任务进度，看是否有角色因为死亡而导致任务没有完成的
      return
    }

    const pairTask = tasksWithGroup.map((tasks) => tasks[0])
    if (taskType === '寻仙任务') {
      await executePairTaskOfXunXian(pairTask, taskType, prevPairTask)
    } else {
      await executePairTask(pairTask, taskType, prevPairTask)
    }
    prevPairTask = pairTask
    tasksWithGroup.forEach((tasks) => tasks.shift())
    taskIndex++
  }
}

const conversitionMap = {
  仙人指路: 'qingXianRenCiJiao',
  十绝阵: 'qingDaShenZhiDian',
  修行任务: 'qingLingShenDuoDuoZhiJiao',
  寻仙任务: 'woXiangYuXianZhangQieCuoYiXiaXianFa',
}
async function executePairTask(
  pairTask: (string | undefined)[],
  taskType: string,
  prevPairTask: (string | undefined)[]
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

    teamLeaderWindows.push(nowGameWindow)
    npcs.push(npc)

    if (prevNpc !== npc) {
      if (!nowGameWindow.roleInfo.defaultTeamLeader) {
        await chiXiang(1)
      }
      const found = await searchGameTask(taskType)
      if (taskType === '修行任务' && !found) {
        await sleep(3000)
      }
      await sleep(500)
      await clickGamePoint(`${taskType}-NPC`, 'singleTask', {
        callback: async () => {
          const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('singleTask')}.jpg`)
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/renWuRiZhi.jpg')
          await screenCaptureToFile(tempCapturePath)
          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          return !found
        }
      })
      await hasGoneToNPC(nowGameWindow)
    } else {
      const city = getCurrentCityByNpc(npc)
      await goToNPC(city, npc)
    }
  }

  // 两个队伍都到了NPC处，开始战斗
  for (const teamLeaderWindow of teamLeaderWindows) {
    await teamLeaderWindow.setForeground()
    robotUtils.keyTap('f12')
  }

  // for (const [index, teamLeaderWindow] of Object.entries(teamLeaderWindows)) {
  //   // const npc = npcs[+index]
  //   await hasGoneToNPC(teamLeaderWindow)
  //   robotUtils.keyTap('f12')
  //   // await sleep(500)
  //   // const city = getCurrentCityByNpc(npc)
  //   // await talkToNPC(city, npc, conversition)
  //   // await sleep(500)
  // }

  // 等待战斗结束
  for (const teamLeaderWindow of teamLeaderWindows) {
    await waitFinishZhanDou(teamLeaderWindow)
    await sleep(2000)
    await hasMeetLaoJun(teamLeaderWindow)
  }

  // 补充自动回合，每5个任务补充一次
  if (taskIndex && taskIndex % commonConfig.ziDongInterval === 0) {
    await keepZiDong()
  }

  // 补充状态，每5个任务补充一次
  if (taskType === '仙人指路' && taskIndex && taskIndex % 5 === 0) {
    await buChongZhuangTai()
  }
}


async function executePairTaskOfXunXian(
  pairTask: (string | undefined)[],
  taskType: string,
  prevPairTask: (string | undefined)[]
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

    teamLeaderWindows.push(nowGameWindow)
    npcs.push(npc)
    const city = '蓬莱岛'
    if (prevNpc !== npc) {
      if (!nowGameWindow.roleInfo.defaultTeamLeader) {
        await chiXiang(1)
      }
    }
    await goToNPC(city, npc)
  }

  // 两个队伍都到了NPC处，开始战斗
  for (const [index, teamLeaderWindow] of Object.entries(teamLeaderWindows)) {
    const npc = npcs[+index]
    await hasGoneToNPC(teamLeaderWindow)
    robotUtils.keyTap('f12')
    await sleep(100)
    // await sleep(500)
    // const city = getCurrentCityByNpc(npc)
    // await talkToNPC(city, npc, conversition)
    const specialGameWindow = GameWindowControl.getGameWindowByRoleName('せLocustそ')!
    await specialGameWindow.setForeground()
    await sleep(200)
    robotUtils.keyTap('1', ['control'])
    await sleep(4000)
    robotUtils.keyTap('2', ['control'])
    await teamLeaderWindow.setForeground()
  }

  // 等待战斗结束
  for (const teamLeaderWindow of teamLeaderWindows) {
    await waitFinishZhanDou_1(teamLeaderWindow)
  }

  // 补充自动回合，每5个任务补充一次
  if (taskIndex && taskIndex % commonConfig.ziDongInterval === 0) {
    await keepZiDong()
  }

  // 补充状态，每5个任务补充一次
  // if (taskIndex && taskIndex % 5 === 0) {
    await buChongZhuangTai({ needJueSe: true })
  // }
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
  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('recheckHasFinishNpcTask')}.jpg`)
  await screenCaptureToFile(tempCapturePath, position, size)
  const npcTemplatePath = path.join(pythonImagesPath, `GUIElements/taskRelative/${npc}.jpg`)
  const notFinished = await findImageWithinTemplate(tempCapturePath, npcTemplatePath, 0.65)

  return !notFinished
}
