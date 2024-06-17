import robotUtils from '../../../utils/robot'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import { randomName, sleep } from '../../../utils/toolkits'
import { goToNPCAndTalk, talkToNPC } from '../npcTasks'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import {
  findImagePositions,
  findImagePositionsWithErrorHandle,
  screenCaptureToFile,
} from '../../../utils/fileOperations'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank } from '../../../utils/common'
import { searchGameTask } from '../gameTask'
import { waitFinishZhanDou_1 } from '../zhanDouTasks'
import { gouMaiPingTai } from '../basicFunction/gouMaiPingTai'
import { liDui, yiJianZuDui } from '../basicTasks'
import { useWuPin } from '../wuPinTask'

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

  for (const gameWindow of allGameWindows) {
    await gameWindow.setForeground()
    let index = 0
    while (index < 10) {
      robotUtils.keyTap('B', ['control'])
      await sleep(100)
      index++
    }
  }

  for (const teamLeaderWindow of teamLeaderWindows) {
    await teamLeaderWindow.setForeground()
    await liDui()
  }

  // 多宝道人=》 购买血魂丝涟和蟠螭结
  for (const gameWindow of allGameWindows) {
    await gouMaiWuPin(gameWindow)
  }

  for (const gameWindow of allGameWindows) {
    await gameWindow.setForeground()
    await goToNPCAndTalk({
      city: '蓬莱岛',
      npcName: 'duoBaoDaoRen',
      calculatePosition: async () => {
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/taskRelative/dongXiZhaoLaiLeMa.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('dongXiZhaoLaiLeMa')}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        const position = await findImagePositions(tempCapturePath, templateImagePath)

        return position
      },
      gameWindow,
      conversition: 'dongXiZhaoLaiLeMa',
    })
    await sleep(500)
    await talkToNPC('蓬莱岛', 'duoBaoDaoRen', 'dongXiGeiNi,gaoSuWoFangFaBa')
    await sleep(500)
    await useWuPin('panChiJie')
    await useWuPin('xueHunSiLian')
    await clickGamePoint('修炼法宝-多宝道人-提交', 'duoBaoDaoRen_tiJiao')

    let index = 0
    while (index < 10) {
      robotUtils.keyTap('B', ['control'])
      await sleep(100)
      index++
    }
  }

  for (const teamLeaderWindow of teamLeaderWindows) {
    await teamLeaderWindow.setForeground()
    await yiJianZuDui(teamLeaderWindow.roleInfo.roleName)
  }

  // 小花仙
  const { pinYin } = global.appContext.gameTask['修炼法宝']
  for (const teamLeaderWindow of teamLeaderWindows) {
    await teamLeaderWindow.setForeground()
    await searchGameTask(pinYin)
    robotUtils.keyToggle('control', 'down')
    await sleep(100)
    await clickGamePoint('修炼法宝-小花仙', `${pinYin}_xiaoHuaXian`)
    await sleep(100)
    robotUtils.keyToggle('control', 'up')
    await sleep(100)

    let index = 0
    while (index < 5) {
      robotUtils.keyTap('B', ['control'])
      await sleep(100)
      index++
    }
  }

  // 四神兽
  const siShenShou = [
    ['卧龙坡', 'xuanWu'],
    ['十里坡', 'baiHu'],
    ['五龙山', 'qingLong'],
    ['风月谷', 'zhuQue'],
  ]
  for (const [place, shenShou] of siShenShou) {
    for (const teamLeaderWindow of teamLeaderWindows) {
      await teamLeaderWindow.setForeground()
      await searchGameTask(pinYin)
      robotUtils.keyToggle('control', 'down')
      await sleep(100)
      await clickGamePoint('修炼法宝-四神兽', `${pinYin}_siShenShou`)
      await sleep(100)
      robotUtils.keyToggle('control', 'up')
      await sleep(100)

      let index = 0
      while (index < 5) {
        robotUtils.keyTap('B', ['control'])
        await sleep(100)
        index++
      }

      // 开始战斗
      await talkToNPC(place, shenShou, 'woZhunBeiHaoLe,qingCiJiaoBa')
      await waitFinishZhanDou_1(teamLeaderWindow)
    }
  }

  // 回龙宫，找龙王
  for (const teamLeaderWindow of teamLeaderWindows) {
    await teamLeaderWindow.setForeground()
    await searchGameTask(pinYin)
    robotUtils.keyToggle('control', 'down')
    await sleep(100)
    await clickGamePoint('修炼法宝-龙王', `${pinYin}_longWang`)
    await sleep(100)
    robotUtils.keyToggle('control', 'up')
    await sleep(100)

    {
      let index = 0
      while (index < 5) {
        robotUtils.keyTap('B', ['control'])
        await sleep(100)
        index++
      }
    }

    // 开始战斗
    await talkToNPC('海底迷宫', 'longWang', 'woXianZaiJiuBaSiLingZhiQiZhuRuBaoWu')

    {
      let index = 0
      while (index < 5) {
        robotUtils.keyTap('B', ['control'])
        await sleep(100)
        index++
      }
    }

    await waitFinishZhanDou_1(teamLeaderWindow)
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
    },
  })
  {
    let index = 0
    while (index < 3) {
      await moveMouseToAndClick(
        '',
        {
          buttonName: '',
          position: [590, 440],
          size: [260, 40],
        },
        {
          notCheck: true,
        }
      )
      index++
    }
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
  await gouMaiPingTai({
    type: '搜索装备',
    subType: '首饰',
    targetName: 'xhsl',
  })
  await gouMaiPingTai({
    type: '搜索装备',
    subType: '首饰',
    targetName: 'pcj',
  })
}
