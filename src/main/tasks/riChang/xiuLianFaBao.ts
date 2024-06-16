import robotUtils from '../../../utils/robot'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import { randomName, sleep } from '../../../utils/toolkits'
import { goToNPCAndTalk, talkToNPC } from '../npcTasks'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import { findImagePositionsWithErrorHandle, findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank } from '../../../utils/common'
import { searchGameTask } from '../gameTask'
import { waitFinishZhanDou_1 } from '../zhanDouTasks'

export async function xiuLianFaBao() {
  await getGameWindows()
  const allGameWindows = [...(await GameWindowControl.getAllGameWindows().values())]
  const teamLeaderWindows = []

  for (const gameWindow of allGameWindows) {
    if (gameWindow.roleInfo.defaultTeamLeader) {
      teamLeaderWindows.push(gameWindow)
    }
  }

  for (const teamLeaderWindow of teamLeaderWindows) {
    await lingQuRenWu(teamLeaderWindow)
  }
}

async function lingQuRenWu(gameWindow: GameWindowControl) {
  const { pinYin } = global.appContext.gameTask['修炼法宝']
  await gameWindow.setForeground()

  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  robotUtils.keyTap('f1')
  await sleep(1000)
  await goToNPCAndTalk({
    npcName: 'jieYinDaoTong',
    gameWindow,
    conversition: 'woYaoHuiTianYongChengBanXieShi',
  })
  await sleep(1000)
  await goToNPCAndTalk({
    city: '天墉城',
    npcName: 'xiaoYaoXian',
    gameWindow,
    conversition: 'woDuiFaBaoYouXieXingQu',
    calculatePosition: async () => {
      await moveMouseToBlank()
      const templateImagePath = path.join(pythonImagesPath, `GUIElements/taskRelative/${pinYin}.jpg`)
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName(pinYin)}.jpg`)
      const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)

      return position
    }
  })
  let index = 0
  while (index < 3) {
    await moveMouseToAndClick('', {
      buttonName: '',
      position: [590, 440],
      size: [260, 40]
    }, {
      notCheck: true
    })
    index++
  }
  await talkToNPC('天墉城', 'xiaoYaoXian', 'woXiangQuDeFaBaoXiangZhu,qingQianBeiZhiDian')
  await sleep(500)
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  robotUtils.keyTap('B', ['control'])
  await sleep(500)

  // 找龙王
  await searchGameTask(pinYin)
  robotUtils.keyToggle('control', 'down')
  await sleep(100)
  await clickGamePoint('修炼法宝-龙王', `${pinYin}_longWang`)
  await sleep(100)
  robotUtils.keyToggle('control', 'up')
  await sleep(100)

  // 开始战斗
  await sleep(5000)
  await talkToNPC('海底迷宫', 'longWang', 'woYiZhunBeiHaoJieShouKaoYan,qingCiJiaoBa')
  await waitFinishZhanDou_1(gameWindow)

  // 找多宝道人
  await searchGameTask(pinYin)
  robotUtils.keyToggle('control', 'down')
  await sleep(100)
  await clickGamePoint('修炼法宝-多宝道人', `${pinYin}_duoBaoDaoRen`)
  await sleep(100)
  robotUtils.keyToggle('control', 'up')
  await sleep(100)
}

async function gouMaiWuPin(gameWindow: GameWindowControl) {
  await gameWindow.setForeground()
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  await clickGamePoint('互动图标', 'huDongTuBiao', {
    callback: async () => {
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/huDongZhongXin.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('huDongZhongXin')}`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      return found
    }
  })
  await sleep(500)
  await clickGamePoint('互动中心-摆摊购买平台', 'baiTanGouMaiPingTai', {
    callback: async () => {
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/baiTaiGouMaiPingTai.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('baiTaiGouMaiPingTai')}`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      return found
    }
  })
  await sleep(500)
}