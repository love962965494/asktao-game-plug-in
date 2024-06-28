import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import { findTargetInMap } from '../basicTasks'
import robotjs from 'robotjs'
import { randomName, sleep } from '../../../utils/toolkits'
import robotUtils from '../../../utils/robot'
import { clickGamePoint, moveMouseToAndClick } from '../../../utils/common'
import { isInBattleOfSmallScreen, waitFinishZhanDouOfSmallScreen } from '../zhanDouTasks'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import {
  findImagePositionsWithErrorHandle,
  findImageWithinTemplate,
  screenCaptureToFile,
} from '../../../utils/fileOperations'
import commonConfig from '../../../constants/config.json'

export default async function tianXuMiFu() {
  const { targetSize } = global.appContext.cityMap['天墟秘府']
  await getGameWindows()
  const allGameWindows = [...(await GameWindowControl.getAllGameWindows().values())]
  const teamLeaderWindows: GameWindowControl[] = []

  for (const gameWindow of allGameWindows) {
    if (gameWindow.roleInfo.defaultTeamLeader) {
      teamLeaderWindows.push(gameWindow)
    }
  }

  const findTargets: ((targetName: string, roleAccount: string) => Promise<number[]>)[] = []
  for (const teamLeaderWindow of teamLeaderWindows) {
    await teamLeaderWindow.setForeground()
    teamLeaderWindow.restoreGameWindow()
    const findTarget = await findTargetInMap(teamLeaderWindow, '天墟秘府', true, teamLeaderWindow.roleInfo.teamIndex)
    findTargets.push(findTarget)
  }

  async function _execute() {
    for (let i = 0; i < teamLeaderWindows.length; i++) {
      const teamLeaderWindow = teamLeaderWindows[i]
      await teamLeaderWindow.setForeground()
      const findTarget = findTargets[i]
      let position = await findTarget('yanJinCu', teamLeaderWindow.roleInfo.account)

      if (position.length === 2) {
        robotUtils.keyToggle('shift', 'down')
        await moveMouseToAndClick(
          '',
          {
            buttonName: '',
            position: [position[0], position[1] - targetSize[1]],
            size: targetSize,
          },
          {
            callback: async () => {
              const templateImagePath = path.join(pythonImagesPath, 'GUIElements/npcRelative/tianXuMiFu.jpg')
              const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('tianXuMiFu')}.jpg`)
              await screenCaptureToFile(tempCapturePath)
              const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

              return found
            },
          }
        )
        robotUtils.keyToggle('shift', 'up')

        await clickGamePoint(`域外_${commonConfig.yuWaiDiffcultLevel}`, 'yuwaiNanDu')
      }
    }

    for (let i = 0; i < teamLeaderWindows.length; i++) {
      const teamLeaderWindow = teamLeaderWindows[i]
      await teamLeaderWindow.setForeground()
      await sleep(3 * 1000)
    }

    for (let i = 0; i < teamLeaderWindows.length; i++) {
      const teamLeaderWindow = teamLeaderWindows[i]
      await teamLeaderWindow.setForeground()
      let isInBattle = await isInBattleOfSmallScreen(teamLeaderWindow)

      while (isInBattle) {
        await sleep(3000)
        for (const gameWindow of allGameWindows) {
          await gameWindow.setForeground()
          robotUtils.keyTap('2', ['control'])
        }
        isInBattle = await isInBattleOfSmallScreen(teamLeaderWindow)
      }
    }
  }

  function _loop() {
    setTimeout(async () => {
      await _execute()
      _loop()
    }, 1000)
  }

  _loop()
}

function getDirection(position: number[]) {
  const [x, y] = position

  if (x <= 960) {
    if (y <= 540) {
      return 'leftTop'
    } else {
      return 'leftBottom'
    }
  } else {
    if (y <= 540) {
      return 'rightTop'
    } else {
      return 'rightBottom'
    }
  }
}
