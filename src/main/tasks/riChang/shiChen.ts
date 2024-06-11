import { getGameWindows } from "../../../utils/systemCotroll";
import { clickGamePoint, readLog, writeLog } from "../../../utils/common"
import GameWindowControl from "../../../utils/gameWindowControll";
import path from 'path'
import { pythonImagesPath, staticPath } from "../../../paths";
import { randomName, sleep } from "../../../utils/toolkits";
import robotUtils from "../../../utils/robot";
import { findImageWithinTemplate, screenCaptureToFile } from "../../../utils/fileOperations";
import playSound from 'play-sound'
import { dialog } from 'electron'

export async function shiChen() {
  const { today, hours } = JSON.parse(await readLog('时辰')) as { today: number; hours: number[] }
  const date = new Date()

  if (today !== date.getDay()) {
    await writeLog('时辰', JSON.stringify({ today: date.getDay(), hours: [] }, undefined, 4), true)
  }

  if (!hours.includes(date.getHours())) {
    await getGameWindows()
    const gameWindows = [...await GameWindowControl.getAllGameWindows().values()]

    for (const gameWindow of gameWindows) {
      await gameWindow.setForeground()
      robotUtils.keyTap('B', ['control'])
      await sleep(300)
      robotUtils.keyTap('escape')
      await sleep(300)
      await clickGamePoint('时辰', 'shiChenButton', {
        callback: async () => {
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/shiChenYunShi.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('shiChenButton')}.jpg`)
          await screenCaptureToFile(tempCapturePath)
          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          return found
        }
      })

      {
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/gaiYun.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('shiChenGaiYun')}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        if (found) {
          continue
        }
      }

      await clickGamePoint('时辰_求签', 'shiChenQiuQian')
    }

    for (const gameWindow of gameWindows) {
      await gameWindow.setForeground()
      await hasUsefulShiChen()
    }
  }
}

async function hasUsefulShiChen() {
  const filePath = path.join(pythonImagesPath, `temp/${randomName('LaoJun')}.jpg`)
  await screenCaptureToFile(filePath)
  const chaoJiBaoZang = path.join(pythonImagesPath, '/GUIElements/shiChenRelative/chaoJiBaoZang.jpg')
  // const xuanZe = path.join(pythonImagesPath, '/GUIElements/laoJunRelative/xuanZe.jpg')
  // const zhuanQuan = path.join(pythonImagesPath, '/GUIElements/laoJunRelative/zhuanQUan.jpg')
  const laoJunMp3 = path.join(staticPath, '/laojun.mp3')

  return Promise.all([
    findImageWithinTemplate(filePath, chaoJiBaoZang, 0.7),
    // findImageWithinTemplate(filePath, xuanZe, 0.7),
    // findImageWithinTemplate(filePath, zhuanQuan, 0.7),
  ]).then(async (results) => {
    if (results.filter(Boolean).length > 0) {
      playSound().play(laoJunMp3)
      await waitShiChenSelect()
      return true
    }

    return false
  })
}

async function waitShiChenSelect() {
  await dialog.showMessageBox({
    type: 'info',
    buttons: ['时辰选择完毕'],
    message: '好运气啊，快来选择时辰吧！',
  })
}