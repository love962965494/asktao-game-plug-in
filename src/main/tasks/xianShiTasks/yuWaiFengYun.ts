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
import { findImagePositions, screenCaptureToFile } from '../../../utils/fileOperations'

export default async function yuWaiFengYun() {
  await getGameWindows()
  const allGameWindows = [...(await GameWindowControl.getAllGameWindows().values())]
  const teamLeaderWindows = []

  for (const gameWindow of allGameWindows) {
    if (gameWindow.roleInfo.defaultTeamLeader) {
      teamLeaderWindows.push(gameWindow)
    }
  }

  const findTargets: Function[] = []
  for (const teamLeaderWindow of teamLeaderWindows) {
    await teamLeaderWindow.setForeground()
    teamLeaderWindow.restoreGameWindow()
    const findTarget = await findTargetInMap(teamLeaderWindow, '天墟境', true)
    findTargets.push(findTarget)
  }

  while (true) {
    for (let i = 0; i < teamLeaderWindows.length; i++) {
      const teamLeaderWindow = teamLeaderWindows[i]
      await teamLeaderWindow.setForeground()
      const findTarget = findTargets[i]
      let position = await findTarget('chiXueYanJin')
      const distance = Math.sqrt(Math.pow(position[0] - 960, 2) + Math.pow(position[1] - 540, 2))
      if (distance > 400) {
        const x = Math.round((position[0] + 960) / 2)
        const y = Math.round((position[1] + 540) / 2)
        robotjs.moveMouse(x, y)
        robotjs.mouseClick('left')
        await sleep(1000)
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/npcRelative/chiXueYanJin.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('yuWaiFengYun')}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        position = await findImagePositions(tempCapturePath, templateImagePath)
      }

      if (position.length === 2) {
        robotUtils.keyToggle('shift', 'down')
        await moveMouseToAndClick(
          '',
          {
            buttonName: '',
            position: [position[0], position[1] - 100],
            size: [60, 100],
          },
          {
            callback: async () => {
              return true
              // const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/dialogLine.jpg')
              // const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('findTarget')}.jpg`)
              // await screenCaptureToFile(tempCapturePath)
              // const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

              // return found
            },
          }
        )
        robotUtils.keyToggle('shift', 'up')
      }
    }

    for (let i = 0; i < teamLeaderWindows.length; i++) {
      const teamLeaderWindow = teamLeaderWindows[i]
      await teamLeaderWindow.setForeground()
      await sleep(3 * 1000)
      const isInBattle = await isInBattleOfSmallScreen(teamLeaderWindow)

      if (isInBattle) {
        await waitFinishZhanDouOfSmallScreen(teamLeaderWindow)
      }
    }
  }
}
