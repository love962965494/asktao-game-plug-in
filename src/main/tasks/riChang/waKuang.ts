import { pythonImagesPath } from '../../../paths'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import { isInBattle_1 } from '../zhanDouTasks'
import path from 'path'
import { randomName, sleep } from '../../../utils/toolkits'
import { findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import robotUtils from '../../../utils/robot'
import { clickGamePoint } from '../../../utils/common'

export async function waKuang() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]

  const hasFinished = {} as { [key: string]: boolean }

  for (const gameWindow of gameWindows) {
    hasFinished[gameWindow.roleInfo.roleName] = false
  }

  while (true) {
    for (const gameWindow of gameWindows) {
      if (hasFinished[gameWindow.roleInfo.roleName]) {
        continue
      }
      await gameWindow.setForeground()
      const inBattle = await isInBattle_1(gameWindow)

      if (!inBattle) {
        await sleep(3000)
        const inBattle = await isInBattle_1(gameWindow)

        if (!inBattle) {
          robotUtils.keyTap('B', ['control'])
          await sleep(500)
          robotUtils.keyTap('W', ['alt'])
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/lianQiZhangLao.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/waKuang_${randomName()}.jpg`)
          await screenCaptureToFile(tempCapturePath)
          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          if (found) {
            hasFinished[gameWindow.roleInfo.roleName] = true
            continue
          }
          
          robotUtils.keyTap('B', ['control'])
          await sleep(500)
          robotUtils.keyTap('escape')
          await clickGamePoint('收藏任务_图标', 'waKuang', {
            callback: async () => {
              const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/ziDongRenWuPeiZhi.jpg')
              const tempCapturePath = path.join(pythonImagesPath, `temp/meiRiRiChang_DanRen_${randomName()}.jpg`)
              await screenCaptureToFile(tempCapturePath)

              const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)
              return found
            },
            randomPixNums: [5, 2],
          })
          await sleep(500)
          await clickGamePoint('收藏任务_单人', 'meiRiRiChang_DanRen', {
            tabOptions: {
              isTab: true,
              activeTabColor: '#785a00',
            },
          })
          await sleep(500)
          await clickGamePoint('收藏任务_一键自动', 'meiRiRiChang_ZuDui')
          await sleep(1000)
        }
      }
    }
  }
}