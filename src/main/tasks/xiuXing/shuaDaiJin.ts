import { getGameWindows } from '../../../utils/systemCotroll'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank, readLog, writeLog } from '../../../utils/common'
import GameWindowControl from '../../../utils/gameWindowControll'
import { buChongZhuangTai, hasMeetLaoJun, keepZiDong, waitFinishZhanDou, waitFinishZhanDou_1 } from '../zhanDouTasks'
import { searchGameTask } from '../gameTask'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import { randomName, sleep } from '../../../utils/toolkits'
import { findImagePositions, findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import { getCurrentCity, goToNPC, goToNPCAndTalk, hasGoneToCity, hasGoneToNPC, talkToNPC } from '../npcTasks'
import robotUtils from '../../../utils/robot'
import commonConfig from '../../../constants/config.json'
import { chiXiang } from '../wuPinTask'

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
  寻仙任务: ['hanZhongLi', 'lanCaiHe', 'hanXiangZi', 'zhangGuoLao', 'caoGuoJiu', 'lvDongBin',  'heXianGu', 'tieGuaiLi']
}
type ITaskType = keyof typeof allNpcs
const taskType = commonConfig.shuaDaiJinTaskType as ITaskType
export async function shuaDaiJin() {
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

  while (true) {
    if (taskType === '寻仙任务') {
      for (const [index, teamLeaderWindow] of Object.entries(teamLeaderWindows)) {
        await teamLeaderWindow.setForeground()
        if (restTasks[+index].length > 0) {
          const currentCity = await getCurrentCity()
          if (currentCity !== '蓬莱岛') {
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
    await shuaDaiJin()
  }
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
    const tempCapturePath = path.join(pythonImagesPath, `temp/lingQuRenWu_${randomName()}.jpg`)
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
        const tempCapturePath = path.join(pythonImagesPath, `temp/singleTask_${randomName()}.jpg`)
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

  // if (taskIndex && taskIndex % commonConfig.ziDongInterval === 0) {
  //   await keepZiDong()
  // }
}

async function executePairTaskOfXunXian(pairTask: (string | undefined)[], teamLeaderWindows: GameWindowControl[]) {
  const needExecuteTaskWindows = [] as GameWindowControl[]
  for (const [index, npc] of Object.entries(pairTask)) {
    const teamLeaderWindow = teamLeaderWindows[+index]
    if (!npc) {
      continue
    }
    needExecuteTaskWindows.push(teamLeaderWindow)
    await teamLeaderWindow.setForeground()

    await goToNPC('蓬莱岛', npc)
  }

  // 队伍都到了NPC处，开始战斗
  for (const teamLeaderWindow of needExecuteTaskWindows) {
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
    await buChongZhuangTai({ needJueSe: true, needZhongCheng: true })
  }
}