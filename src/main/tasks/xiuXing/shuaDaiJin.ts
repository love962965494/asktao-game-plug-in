import { getGameWindows } from '../../../utils/systemCotroll'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank, readLog, writeLog } from '../../../utils/common'
import GameWindowControl from '../../../utils/gameWindowControll'
import { buChongZhuangTai, hasMeetLaoJun, waitFinishZhanDou, waitFinishZhanDou_1 } from '../zhanDouTasks'
import { searchGameTask } from '../gameTask'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import { randomName, sleep } from '../../../utils/toolkits'
import {
  findImagePositionsWithErrorHandle,
  findImageWithinTemplate,
  paddleOcr,
  screenCaptureToFile,
} from '../../../utils/fileOperations'
import { goToNPC, goToNPCAndTalk, hasCityDialog, hasGoneToCity, hasGoneToNPC, talkToNPC } from '../npcTasks'
import robotUtils from '../../../utils/robot'
import commonConfig from '../../../constants/config.json'

let taskIndex = 0
type IRestTasks = string[][]
const allNpcs = {
  十绝阵: [
    'hanBingZhenZhu',
    'hongShuiZhenZhu',
    'tianQueZhenZhu',
    'hongShaZhenZhu',
    'fengHouZhenZhu',
    'jinGuangZhenZhu',
    'diLieZhenZhu',
    'lieYanZhenZhu',
    'huaXueZhenZhu',
    'luoPoZhenZhu',
  ],
  修行任务: ['leiShen', 'huaShen', 'longShen', 'yanShen', 'shanShen'],
  寻仙任务: ['hanZhongLi', 'lanCaiHe', 'hanXiangZi', 'zhangGuoLao', 'caoGuoJiu', 'lvDongBin', 'heXianGu', 'tieGuaiLi'],
}
type ITaskType = keyof typeof allNpcs
const taskType = commonConfig.shuaDaiJinTaskType as ITaskType
export async function shuaDaiJin(isFirst = false) {
  await getGameWindows()
  const npcs = allNpcs[taskType]
  const allGameWindows = [...(await GameWindowControl.getAllGameWindows().values())]
  let restTasks = JSON.parse(await readLog(taskType)) as IRestTasks
  const teamLeaderWindows = [] as GameWindowControl[]
  for (const gameWindow of allGameWindows) {
    if (gameWindow.roleInfo.defaultTeamLeader) {
      teamLeaderWindows.push(gameWindow)
    }
  }
  const hasFinished = restTasks.every((tasks) => tasks.length === 0)

  if (hasFinished) {
    restTasks = []
    await lingQuRenWu(teamLeaderWindows)
    for (const _ of teamLeaderWindows) {
      restTasks.push([...npcs])
    }
  }

  if (isFirst) {
    for (const gameWindow of allGameWindows) {
      await gameWindow.setForeground()
      robotUtils.keyTap('W', ['control'])
      await sleep(1000)
      robotUtils.keyTap('2', 'control')
      await sleep(500)
    }
  }

  while (true) {
    if (taskType === '寻仙任务') {
      for (const [index, teamLeaderWindow] of Object.entries(teamLeaderWindows)) {
        await teamLeaderWindow.setForeground()
        if (restTasks[+index].length > 0) {
          const has = await hasCityDialog('pengLaiDao')
          if (!has) {
            await searchGameTask(taskType)
            await clickGamePoint('寻仙任务-蓬莱岛', 'xunXianRenWu')
          }
        }
      }

      for (const teamLeaderWindow of teamLeaderWindows) {
        await hasGoneToCity(teamLeaderWindow, 'pengLaiDao')
      }
    }

    await loopTasks(restTasks, teamLeaderWindows)
    if (taskType === '寻仙任务' && commonConfig.needRecheckTaskProgress) {
      const restTasks = []
      for (const teamLeaderWindow of teamLeaderWindows) {
        await teamLeaderWindow.setForeground()
        const found = await recheckTaskProgress('taiQingZhenJun')

        if (found) {
          restTasks.push([])
        } else {
          const tasks = await getTaskProgress(teamLeaderWindow)
          restTasks.push(tasks)
        }
      }

      writeLog('寻仙任务', JSON.stringify(restTasks, undefined, 4), true)
    }
    await shuaDaiJin()
  }
}

async function getTaskProgress(gameWindow: GameWindowControl) {
  const restTasks = []
  await searchGameTask(taskType)
  await gameWindow.restoreGameWindow()
  const { npcs, content } = global.appContext.gameTask[taskType] as {
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

    if (found) {
      restTasks.push(npc.pinYin)
    }
  }
  restTasks.sort((a, b) => (allNpcs[taskType].indexOf(a) > allNpcs[taskType].indexOf(b) ? 1 : -1))

  await gameWindow.maximizGameWindow()

  return restTasks
}

