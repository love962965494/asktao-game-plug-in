import { pythonImagesPath } from '../../../paths'
import GameWindowControl from '../../../utils/gameWindowControll'
import path from 'path'
import { findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import robotUtils from '../../../utils/robot'
import { randomName, sleep } from '../../../utils/toolkits'
import { clipboard } from 'electron'
import { clickGamePoint, readLog, writeLog } from '../../../utils/common'
import { isInBattle_1, waitFinishZhanDou_1 } from '../zhanDouTasks'
import { getTeamsInfo, liDui, yiJianZuDui } from '../basicTasks'
import { useWuPin } from '../wuPinTask'

const taskName = 'huangJinLuoPan'

export async function huangJinLuoPanLoop() {
  const teamWindowsWithGroup = await getTeamsInfo()

  for (const [teamLeaderWindow, ...teamMemberWindows] of teamWindowsWithGroup) {
    let hasDone = false
    while (!hasDone) {
      hasDone = await huangJinLuoPan(teamLeaderWindow, teamLeaderWindow)
    }

    for (const teamMemberWindow of teamMemberWindows) {
      let hasDone = false
      while (!hasDone) {
        hasDone = await huangJinLuoPan(teamMemberWindow, teamLeaderWindow)
      }
    }
  }
}

export async function huangJinLuoPan(gameWindow: GameWindowControl, teamLeaderWindow: GameWindowControl) {
  const hasFinishedRoles = JSON.parse(await readLog('黄金罗盘')) as string[]
  if (hasFinishedRoles.includes(gameWindow.roleInfo.roleName)) {
    return true
  }
  await gameWindow.setForeground()
  robotUtils.keyTap('B', ['control'])

  const { size } = global.appContext.cityMap['轩辕庙']
  const templateImagePath1 = path.join(pythonImagesPath, `GUIElements/taskRelative/${taskName}_success1.jpg`)
  const templateImagePath2 = path.join(pythonImagesPath, `GUIElements/taskRelative/${taskName}_success2.jpg`)

  let leftTop = [0, 0]
  let rightBottom = [size[0], size[1]]
  const time = 40 * 1000
  let count = 1
  let center = [Math.round((leftTop[0] + rightBottom[0]) / 2), Math.round((leftTop[1] + rightBottom[1]) / 2)]
  let nearlyGoneTo = false
  let hasTask = true
  if (!gameWindow.roleInfo.defaultTeamLeader) {
    await liDui()
  }
  await useWuPin('huangJinLuoPan')
  if (!gameWindow.roleInfo.defaultTeamLeader) {
    await yiJianZuDui(teamLeaderWindow?.roleInfo.roleName)
  }
  while (hasTask) {
    if (!gameWindow.roleInfo.defaultTeamLeader) {
      await teamLeaderWindow?.setForeground()
    }
    robotUtils.keyTap('B', ['control'])
    await sleep(300)
    robotUtils.keyTap('W', ['alt'])
    clipboard.writeText(`${center[0]}.${center[1]}`)
    robotUtils.keyTap('V', ['control'])
    robotUtils.keyTap('enter')
    await gameWindow.setForeground()
    robotUtils.keyTap('B', ['control'])
    await sleep(Math.max(Math.round(time / Math.pow(2, count)), 3000))
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName(`${taskName}_getDirection`)}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    const found1 = await findImageWithinTemplate(tempCapturePath, templateImagePath1)
    const found2 = await findImageWithinTemplate(tempCapturePath, templateImagePath2)

    if ((found1 && found2) || nearlyGoneTo) {
      if (!gameWindow.roleInfo.defaultTeamLeader) {
        await liDui()

        do {
          const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName(`${taskName}_getDirection`)}.jpg`)
          await screenCaptureToFile(tempCapturePath)
          const found1 = await findImageWithinTemplate(tempCapturePath, templateImagePath1)
          const found2 = await findImageWithinTemplate(tempCapturePath, templateImagePath2)

          if (found1 && found2) {
            break
          }

          await screenCaptureToFile(tempCapturePath, [1093, 155], [210, 155])
          const direction = await getDirection(tempCapturePath)
          ;[leftTop, rightBottom, center] = calculatePositions(leftTop, rightBottom, center, direction, true)
          robotUtils.keyTap('B', ['control'])
          await sleep(500)
          robotUtils.keyTap('W', ['alt'])
          clipboard.writeText(`${center[0]}.${center[1]}`)
          robotUtils.keyTap('V', ['control'])
          robotUtils.keyTap('enter')
          await sleep(Math.max(Math.round(time / Math.pow(2, count)), 2000))
        } while (true)
      }
      await clickGamePoint('黄金罗盘', `${taskName}_success`)
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/taskRelative/huangJinLuoPan_hasBeenFound.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('huangJinLuoPan_hasBeenFound')}.jpg`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      if (found) {
        return false
      } else {
        const inBattle = await isInBattle_1(gameWindow)

        if (inBattle) {
          await waitFinishZhanDou_1(gameWindow)
        }
      
        await writeLog('黄金罗盘', JSON.stringify(hasFinishedRoles.concat(gameWindow.roleInfo.roleName)), true)
        hasTask = false
      }

      if (!gameWindow.roleInfo.defaultTeamLeader) {
        await yiJianZuDui(teamLeaderWindow.roleInfo.roleName)
      }
      break
    }

    await screenCaptureToFile(tempCapturePath, [1093, 155], [210, 155])
    const direction = await getDirection(tempCapturePath)

    let prevCenter = [...center]
    ;[leftTop, rightBottom, center] = calculatePositions(leftTop, rightBottom, center, direction, nearlyGoneTo)
    const distance = Math.sqrt(Math.pow(center[0] - prevCenter[0], 2) + Math.pow(center[1] - prevCenter[1], 2))
    if (!nearlyGoneTo) {
      if (gameWindow.roleInfo.defaultTeamLeader && center.join('') === prevCenter.join('')) {
        nearlyGoneTo = true
      }
      if (!gameWindow.roleInfo.defaultTeamLeader && distance <= 5) {
        nearlyGoneTo = true
      }
    }
    count++
  }

  return true
}

const directions = ['left', 'leftTop', 'top', 'rightTop', 'right', 'rightBottom', 'bottom', 'leftBottom'] as const
export async function getDirection(tempCapturePath: string) {
  let direction
  for (let i = 0; i < 8; i++) {
    const templateImagePath = path.join(pythonImagesPath, `GUIElements/taskRelative/${taskName}_${i}.jpg`)
    const found = await findImageWithinTemplate(tempCapturePath, templateImagePath, 0.7)

    if (found) {
      direction = directions[i]
      break
    }
  }

  if (!direction) {
    throw new Error('getDirection error')
  }
  return direction
}

const tinyDistance = 3
function calculatePositions(
  leftTop: number[],
  rightBottom: number[],
  center: number[],
  direction: (typeof directions)[keyof typeof directions],
  nearlyGoneTo: boolean
) {
  let [newLeftTop, newRightBottom, newCenter] = [[...leftTop], [...rightBottom], [...center]]
  const [left, top] = leftTop
  const [right, bottom] = rightBottom
  const [x, y] = center
  switch (direction) {
    case 'left': {
      if (nearlyGoneTo) {
        newCenter = [x - tinyDistance, y]
      } else {
        newCenter = [Math.round((left + x) / 2), y]
        newRightBottom = [x, bottom]
      }
      break
    }
    case 'leftTop': {
      if (nearlyGoneTo) {
        newCenter = [x - tinyDistance, y - tinyDistance]
      } else {
        newCenter = [Math.round((left + x) / 2), Math.round((top + y) / 2)]
        newRightBottom = [...center]
      }
      break
    }
    case 'top': {
      if (nearlyGoneTo) {
        newCenter = [x, y - tinyDistance]
      } else {
        newCenter = [x, Math.round((top + y) / 2)]
        newRightBottom = [right, y]
      }
      break
    }
    case 'rightTop': {
      if (nearlyGoneTo) {
        newCenter = [x + tinyDistance, y - tinyDistance]
      } else {
        newCenter = [Math.round((right + x) / 2), Math.round((top + y) / 2)]
        newLeftTop = [x, top]
        newRightBottom = [right, y]
      }
      break
    }
    case 'right': {
      if (nearlyGoneTo) {
        newCenter = [x + tinyDistance, y]
      } else {
        newCenter = [Math.round((right + x) / 2), y]
        newLeftTop = [x, top]
      }
      break
    }
    case 'rightBottom': {
      if (nearlyGoneTo) {
        newCenter = [x + tinyDistance, y + tinyDistance]
      } else {
        newCenter = [Math.round((right + x) / 2), Math.round((bottom + y) / 2)]
        newLeftTop = [x, y]
      }
      break
    }
    case 'bottom': {
      if (nearlyGoneTo) {
        newCenter = [x, y + tinyDistance]
      } else {
        newCenter = [x, Math.round((bottom + y) / 2)]
        newLeftTop = [left, y]
      }
      break
    }
    case 'leftBottom': {
      if (nearlyGoneTo) {
        newCenter = [x - tinyDistance, y + tinyDistance]
      } else {
        newCenter = [Math.round((left + x) / 2), Math.round((bottom + y) / 2)]
        newLeftTop = [left, y]
        newRightBottom = [x, bottom]
      }
      break
    }
  }

  return [newLeftTop, newRightBottom, newCenter]
}
