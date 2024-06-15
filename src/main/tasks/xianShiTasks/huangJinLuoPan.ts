import { pythonImagesPath } from '../../../paths'
import GameWindowControl from '../../../utils/gameWindowControll'
import path from 'path'
import { findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import robotUtils from '../../../utils/robot'
import { randomName, sleep } from '../../../utils/toolkits'
import { clipboard } from 'electron'
import { clickGamePoint } from '../../../utils/common'

const taskName = 'huangJinLuoPan'
export async function huangJinLuoPan(gameWindow: GameWindowControl, teamLeaderWindow?: GameWindowControl) {
  await gameWindow.setForeground()

  const { size } = global.appContext.cityMap['风月谷']
  const templateImagePath = path.join(pythonImagesPath, `GUIElements/taskRelative/${taskName}_success.jpg`)

  let leftTop = [0, 0]
  let rightBottom = [size[0], size[1]]
  const time = 40 * 1000
  let count = 1
  let center = [Math.round((leftTop[0] + rightBottom[0]) / 2), Math.round((leftTop[1] + rightBottom[1]) / 2)]
  let nearlyGoneTo = false
  while (true) {
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
    await sleep(Math.max(Math.round(time / Math.pow(2, count)), 2000))
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName(`${taskName}_getDirection`)}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    // const found = await findImageWithinTemplate(tempCapturePath, templateImagePath, 0.9)

    // if (found) {
    //   // await clickGamePoint('黄金罗盘', `${taskName}_success`)
    //   break
    // }
    const direction = await getDirection(tempCapturePath)
    if (!direction) {
      break
    }
    ;[leftTop, rightBottom, center] = calculatePositions(leftTop, rightBottom, center, direction, nearlyGoneTo)
    if (!nearlyGoneTo && center.join('') === leftTop.join('') && center.join('') === rightBottom.join('')) {
      nearlyGoneTo = true
    }
    count++
  }
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
    return ''
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
