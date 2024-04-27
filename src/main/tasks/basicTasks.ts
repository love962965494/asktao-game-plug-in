import { screen } from 'electron'
import GameWindowControl from '../../utils/gameWindowControll'
import { getGameWindows } from '../../utils/systemCotroll'
import { randomName, sleep } from '../../utils/toolkits'
import robotUtils from '../../utils/robot'
import robotjs from 'robotjs'
import {
  clickButton,
  clickGamePoint,
  moveMouseTo,
  moveMouseToAndClick,
  moveMouseToAndClickUseColor,
  moveMouseToBlank,
} from '../../utils/common'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import { findImagePositions, screenCaptureToFile } from '../../utils/fileOperations'

// 组队
export async function groupTeam(teamIndex: number) {
  await getGameWindows()
  const allGameWindows = GameWindowControl.getGameWindowsByTeamIndex(teamIndex)
  const [teamLeaderWindow, ...otherTeamMemberWindow] = allGameWindows
  const {
    size: { width, height },
  } = screen.getPrimaryDisplay()

  await teamLeaderWindow.setForeground()

  // 先是队长组队
  await moveMouseToBlank()

  // 队长自己组队
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  robotUtils.keyTap('T', ['alt'])
  await sleep(500)
  await moveMouseTo(Math.round(width / 2) - 60, Math.round(height / 2) - 60)
  await sleep(500)
  robotUtils.mouseClick('left')
  await sleep(500)
  robotUtils.keyTap('T', ['alt'])

  await sleep(500)
  // 打开好友栏
  robotUtils.keyTap('F', ['alt'])
  // 邀请每个队员
  for (let i = 0; i < 4; i++) {
    let j = 0
    while (j < 2) {
      await moveMouseTo(1650, 420 + 90 * i)

      await sleep(200)
      robotjs.mouseToggle('down')

      await sleep(200)
      robotjs.dragMouse(Math.round(width / 2), Math.round(height / 2))
      await sleep(1000)
      robotjs.mouseToggle('up')

      await sleep(2000)
      j++
    }
  }

  // 每个好友依次接受邀请
  const { position, size } = global.appContext.gamePoints['组队-加入']
  for (const teamMemberWindow of otherTeamMemberWindow) {
    await teamMemberWindow.setForeground()
    await moveMouseToBlank()

    robotUtils.keyTap('B', ['control'])
    await sleep(500)
    robotUtils.keyTap('T', ['alt'])

    await sleep(500)

    await clickButton({
      buttonName: 'jiaRu',
      position,
      size,
    })

    await sleep(500)
  }

  await teamLeaderWindow.setForeground()

  return teamLeaderWindow
}

// 依次升为队长
export async function teamLeaderByTurn() {
  await getGameWindows()
  await teamLeaderByRoleName(1, 'Keyの旺夫')
}

// 一键组队
const yiJianZuDuiSize = [75, 85]
let zuDuiPosition: number[]
export async function yiJianZuDui(roleName: string) {
  await getGameWindows()
  const gameWindow = GameWindowControl.getGameWindowByRoleName(roleName)
  await gameWindow?.setForeground()

  robotUtils.keyTap('B', ['control'])
  await sleep(200)

  await clickGamePoint('活动图标', 'yiJianZuDui')
  await sleep(500)
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/yiJianZuDui.jpg')

  if (!zuDuiPosition) {
    await moveMouseToBlank()
    const tempCapturePath = path.join(pythonImagesPath, `temp/yiJianZuDui_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    zuDuiPosition = await findImagePositions(tempCapturePath, templateImagePath)
  }
  await moveMouseToAndClick(
    templateImagePath,
    {
      buttonName: 'yiJianZuDui',
      position: zuDuiPosition,
      size: yiJianZuDuiSize,
    },
    {
      callback: () => undefined,
    }
  )
  await sleep(500)
  robotUtils.keyTap('B', ['control'])
}

// 离队
export async function liDui() {
  await moveMouseToBlank()
  robotUtils.keyTap('B', ['control'])
  await sleep(200)
  robotUtils.keyTap('T', ['alt'])
  await sleep(200)

  await clickGamePoint('离队', 'liDui')
}

// 升为队长
const captureSize = [100, 26]
const rolePositions = [
  [420, 308],
  [420, 351],
  [420, 393],
  [420, 435],
]
export async function teamLeaderByRoleName(teamIndex: number, roleName?: string) {
  // let teamIndex: number
  // for (const groupAccounts of global.appContext.accounts) {
  //   for (const account of groupAccounts) {
  //     if (account.roles.includes(roleName)) {
  //       teamIndex = account.teamIndex
  //       break
  //     }
  //   }
  // }
  const [teamLeaderWindow] = await GameWindowControl.getTeamWindowsWithSequence(teamIndex)

  if (!teamLeaderWindow) {
    throw new Error('The roles have not grouped!')
  }

  await teamLeaderWindow.setForeground()

  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  robotUtils.keyTap('T', ['alt'])
  await sleep(500)
  await moveMouseTo(210, 10)

  {
    await moveMouseToAndClickUseColor(
      {
        buttonName: 'teamLeaderByTurn',
        position: rolePositions[3],
        size: captureSize,
      },
      '#283214'
    )
  }

  {
    const { position, size } = global.appContext.gamePoints['组队-升为队长']
    await clickButton({
      buttonName: 'teamLeaderByTurn',
      position,
      size,
    })
  }

  await sleep(300)
  robotUtils.keyTap('enter')

  await sleep(200)
  robotUtils.keyTap('B', ['control'])
}

// 获取组队信息
export async function getTeamsInfo() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const teamIndexes = [1].concat(gameWindows.length > 5 ? [2] : [])
  const teamWindowsWithGroup: GameWindowControl[][] = []
  for (const teamIndex of teamIndexes) {
    const teamWindows = (await GameWindowControl.getTeamWindowsWithSequence(teamIndex)) as GameWindowControl[]
    teamWindowsWithGroup.push(teamWindows)
  }

  return teamWindowsWithGroup
}

// 排列窗口
const positions = [
  [0, 0],
  [1920 - 800, 0],
  [Math.round((1920 - 800) / 2), Math.round((1040 - 625) / 2) - 60],
  [0, 1040 - 625],
  [1920 - 800, 1040 - 625],
  [125, 100],
  [1920 - 800 - 125, 100],
  [Math.round((1920 - 800) / 2), Math.round((1040 - 625) / 2) + 60],
  [125, 1040 - 625 - 80],
  [1920 - 800 - 125, 1040 - 625 - 80],
]
export async function displayGameWindows() {
  await getGameWindows()
  const allGameWindows = [...GameWindowControl.getAllGameWindows().values()]

  for (const gameWindow of allGameWindows) {
    gameWindow.restoreGameWindow()
  }

  for (const [index, gameWindow] of Object.entries(allGameWindows)) {
    await gameWindow.setForeground()
    const position = positions[+index]

    gameWindow.setPosition(position[0], position[1])
    await sleep(100)
  }
}
