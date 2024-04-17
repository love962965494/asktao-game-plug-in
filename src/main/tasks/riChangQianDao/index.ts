import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank } from "../../../utils/common"
import { pythonImagesPath } from "../../../paths"
import GameWindowControl from "../../../utils/gameWindowControll"
import { getGameWindows } from "../../../utils/systemCotroll"
import path from 'path'
import { randomName, sleep } from "../../../utils/toolkits"
import { ipcMain, screen } from 'electron'
import robotUtils from "../../../utils/robot"
import { findImagePositions, screenCaptureToFile } from "../../../utils/fileOperations"

export async function registerYiJianQianDao() {
  ipcMain.on('yi-jian-qian-dao', async () => yiJianQianDao())
}

// 一键领取每天的日常签到
export async function yiJianQianDao() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/fuLi.jpg')
  await moveMouseToBlank()
  const tempCapturePath = path.join(pythonImagesPath, `temp/riChangQianDao_${randomName()}.jpg`)
  let position: number[] | undefined = undefined
  const { size: { width, height } } = screen.getPrimaryDisplay()
  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    robotUtils.keyTap('B', ['control'])
    await sleep(500)
    await clickGamePoint('活动图标', 'riChangQianDao', { threshold: 30 })
    await sleep(500)
    if (!position) {
      await screenCaptureToFile(tempCapturePath, [0, 0], [width, height])
      position = await findImagePositions(tempCapturePath, templateImagePath)
    }
    await moveMouseToAndClick(templateImagePath, {
      buttonName: 'riChangQianDao_fuLi',
      position,
      size: [40, 30],
    }, {
      threshold: 30
    })
    await sleep(500)
    await clickGamePoint('每日必领_一键领取', 'meiRiBiLing_YiJianLingQu', {
      callback: () => undefined
    })
    await sleep(500)
    robotUtils.keyTap('B', ['control'])
  }
}
