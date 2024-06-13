import { getGameWindows } from '../../../utils/systemCotroll'
import { clickGamePoint, readLog, writeLog } from '../../../utils/common'
import GameWindowControl from '../../../utils/gameWindowControll'
import path from 'path'
import { pythonImagesPath, staticPath } from '../../../paths'
import { randomName, sleep } from '../../../utils/toolkits'
import robotUtils from '../../../utils/robot'
import { findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import playSound from 'play-sound'
import { dialog } from 'electron'
import { displayGameWindows } from '../basicTasks'

export async function xunHuanShiChen(isOpenShiChen: boolean, needQuery = false) {
  let timeout
  if (isOpenShiChen) {
    async function _execute() {
      let { today, hours = [] } = JSON.parse(await readLog('时辰')) as { today: number; hours: number[] }

      const hasExecuted = await hasExecutedShiChen(today, hours)
      if (hasExecuted) {
        return
      }

      if (needQuery) {
        const { response } = await dialog.showMessageBox({
          type: 'info',
          buttons: ['开始', ' 关闭'],
          message: '是否开始时辰运势？',
        })

        if (response !== 0) {
          return
        }
      }

      await shiChen()
      const date = new Date()
      await writeLog(
        '时辰',
        JSON.stringify({ today: date.getDate(), hours: [...hours, date.getHours()] }, undefined, 4),
        true
      )
    }

    async function _loop() {
      await _execute()
      timeout = setTimeout(() => {
        _loop()
      }, 5 * 60 * 1000)
    }

    _loop()
  } else {
    clearTimeout(timeout)
  }
}

export async function hasExecutedShiChen(today: number, executedHours: number[]) {
  const date = new Date()

  if (today !== date.getDate()) {
    return false
  }

  if (!executedHours.includes(date.getHours())) {
    return false
  }

  return true
}

export async function shiChen() {
  await getGameWindows()
  const gameWindows = [...(await GameWindowControl.getAllGameWindows().values())]

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
      },
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
    robotUtils.keyTap('B', ['control'])
  }

  await displayGameWindows()
}

async function hasUsefulShiChen() {
  const filePath = path.join(pythonImagesPath, `temp/${randomName('LaoJun')}.jpg`)
  await screenCaptureToFile(filePath)
  const chaoJiBaoZang = path.join(pythonImagesPath, '/GUIElements/shiChenRelative/chaoJiBaoZang.jpg')
  const xiangXing = path.join(pythonImagesPath, '/GUIElements/shiChenRelative/xiangXing.jpg')
  const laoJunMp3 = path.join(staticPath, '/happyNewYear.mp3')

  return Promise.all([
    findImageWithinTemplate(filePath, chaoJiBaoZang, 0.7),
    findImageWithinTemplate(filePath, xiangXing, 0.7),
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
