import { getTeamsInfo } from '../basicTasks'
import { escShouCangTasks, hasGameTask, searchGameTask } from '../gameTask'
import { goToNPCAndTalk, hasGoneToNPC, talkToNPC } from '../npcTasks'
import { randomName, sleep } from '../../../utils/toolkits'
import path from 'path'
import { moveMouseToAndClick, moveMouseToBlank } from '../../../utils/common'
import { pythonImagesPath } from '../../../paths'
import {
  findImagePositionsWithErrorHandle,
  findMultiMatchPositions,
  screenCaptureToFile,
} from '../../../utils/fileOperations'
import GameWindowControl from '../../../utils/gameWindowControll'
import { waitFinishZhanDou, waitFinishZhanDou_1 } from '../zhanDouTasks'
import { chiXiang } from '../wuPinTask'

const city = '无名小镇'
const npcName = 'xianJieShenBu'
const taskName = '悬赏令'
export async function xianJieShenBu() {
  const teamWindowsWithGroup = await getTeamsInfo()
  const teamLeaderWindows = teamWindowsWithGroup.map((teamWindows) => teamWindows[0])
  console.log('teamLeaderWindows:', teamLeaderWindows);
  
  const taskPositions: number[][][] = []
  let allHasFinished: boolean[] = []
  for (const teamWindows of teamWindowsWithGroup) {
    let hasFinished = false
    const [teamLeaderWindow] = teamWindows
    await teamLeaderWindow.setForeground()
    let hasTask = await hasGameTask(taskName)
    let positions: number[][] = []

    if (hasTask) {
      positions = await getTaskProgress(teamWindows)

      if (positions.length === 0) {
        // TODO: 领取任务奖励
        await lingQuJiangLi(teamWindows)
        hasTask = false
      }
    }

    if (!hasTask) {
      hasFinished = await lingQuRenWu(teamWindows)
      if (!hasFinished) {
        await sleep(1000)
        positions = await getTaskProgress(teamWindows)
      }
    }

    allHasFinished.push(hasFinished)
    taskPositions.push(positions)
  }

  while (allHasFinished.length > 0 && !allHasFinished.every(Boolean)) {
    for (const teamLeaderWindow of teamLeaderWindows) {
      await teamLeaderWindow.setForeground()
      await chiXiang(1)
    }
    await loopTasks(taskPositions, teamLeaderWindows)
    allHasFinished = []
    await xianJieShenBu()
  }
}

async function lingQuRenWu(teamWindows: GameWindowControl[]) {
  const [teamLeaderWindow, ...teamMemberWindows] = teamWindows
  await teamLeaderWindow.setForeground()
  const hasFinished = await escShouCangTasks('xuanShangBOSS', false, true)
  if (hasFinished) {
    return hasFinished
  }
  // await hasGoneToNPC(teamLeaderWindow)
  await talkToNPC(
    city,
    npcName,
    `xuanShangRenWu(${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['任务模式']})_duiZhang`,
    async () => {
      await moveMouseToBlank()
      const templateImagePath = path.join(
        pythonImagesPath,
        `GUIElements/common/${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['任务模式']}.jpg`
      )
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('calculatePosition1')}.jpg`)
      const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
      return position
    }
  )
  await sleep(500)

  for (const teamMemberWindow of teamMemberWindows) {
    await teamMemberWindow.setForeground()
    await talkToNPC(
      city,
      npcName,
      `xuanShangRenWu(${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['任务模式']})_duiYuan`,
      async () => {
        await moveMouseToBlank()
        const templateImagePath = path.join(
          pythonImagesPath,
          `GUIElements/common/${teamMemberWindow.roleInfo.gameConfig['仙界神捕']['任务模式']}.jpg`
        )
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('calculatePosition2')}.jpg`)
        const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
        return position
      }
    )
    await sleep(500)
  }

  return false
}

