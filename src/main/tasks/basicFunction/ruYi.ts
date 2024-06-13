import { randomName, sleep } from "../../../utils/toolkits"
import robotUtils from "../../../utils/robot"
import { clickGamePoint, hasChecked } from "../../../utils/common"
import path from 'path'
import { pythonImagesPath } from "../../../paths"
import { findImageWithinTemplate, screenCaptureToFile } from "../../../utils/fileOperations"
import { getGameWindows } from "../../../utils/systemCotroll"
import GameWindowControl from "../../../utils/gameWindowControll"

const ruYiKaiQiGuanBiItems = ['领取-三倍点数', '领取-如意点数', '领取-紫气点数', '领取-宠物三倍']
export async function ruYiKaiQiGuanBi(kaiQi: boolean) {
  await getGameWindows()
  const gameWindows = [...await GameWindowControl.getAllGameWindows().values()]

  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    await kaiQiGuanBi(kaiQi)
  }
}

export async function kaiQiGuanBi(kaiQi: boolean) {
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  await clickGamePoint('领取图标', 'ruYiKaiQiGuanBi', {
    callback: async () => {
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/xiaoLvDianShu.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('xiaoLvDianShu')}`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      return found
    },
  })

  if (kaiQi) {
    for (const item of ruYiKaiQiGuanBiItems) {
      const checked = await hasChecked(item)

      if (!checked) {
        await clickGamePoint(item, 'kaiQiRuYiDianShu', {
          randomPixNums: [5, 2],
        })
      }
    }
  } else {
    for (const item of ruYiKaiQiGuanBiItems) {
      const checked = await hasChecked(item)

      if (checked) {
        await clickGamePoint(item, 'kaiQiRuYiDianShu', {
          randomPixNums: [5, 2],
        })
      }
    }
  }
}
