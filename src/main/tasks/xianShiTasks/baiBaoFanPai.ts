import { clickGamePoint } from '../../../utils/common'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import { randomName, sleep } from '../../../utils/toolkits'
import robotUtils from '../../../utils/robot'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import { findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'

// 需要所有游戏页面都先把百宝翻牌页面打开
export async function baiBaoFanPai() {
  await getGameWindows()
  const gameWindows = await [...GameWindowControl.getAllGameWindows().values()]
  let index = 0

  while (index < 21) {
    for (const gameWindow of gameWindows) {
      await gameWindow.setForeground()
      await clickGamePoint('百宝翻牌-他人分享', 'baiBaoFanPai', {
        tabOptions: {
          isTab: true,
          activeTabColor: '#d24646',
        },
      })
      await sleep(200)
      await clickGamePoint('百宝翻牌-采用', 'baiBaoFanPai')
      await sleep(200)
      robotUtils.keyTap('enter')
    }

    await sleep(60 * 1000)

    for (const gameWindow of gameWindows) {
      await gameWindow.setForeground()
      await clickGamePoint('百宝翻牌-分享得积分', 'baiBaoFanPai', {
        callback: async () => {
          const tempCapturePath = path.join(pythonImagesPath, `temp/baiBaoFanPai_${randomName()}.jpg`)
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/baiBaoFanPai.jpg')
          await screenCaptureToFile(tempCapturePath)

          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          return found
        },
      })
      await sleep(200)
      robotUtils.keyTap('enter')
    }
    index++
  }
}