async function lingQuRenWu(teamLeaderWindows: GameWindowControl[]) {
  const { content, pinYin } = global.appContext.gameTask[taskType]
  const {
    taskNpc: { city, position, size, npcName, conversitions },
  } = content as {
    taskNpc: { city: string; position: number[]; size: number[]; npcName: string; conversitions: string[] }
  }

  for (const teamLeaderWindow of teamLeaderWindows) {
    await teamLeaderWindow.setForeground()
    await searchGameTask(taskType)
    await moveMouseToBlank()
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('lingQuRenWu')}.jpg`)
    await screenCaptureToFile(tempCapturePath, position, size)
    await moveMouseToAndClick(tempCapturePath, {
      buttonName: 'lingQuRenWu',
      position,
      size,
    })
  }

  for (const teamLeaderWindow of teamLeaderWindows) {
    await hasGoneToNPC(teamLeaderWindow)
    await goToNPCAndTalk({
      city,
      npcName,
      conversition: conversitions[0],
      gameWindow: teamLeaderWindow,
      calculatePosition: async () => {
        await moveMouseToBlank()
        const templateImagePath = path.join(pythonImagesPath, `GUIElements/taskRelative/${pinYin}.jpg`)
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('calculatePosition')}.jpg`)
        const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
        return position
      },
    })
    await sleep(500)
    await talkToNPC(city, npcName, conversitions[1])
    await sleep(500)
    robotUtils.keyTap('escape')
  }
}

async function loopTasks(restTasks: IRestTasks, teamLeaderWindows: GameWindowControl[]) {
  while (true) {
    writeLog(taskType, JSON.stringify(restTasks, undefined, 4), true)

    const hasFinished = restTasks.every((tasks) => tasks.length === 0)
    if (hasFinished) {
      return
    }

    const pairTask = restTasks.map((tasks) => tasks[0])

    if (taskType === '寻仙任务') {
      await executePairTaskOfXunXian(pairTask, teamLeaderWindows)
    } else {
      await executePairTask(pairTask, teamLeaderWindows)
    }
    restTasks.forEach((tasks) => tasks.shift())
    taskIndex++
  }
}

async function executePairTask(pairTask: (string | undefined)[], teamLeaderWindows: GameWindowControl[]) {
  const needExecuteTaskWindows = [] as GameWindowControl[]
  for (const [index, npc] of Object.entries(pairTask)) {
    const teamLeaderWindow = teamLeaderWindows[+index]
    if (!npc) {
      continue
    }
    needExecuteTaskWindows.push(teamLeaderWindow)
    await teamLeaderWindow.setForeground()

    await searchGameTask(taskType)
    await clickGamePoint(`${taskType}-NPC`, 'singleTask', {
      callback: async () => {
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('singleTask')}.jpg`)
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/renWuRiZhi.jpg')
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        return !found
      },
    })
  }

  // 队伍都到了NPC处，开始战斗
  for (const teamLeaderWindow of needExecuteTaskWindows) {
    await hasGoneToNPC(teamLeaderWindow)
    robotUtils.keyTap('f12')
    await sleep(500)
  }

  if (taskIndex && taskIndex % commonConfig.ziDongInterval === 0) {
    const gameWindows = [...(await GameWindowControl.getAllGameWindows().values())]
    for (const gameWindow of gameWindows) {
      await gameWindow.setForeground()
      robotUtils.keyTap('Z', ['alt'])
      await sleep(50)
      robotUtils.keyTap('Z', ['alt'])
    }
  }

  // 等待战斗结束
  for (const teamLeaderWindow of needExecuteTaskWindows) {
    await waitFinishZhanDou(teamLeaderWindow)
    await hasMeetLaoJun(teamLeaderWindow)
  }
}

async function executePairTaskOfXunXian(pairTask: (string | undefined)[], teamLeaderWindows: GameWindowControl[]) {
  const needExecuteTaskWindows = [] as GameWindowControl[]
  const npcs = []
  for (const [index, npc] of Object.entries(pairTask)) {
    const teamLeaderWindow = teamLeaderWindows[+index]
    if (!npc) {
      continue
    }
    needExecuteTaskWindows.push(teamLeaderWindow)
    npcs.push(npc)
    await teamLeaderWindow.setForeground()

    await goToNPC('蓬莱岛', npc)
  }

  // 队伍都到了NPC处，开始战斗
  for (const [index, teamLeaderWindow] of Object.entries(needExecuteTaskWindows)) {
    const npc = npcs[+index]
    await hasGoneToNPC(teamLeaderWindow)
    robotUtils.keyTap('f12')
    await sleep(500)
    if (commonConfig.xunXianSpecialCharacter) {
      const specialGameWindow = GameWindowControl.getGameWindowByRoleName(commonConfig.xunXianSpecialCharacter)!
      await specialGameWindow.setForeground()
      await sleep(200)
      robotUtils.keyTap('1', ['control'])
      await sleep(4000)
      robotUtils.keyTap('2', ['control'])
      await teamLeaderWindow.setForeground()
    }
  }

  if (taskIndex && taskIndex % commonConfig.ziDongInterval === 0) {
    const gameWindows = [...(await GameWindowControl.getAllGameWindows().values())]
    for (const gameWindow of gameWindows) {
      await gameWindow.setForeground()
      robotUtils.keyTap('Z', ['alt'])
      await sleep(50)
      robotUtils.keyTap('Z', ['alt'])
    }
  }

  // 等待战斗结束
  for (const teamLeaderWindow of needExecuteTaskWindows) {
    await waitFinishZhanDou_1(teamLeaderWindow)
  }

  if (commonConfig.buChongZhuangTai) {
    await buChongZhuangTai({ needJueSe: true })
  }
}

async function recheckTaskProgress(npcName: string) {
  const templateImagePath = path.join(pythonImagesPath, `GUIElements/npcRelative/${npcName}.jpg`)
  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('recheckTaskProgress')}.jpg`)
  robotUtils.keyTap('B', ['control'])
  await sleep(300)
  robotUtils.keyTap('Q', ['alt'])
  await sleep(300)
  await screenCaptureToFile(tempCapturePath)
  const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

  return found
}
