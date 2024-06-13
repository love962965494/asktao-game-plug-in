import { pythonImagesPath } from 'paths'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import path from 'path'
import { findTargetInVideo } from '../../../utils/fileOperations'
import robotUtils from '../../../utils/robot'
import { sleep } from '../../../utils/toolkits'
import { clipboard } from 'electron'

export async function huangJinLuoPan() {
  await getGameWindows()
  const gameWindow = GameWindowControl.getGameWindowByRoleName('Kanonの')!
  await gameWindow.setForeground()

  const { size } = global.appContext.cityMap['轩辕庙']
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/taskRelative/huangJinLuoPan_success.jpg')
  findTargetInVideo(templateImagePath, gameWindow.roleInfo.roleName)

  let leftTop = [0, 0]
  let rightBottom = [size[0], size[1]]
  const time = 60
  let count = 1
  while (!global.appContext.hasFoundTarget[gameWindow.roleInfo.roleName]) {
    const center = [Math.round((leftTop[0] + rightBottom[0]) / 2), Math.round((leftTop[1] + rightBottom[1]) / 2)]
    robotUtils.keyTap('B', ['control'])
    await sleep(300)
    robotUtils.keyTap('W', ['alt'])
    clipboard.writeText(`${center[0]}.${center[1]}`)
    robotUtils.keyTap('V', ['control'])
    robotUtils.keyTap('enter')
    await sleep(Math.round(time / Math.pow(2, count)))
    
  }
}
