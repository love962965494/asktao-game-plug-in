import { getGameWindows } from '../../../utils/systemCotroll'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank, readLog, writeLog } from '../../../utils/common'
import GameWindowControl from '../../../utils/gameWindowControll'
import { hasMeetLaoJun, keepZiDong, waitFinishZhanDou } from '../zhanDouTasks'
import { searchGameTask } from '../gameTask'
import path from 'path'
import { pythonImagesPath, staticPath } from '../../../paths'
import { randomName, sleep } from '../../../utils/toolkits'
import { findImagePositions, findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import { getCurrentCityByNpc, goToNPCAndTalk, hasGoneToNPC, talkToNPC } from '../npcTasks'
import robotUtils from '../../../utils/robot'
import commonConfig from '../../../constants/config.json'
import playSound from 'play-sound'
import { chiXiang } from '../wuPinTask'

let taskIndex = 0
const hasFinishedBgm = path.join(staticPath, '/error.wav')
const taskType = '十绝阵'
type ITaskInfo = { teamLeader: string; restTasks: string[] }[]
const allNpcs = [
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
]
export async function daiRenXiuShan() {
  await getGameWindows()
  const taskInfo = JSON.parse(await readLog('带人十绝')) as ITaskInfo
  const teamLeaderWindows = [] as GameWindowControl[]
  for (const itemInfo of taskInfo) {
    const teamLeaderWindow = GameWindowControl.getGameWindowByRoleName(itemInfo.teamLeader)!
    teamLeaderWindows.push(teamLeaderWindow)
  }
  const hasFinished = taskInfo.every((info) => info.restTasks.length === 0)

  if (hasFinished) {
    for (const teamLeaderWindow of teamLeaderWindows) {
      await lingQuRenWu(teamLeaderWindow)
    }
    taskInfo.forEach((itemInfo) => (itemInfo.restTasks = [...allNpcs]))
  }

  while (taskIndex < 50) {
    // for (const teamLeaderWindow of teamLeaderWindows) {
    //   await teamLeaderWindow.setForeground()
    //   await chiXiang(1)
    // }
    await loopTasks(taskInfo, teamLeaderWindows)
    await daiRenXiuShan()
  }

  playSound().play(hasFinishedBgm)
}

async function lingQuRenWu(teamLeaderWindow: GameWindowControl) {
  await teamLeaderWindow.setForeground()
  await searchGameTask(taskType)
  const { content, pinYin } = global.appContext.gameTask[taskType]
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

  robotUtils.keyTap('escape')
}

async function loopTasks(taskInfo: ITaskInfo, teamLeaderWindows: GameWindowControl[]) {
  while (true) {
    writeLog('带人十绝', JSON.stringify(taskInfo, undefined, 4), true)

    const hasFinished = taskInfo.every((info) => info.restTasks.length === 0)
    if (hasFinished) {
      return
    }

    const pairTask = taskInfo.map((info) => info.restTasks[0])

    await executePairTask(pairTask, teamLeaderWindows)
    taskInfo.forEach((info) => info.restTasks.shift())
    taskIndex++
  }
}

async function executePairTask(pairTask: (string | undefined)[], teamLeaderWindows: GameWindowControl[]) {
  const conversition = 'qingDaShenZhiDian'
  const needExecuteTaskWindows = [] as GameWindowControl[]
  const npcs = [] as string[]
  for (const [index, npc] of Object.entries(pairTask)) {
    const teamLeaderWindow = teamLeaderWindows[+index]
    if (!npc) {
      continue
    }
    needExecuteTaskWindows.push(teamLeaderWindow)
    npcs.push(npc)
    await teamLeaderWindow.setForeground()

    await searchGameTask(taskType)
    await sleep(500)
    await clickGamePoint(`${taskType}-NPC`, 'singleTask', {
      callback: async () => {
        const tempCapturePath = path.join(pythonImagesPath, `temp/singleTask_${randomName()}.jpg`)
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/renWuRiZhi.jpg')
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        return !found
      },
    })
    await sleep(500)
  }

  // 队伍都到了NPC处，开始战斗
  for (const [index, teamLeaderWindow] of Object.entries(needExecuteTaskWindows)) {
    const npc = npcs[+index]
    await hasGoneToNPC(teamLeaderWindow)
    const city = getCurrentCityByNpc(npc)
    await talkToNPC(city, npc, conversition)
    await sleep(500)
  }

  // 等待战斗结束
  for (const teamLeaderWindow of needExecuteTaskWindows) {
    await waitFinishZhanDou(teamLeaderWindow)
    await hasMeetLaoJun(teamLeaderWindow)
  }

  // 补充自动回合
  if (taskIndex && taskIndex % commonConfig.ziDongInterval === 0) {
    await keepZiDong()
  }
}
