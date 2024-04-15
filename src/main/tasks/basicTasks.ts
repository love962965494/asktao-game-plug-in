import { screen } from 'electron'
import GameWindowControl from '../../utils/gameWindowControll'
import { getGameWindows } from '../../utils/systemCotroll'
import { sleep } from '../../utils/toolkits'
import robotUtils from '../../utils/robot'
import robotjs from 'robotjs'
import {
  clickButton,
  clickGamePoint,
  moveMouseTo,
  moveMouseToAndClickUseColor,
  moveMouseToBlank,
} from '../../utils/common'

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
export async function yiJianZuDui(roleName: string) {
  await getGameWindows()
  const gameWindow = GameWindowControl.getGameWindowByRoleName(roleName)
  await gameWindow?.setForeground()

  robotUtils.keyTap('B', ['control'])
  await sleep(200)

  await clickGamePoint('活动图标', 'yiJianZuDui')
  await sleep(500)
  await clickGamePoint('一键组队', 'yiJianZuDui', {
    callback: () => undefined
  })
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
