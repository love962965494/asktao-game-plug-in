import { MyPromise } from '../../utils/customizePromise'
import { pythonImagesPath, staticPath } from '../../paths'
import GameWindowControl from '../../utils/gameWindowControll'
import path from 'path'
import { randomName, sleep } from '../../utils/toolkits'
import { findImageWithinTemplate, paddleOcr, screenCaptureToFile } from '../../utils/fileOperations'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank } from '../../utils/common'
import { getGameWindows } from '../../utils/systemCotroll'
import { dialog } from 'electron'
import playSound from 'play-sound'
import robotUtils from '../../utils/robot'
import { displayGameWindows } from './basicTasks'

// 判断是否还在战斗中
export async function isInBattle(gameWindow: GameWindowControl) {
  await gameWindow.setForeground()
  const { position, size } = global.appContext.gamePoints['战斗-检测是否还在战斗']
  const templateImagePath = path.join(pythonImagesPath, `GUIElements/common/isInBattle.jpg`)
  const tempCapturePath = path.join(pythonImagesPath, `temp/isInBattle_${randomName()}.jpg`)
  await screenCaptureToFile(tempCapturePath, position, size)
  const inBattle = await findImageWithinTemplate(tempCapturePath, templateImagePath)

  return inBattle
}

export async function waitFinishZhanDou(gameWindow: GameWindowControl, time = 3): Promise<void> {
  return MyPromise(async (resolve) => {
    const inBattle = await isInBattle(gameWindow)

    if (!inBattle) {
      resolve()
      return
    }
    const interval = setInterval(async () => {
      const inBattle = await isInBattle(gameWindow)

      if (!inBattle) {
        clearInterval(interval)
        resolve()
      }
    }, time * 1000)
  })
}

// 补充角色和宝宝状态
export async function buChongZhuangTai(
  options: { needJueSe?: boolean; needZhongCheng?: boolean } = { needJueSe: false, needZhongCheng: false }
) {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]

  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    // TODO: 宝宝忠诚度补充
    await clickGamePoint('宝宝图像', 'buChongZhuangTai', { rightClick: true, notCheck: true })
    await sleep(200)
    if (options.needJueSe) {
      await clickGamePoint('角色图像', 'buChongZhuangTai', { rightClick: true, notCheck: true })
      await sleep(200)
    }

    if (options.needZhongCheng) {
      await moveMouseToBlank()
      robotUtils.keyTap('R', 'alt')
      await sleep(500)
      await clickGamePoint('驯养', 'buChongZhuangTai', { notCheck: true })
      await sleep(500)
      robotUtils.keyTap('R', 'alt')
    }
  }
}

// 判断是否遇到老君
export async function hasMeetLaoJun(gameWindow: GameWindowControl) {
  await gameWindow.setForeground()
  const filePath = path.join(pythonImagesPath, `temp/LaoJun_${randomName()}.jpg`)
  await screenCaptureToFile(filePath)
  const pinTu = path.join(pythonImagesPath, '/GUIElements/laoJunRelative/pinTu.jpg')
  const xuanZe = path.join(pythonImagesPath, '/GUIElements/laoJunRelative/xuanZe.jpg')
  const zhuanQuan = path.join(pythonImagesPath, '/GUIElements/laoJunRelative/zhuanQUan.jpg')
  const laoJunMp3 = path.join(staticPath, '/laojun.mp3')

  return Promise.all([
    findImageWithinTemplate(filePath, pinTu, 0.7),
    findImageWithinTemplate(filePath, xuanZe, 0.7),
    findImageWithinTemplate(filePath, zhuanQuan, 0.7),
  ]).then(async (results) => {
    if (results.filter(Boolean).length > 0) {
      playSound().play(laoJunMp3)
      await displayGameWindows()
      await waitLaoJunDaTi()
      return true
    }

    return false
  })
}

// 等待老君答题完毕
export async function waitLaoJunDaTi() {
  await dialog.showMessageBox({
    type: 'info',
    buttons: ['答题完毕'],
    message: '遇到老君了，快来答题！',
  })

  await getGameWindows()
}

// 点击继续补充自动战斗
export async function keepZiDong() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/ziDongZhanDou.jpg')
  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    robotUtils.keyTap('B', ['control'])
    const position = await gameWindow.getZiDongZhanDouPosition()

    await moveMouseToAndClick(templateImagePath, {
      buttonName: 'ziDongZhanDou',
      position,
      size: [46, 34],
    })
    robotUtils.keyTap('2', ['control'])
    await sleep(200)
  }
}
