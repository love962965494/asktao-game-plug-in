import { clipboard, screen } from 'electron'
import GameWindowControl from '../../utils/gameWindowControll'
import { getGameWindows } from '../../utils/systemCotroll'
import { randomName, sleep } from '../../utils/toolkits'
import robotUtils from '../../utils/robot'
import robotjs from 'robotjs'
import {
  clickButton,
  clickGamePoint,
  hasChecked,
  moveMouseTo,
  moveMouseToAndClick,
  moveMouseToAndClickUseColor,
  moveMouseToBlank,
} from '../../utils/common'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import {
  extractThemeColors,
  findImagePositionsWithErrorHandle,
  findImageWithinTemplate,
  findTargetInVideo,
  paddleOcr,
  screenCaptureToFile,
} from '../../utils/fileOperations'
import { ICityMap } from 'constants/types'
import commonConfig from '../../constants/config.json'

// 是否组队
export async function isGroupedTeam(gameWindow: GameWindowControl) {
  await gameWindow.setForeground()
  robotUtils.keyTap('B', ['control'])
  await sleep(200)
  robotUtils.keyTap('T', ['alt'])
  await moveMouseToBlank()
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/zuDuiPingTai.jpg')
  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('isGroupedTeam')}.jpg`)
  await screenCaptureToFile(tempCapturePath)

  const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

  robotUtils.keyTap('B', ['control'])

  return found
}

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

  await clickGamePoint('活动图标', 'yiJianZuDui', {
    callback: async () => {
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/huoDongZhongXin.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('yiJianZuDui1')}.jpg`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath, 0.8)

      if (found) {
        return true
      }

      robotUtils.keyTap('B', ['control'])
      return false
    },
  })
  await sleep(500)
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/yiJianZuDui.jpg')

  if (!zuDuiPosition) {
    await moveMouseToBlank()
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('yiJianZuDui2')}.jpg`)
    zuDuiPosition = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
  }
  await moveMouseToAndClick(
    templateImagePath,
    {
      buttonName: 'yiJianZuDui',
      position: zuDuiPosition,
      size: yiJianZuDuiSize,
    },
    {
      callback: async () => {
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('yiJianZuDui3')}.jpg`)
        await screenCaptureToFile(tempCapturePath, [870, 475], [100, 20])

        const colors = await extractThemeColors(tempCapturePath)

        if (colors.includes('#e6c8')) {
          return true
        }

        return false
      },
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

  await clickGamePoint('离队', 'liDui', {
    callback: async () => {
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/zuDuiPingTai.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('liDui')}.jpg`)
      await screenCaptureToFile(tempCapturePath)

      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      return !found
    },
  })
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

// 移动行走找到地图中目标
// 1920 * 1080分辨率
const oneScreenSize = [72, 30]
// function generateMapCoordinates(size: number[]) {
//   const [width, height] = size
//   let coordinates = []
//   let xStep = oneScreenSize[0]
//   let yStep = oneScreenSize[1]
//   let xSteps = Array.from(
//     { length: Math.floor(width / xStep) },
//     (_, index) => index * xStep + Math.floor(xStep / 2)
//   ).concat(width % xStep ? [Math.floor(width / xStep) * xStep + Math.floor((width % xStep) / 2)] : [])
//   let ySteps = Array.from(
//     { length: Math.floor(height / yStep) },
//     (_, index) => index * yStep + Math.floor(yStep / 2)
//   ).concat(height % yStep ? [Math.floor(height / yStep) * yStep + Math.floor((height % yStep) / 2)] : [])

//   let direction = true // true 向左，false 向右
//   while (ySteps.length > 0) {
//     // Along x-axis
//     const y = ySteps.shift()!

//     if (direction) {
//       for (let i = 0; i < xSteps.length; i++) {
//         coordinates.push({ x: xSteps[i], y })
//       }
//     } else {
//       for (let i = xSteps.length - 1; i >= 0; i--) {
//         coordinates.push({ x: xSteps[i], y })
//       }
//     }

//     direction = !direction
//   }

//   return coordinates
// }

function generateMapCoordinates(size: number[]) {
  const [width, height] = size
  const startX = oneScreenSize[0] / 2
  const endX = width - oneScreenSize[0] / 2
  const startY = oneScreenSize[1] / 2
  const endY = height - oneScreenSize[1] / 2
  const coordinates = [[startX, startY]]
  let totalCounts =
    Math.ceil((endY - startY) / oneScreenSize[1]) * 2 + ((endY - startY) % oneScreenSize[1] !== 0 ? 2 : 0)
  while (coordinates.length < totalCounts) {
    const [prevX, prevY] = coordinates[coordinates.length - 1]
    let nextX: number
    let nextY: number
    if (coordinates.length % 2 === 0) {
      // 偶数个点，则y轴偏移一格
      nextX = prevX
      nextY = Math.min(prevY + oneScreenSize[1], endY)
    } else {
      // 奇数个点，则x轴偏移一格
      nextX = prevX === startX ? endX : startX
      nextY = prevY
    }
    coordinates.push([nextX, nextY])
  }

  return coordinates
}

export async function getCurrentGamePosition() {
  await sleep(1000)
  robotUtils.keyTap('B', ['control'])
  await sleep(100)
  robotUtils.keyTap('G', ['alt'])
  await sleep(100)
  await clickGamePoint('特八-保存', 'getCurrentGamePosition', {
    callback: async () => {
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/teBaBaoCun.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('getCurrentGamePosition1')}.jpg`)
      await screenCaptureToFile(tempCapturePath)

      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      return found
    },
  })

  const { position, size } = global.appContext.gamePoints['特八-保存坐标']
  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('getCurrentGamePosition2')}.jpg`)
  await screenCaptureToFile(tempCapturePath, position, size)
  const result = await paddleOcr(tempCapturePath)
  const currentPosition = result[1].replaceAll(/[^\d]/g, ' ').split(' ').filter(Boolean)

  await moveMouseToBlank()
  await sleep(200)
  robotUtils.mouseClick('right')
  await sleep(100)
  robotUtils.keyTap('B', ['control'])

  return currentPosition
}
export async function hasGoneToPosition() {
  const { position, size } = global.appContext.gamePoints['地图坐标']
  let color = ''
  while (!color.includes('#8282ff')) {
    robotjs.moveMouse(96, 29)
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('findTargetAndExtractThemeColor')}`)
    await screenCaptureToFile(tempCapturePath, position, size)
    color = await extractThemeColors(tempCapturePath)
    await sleep(500)
  }
}
export async function findTargetInMap(gameWindow: GameWindowControl, mapName: keyof ICityMap, loop = false) {
  await gameWindow.setForeground()
  gameWindow.setPosition(0, 0)
  const { size } = global.appContext.cityMap[mapName]
  const positions = generateMapCoordinates(size)
  let index = 0
  return async (targetName: string, roleAccount: string) => {
    const templateImagePath = path.join(pythonImagesPath, `GUIElements/npcRelative/${targetName}.jpg`)
    const roleNamePath = path.join(pythonImagesPath, `GUIElements/npcRelative/${roleAccount}.jpg`)

    await gameWindow.setForeground()

    findTargetInVideo(templateImagePath, roleAccount)

    // 1 正方向  -1 反方向
    let direction = 1
    let hasFound = false
    let targetPosition: number[] = []
    let rolePosition: number[] = []
    while (!hasFound) {
      const promise1 = new Promise<number>((resolve) => {
        async function _inner() {
          const position = positions[index]
          robotUtils.keyTap('B', ['control'])
          await sleep(100)
          robotUtils.keyTap('W', ['alt'])
          clipboard.writeText(`${position[0]}.${position[1]}`)
          robotUtils.keyTap('V', ['control'])
          robotUtils.keyTap('enter')
          await sleep(commonConfig.moveUseTime * 1000)
          if (direction === 1) {
            index++
          } else {
            index--
          }
          if (loop) {
            if (index < 0 || index > positions.length - 1) {
              direction = direction === 1 ? -1 : 1
              index = index + 2 * direction
            }
          } else {
            if (index > positions.length - 1) {
              index = 0
            }
          }

          resolve(1)
        }

        setTimeout(() => _inner(), 10)
      })
      const promise2 = new Promise<number>((resolve) => {
        function _loop() {
          let timeout = setTimeout(() => {
            if (global.appContext.hasFoundTarget[roleAccount]) {
              global.appContext.hasFoundTarget[roleAccount] = false
              clearTimeout(timeout)
              resolve(2)
            }

            _loop()
          }, 10)
        }

        _loop()
      })

      const result = await Promise.race([promise1, promise2])

      if (result === 2) {
        robotUtils.keyTap('X', ['alt'])
        await sleep(1000)
        robotUtils.mouseClick('right')
        await sleep(1000)
        await moveMouseToBlank()
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('findTargetInMap')}.jpg`)
        targetPosition = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
        rolePosition = await findImagePositionsWithErrorHandle(tempCapturePath, roleNamePath)
        let distance = Math.sqrt(
          Math.pow(targetPosition[0] - rolePosition[0], 2) + Math.pow(targetPosition[1] - rolePosition[1], 2)
        )

        while (distance > 400) {
          const x = Math.round((targetPosition[0] + rolePosition[0]) / 2)
          const y = Math.round((targetPosition[1] + rolePosition[1]) / 2)
          robotjs.moveMouse(x, y)
          robotjs.mouseClick('left')
          await sleep(2000)
          const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('yuWaiFengYun')}.jpg`)
          targetPosition = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
          rolePosition = await findImagePositionsWithErrorHandle(tempCapturePath, roleNamePath)
          distance = Math.sqrt(
            Math.pow(targetPosition[0] - rolePosition[0], 2) + Math.pow(targetPosition[1] - rolePosition[1], 2)
          )
        }
        hasFound = true
      }
    }

    return targetPosition
  }
}
