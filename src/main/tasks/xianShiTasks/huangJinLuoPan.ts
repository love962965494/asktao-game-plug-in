import { pythonImagesPath } from '../../../paths'
import GameWindowControl from '../../../utils/gameWindowControll'
import path from 'path'
import { compareTwoImages, findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import robotUtils from '../../../utils/robot'
import { randomName, sleep } from '../../../utils/toolkits'
import { clipboard } from 'electron'
import { readLog, writeLog } from '../../../utils/common'
import { isInBattle_1, waitFinishZhanDou_1 } from '../zhanDouTasks'
import { displayGameWindows, getTeamsInfo, liDui, yiJianZuDui } from '../basicTasks'
import { chiXiang, useWuPin } from '../wuPinTask'
import { ICityMap } from 'constants/types'

const taskName = 'huangJinLuoPan'

export async function huangJinLuoPanLoop(city: string) {
  const teamWindowsWithGroup = await getTeamsInfo()
  const data = await readLog('黄金罗盘')

  let hasFinishedRoles = JSON.parse(data) as string[]
  if (!hasFinishedRoles.includes(new Date().toLocaleDateString())) {
    await writeLog('黄金罗盘', JSON.stringify([new Date().toLocaleDateString()]), true)
    hasFinishedRoles = []
  }
  for (const [teamLeaderWindow, ...teamMemberWindows] of teamWindowsWithGroup) {
    await teamLeaderWindow.setForeground()
    await chiXiang(1, true)
    if (!hasFinishedRoles.includes(teamLeaderWindow.roleInfo.roleName)) {
      let hasDone = false
      while (!hasDone) {
        hasDone = await huangJinLuoPan(teamLeaderWindow, teamLeaderWindow, city)
      }
      hasFinishedRoles.push(teamLeaderWindow.roleInfo.roleName)
      await writeLog('黄金罗盘', JSON.stringify([new Date().toLocaleDateString(), ...hasFinishedRoles]), true)
      await sleep(5000)
    }

    for (const teamMemberWindow of teamMemberWindows) {
      if (!hasFinishedRoles.includes(teamMemberWindow.roleInfo.roleName)) {
        let hasDone = false
        await teamMemberWindow.setForeground()
        await chiXiang(1, true)
        while (!hasDone) {
          hasDone = await huangJinLuoPan(teamMemberWindow, teamLeaderWindow, city)
        }

        hasFinishedRoles.push(teamMemberWindow.roleInfo.roleName)
        await writeLog('黄金罗盘', JSON.stringify([new Date().toLocaleDateString(), ...hasFinishedRoles]), true)
        await sleep(5000)
      }
    }
  }

  await displayGameWindows()
}

export async function huangJinLuoPan(gameWindow: GameWindowControl, teamLeaderWindow: GameWindowControl, city: string) {
  await gameWindow.setForeground()
  robotUtils.keyTap('B', ['control'])

  const { size } = global.appContext.cityMap[city as keyof ICityMap]
  const meiZhaoDaoNeTemplateImagePath = path.join(
    pythonImagesPath,
    `GUIElements/taskRelative/${taskName}_meiZhaoDaoNe.jpg`
  )
  const beiWaLeTempCapturePath = path.join(pythonImagesPath, `GUIElements/taskRelative/${taskName}_beiWaLe.jpg`)

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
  let hasLiDui = false
  while (hasTask) {
    if (!gameWindow.roleInfo.defaultTeamLeader) {
      if (!nearlyGoneTo) {
        await teamLeaderWindow?.setForeground()
      } else {
        await gameWindow.setForeground()
        if (!hasLiDui) {
          await liDui()
          hasLiDui = true
        }
      }
    }
    robotUtils.keyTap('B', ['control'])
    await sleep(300)
    robotUtils.keyTap('W', ['alt'])
    clipboard.writeText(`${center[0]}.${center[1]}`)
    robotUtils.keyTap('V', ['control'])
    robotUtils.keyTap('enter')

    await hasGoneToDestination(Math.max(Math.round(time / Math.pow(2, count)), 3000), nearlyGoneTo)
    await gameWindow.setForeground()

    const getDirectionTempCapturePath = path.join(
      pythonImagesPath,
      `temp/${randomName(`${taskName}_getDirection`)}.jpg`
    )
    robotUtils.keyTap('B', ['control'])
    await sleep(300)
    await screenCaptureToFile(getDirectionTempCapturePath, [1093, 155], [210, 155])
    let direction = await getDirection(getDirectionTempCapturePath)

    if (!direction) {
      // 找到了
      if (!gameWindow.roleInfo.defaultTeamLeader && !hasLiDui) {
        await liDui()
        hasLiDui = true
      }
      await useWuPin('huangJinLuoPan')
      const zhaoDaoLeTempCapturePath = path.join(pythonImagesPath, `temp/${randomName(`${taskName}_zhaoDaoLe`)}.jpg`)
      await screenCaptureToFile(zhaoDaoLeTempCapturePath)
      const found1 = await findImageWithinTemplate(zhaoDaoLeTempCapturePath, meiZhaoDaoNeTemplateImagePath)
      const found2 = await findImageWithinTemplate(zhaoDaoLeTempCapturePath, beiWaLeTempCapturePath)
      if (found1) {
        // 还没找到
      } else if (found2) {
        // 被别人挖了
        return false
      } else {
        // 找到了
        const inBattle = await isInBattle_1(gameWindow)

        if (inBattle) {
          await waitFinishZhanDou_1(gameWindow)
        }

        if (!gameWindow.roleInfo.defaultTeamLeader) {
          await yiJianZuDui(teamLeaderWindow.roleInfo.roleName)
        }
        hasTask = false
        continue
      }
    }

    direction = direction || directions[0]
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
    return
  }
  return direction
}

const tinyDistance = 1
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

async function hasGoneToDestination(maxTime: number, nearlyGoneTo: boolean) {
  if (nearlyGoneTo) {
    await sleep(1000)
    return
  }
  const { position, size } = global.appContext.gamePoints['地图-坐标']
  let hasTimeout = false
  const promise1 = new Promise(async (resolve) => {
    let hasGoneTo = false

    while (!hasGoneTo) {
      if (hasTimeout) {
        break
      }
      const tempCapturePath1 = path.join(pythonImagesPath, `temp/${randomName('hasGoneToDestination')}.jpg`)
      await screenCaptureToFile(tempCapturePath1, position, size)
      await sleep(200)
      const tempCapturePath2 = path.join(pythonImagesPath, `temp/${randomName('hasGoneToDestination')}.jpg`)
      await screenCaptureToFile(tempCapturePath2, position, size)

      const [result] = await compareTwoImages(tempCapturePath1, tempCapturePath2)

      hasGoneTo = result === 0
    }

    resolve(1)
  })
  const promise2 = new Promise(async (resolve) => {
    await sleep(maxTime)
    hasTimeout = true
    resolve(2)
  })

  await Promise.race([promise1, promise2])

  await sleep(1000)
}