async function getTaskProgress(teamWindows: GameWindowControl[]) {
  const [teamLeaderWindow] = teamWindows
  await teamLeaderWindow.setForeground()
  await searchGameTask(taskName)
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/xuanShangLing.jpg')
  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('executePairTask1')}.jpg`)
  await screenCaptureToFile(tempCapturePath)
  const positions = await findMultiMatchPositions(tempCapturePath, templateImagePath)

  return positions
}

async function loopTasks(taskPositions: number[][][], teamLeaderWindows: GameWindowControl[]) {
  while (true) {
    const hasFinished = taskPositions.join('') === ''
    if (hasFinished) {
      return
    }
    const pairPosition = taskPositions.map((taskPositions) => taskPositions.pop())

    await executePairTask(pairPosition, teamLeaderWindows)
  }
}

const xuanShangLingSize = [102, 34]
async function executePairTask(pairPosition: (number[] | undefined)[], teamLeaderWindows: GameWindowControl[]) {
  const tempTeamLeaderWindows: GameWindowControl[] = []
  for (const [index, teamLeaderWindow] of Object.entries(teamLeaderWindows)) {
    const position = pairPosition[+index]
    if (!position) {
      continue
    }
    await teamLeaderWindow.setForeground()
    await searchGameTask(taskName)
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('executePairTask2')}.jpg`)
    await screenCaptureToFile(tempCapturePath, position, xuanShangLingSize)
    await moveMouseToAndClick(tempCapturePath, {
      buttonName: 'executePairTask',
      position,
      size: xuanShangLingSize,
    })

    tempTeamLeaderWindows.push(teamLeaderWindow)
  }

  for (const teamLeaderWindow of tempTeamLeaderWindows) {
    await hasGoneToNPC(teamLeaderWindow)
    await sleep(500)
    await talkToNPC('十里坡', 'xianJiePanNi', 'jiNaTongJiFan')
  }

  // 等待战斗结束
  for (const teamLeaderWindow of tempTeamLeaderWindows) {
    await waitFinishZhanDou_1(teamLeaderWindow)
  }

  await sleep(500)
}

async function lingQuJiangLi(teamWindows: GameWindowControl[]) {
  const [teamLeaderWindow, ...teamMemberWindows] = teamWindows
  await teamLeaderWindow.setForeground()
  await escShouCangTasks('xuanShangBOSS', false, true)
  await talkToNPC(
    city,
    npcName,
    `xuanShangRenWu(${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['任务模式']})_duiZhang`,
    async () => {
      await moveMouseToBlank()
      const templateImagePath = path.join(
        pythonImagesPath,
        `GUIElements/common/${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['任务模式']}.jpg`
      )
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('calculatePosition1')}.jpg`)
      const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
      return position
    }
  )

  await sleep(500)

  await talkToNPC(city, npcName, `woYao${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['奖励模式']}`, async () => {
    await moveMouseToBlank()
    const templateImagePath = path.join(
      pythonImagesPath,
      `GUIElements/common/${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['奖励模式']}.jpg`
    )
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('calculatePosition2')}.jpg`)
    const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)

    return position
  })
  await sleep(500)

  for (const teamMemberWindow of teamMemberWindows) {
    await teamMemberWindow.setForeground()
    await talkToNPC(
      city,
      npcName,
      `xuanShangRenWu(${teamMemberWindow.roleInfo.gameConfig['仙界神捕']['任务模式']})_duiYuan`,
      async () => {
        await moveMouseToBlank()
        const templateImagePath = path.join(
          pythonImagesPath,
          `GUIElements/common/${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['任务模式']}.jpg`
        )
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('calculatePosition3')}.jpg`)
        const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)

        return position
      }
    )
    await sleep(500)
    await talkToNPC(city, npcName, `woYao${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['奖励模式']}`, async () => {
      await moveMouseToBlank()
      const templateImagePath = path.join(
        pythonImagesPath,
        `GUIElements/common/${teamLeaderWindow.roleInfo.gameConfig['仙界神捕']['奖励模式']}.jpg`
      )
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('calculatePosition4')}.jpg`)
      const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)

      return position
    })
    await sleep(500)
  }
}
