import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import { findTargetInMap } from '../basicTasks'
import robotjs from 'robotjs'
import { randomName, sleep } from '../../../utils/toolkits'
import robotUtils from '../../../utils/robot'
import { moveMouseToAndClick } from '../../../utils/common'
import { isInBattleOfSmallScreen, waitFinishZhanDouOfSmallScreen } from '../zhanDouTasks'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import { findImagePositionsWithErrorHandle } from '../../../utils/fileOperations'

export default async function yuWaiFengYun() {
  const { targetSize } = global.appContext.cityMap['天墟境']
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
    const findTarget = await findTargetInMap(teamLeaderWindow, '天墟境', true)
    findTargets.push(findTarget)
  }

  async function _execute() {
    for (let i = 0; i < teamLeaderWindows.length; i++) {
      const teamLeaderWindow = teamLeaderWindows[i]
      await teamLeaderWindow.setForeground()
      const findTarget = findTargets[i]
      let position = await findTarget('chiXueYanJin', teamLeaderWindow.roleInfo.account)

      if (position.length === 2) {
        robotUtils.keyToggle('shift', 'down')
        await sleep(500)
        await moveMouseToAndClick(
          '',
          {
            buttonName: '',
            position: [position[0], position[1] - targetSize[1]],
            size: targetSize,
          },
          {
            callback: async () => {
              return true
            },
          }
        )
        await sleep(500)
        robotUtils.keyToggle('shift', 'up')
        await sleep(500)
      }
    }

    for (let i = 0; i < teamLeaderWindows.length; i++) {
      const teamLeaderWindow = teamLeaderWindows[i]
      await teamLeaderWindow.setForeground()
      await sleep(3 * 1000)
      const isInBattle = await isInBattleOfSmallScreen(teamLeaderWindow)

      if (isInBattle) {
        await waitFinishZhanDouOfSmallScreen(teamLeaderWindow)
        robotUtils.keyTap('B', ['control'])
      }
    }
  }

  async function _loop() {
    await _execute()
    await sleep(1000)
    _loop()
  }

  _loop()
}
