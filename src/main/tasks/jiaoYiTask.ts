import { findImagePositions, findImageWithinTemplate, screenCaptureToFile } from '../../utils/fileOperations'
import { pythonImagesPath } from '../../paths'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank } from '../../utils/common'
import GameWindowControl from '../../utils/gameWindowControll'
import robotUtils from '../../utils/robot'
import { randomName, sleep } from '../../utils/toolkits'
import path from 'path'
import { useWuPin } from './wuPinTask'

export async function findYuTianSuo() {
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  robotUtils.keyTap('E', ['alt'])
  await sleep(500)
  await clickGamePoint('物品栏-法宝共生栏', 'faBaoGongShengLan', {
    callback: async () => {
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('faBaoGongShengLanDianJi')}.jpg`)
      const templateImagePath = path.join(pythonImagesPath, `GUIElements/taskRelative/faBaoGongShengLan.jpg`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      if (!found) {
        robotUtils.mouseClick('right')
        await sleep(500)
      }

      return found
    }
  })

  await clickGamePoint('物品栏-飞行法宝', 'feiXingFaBao', {
    rightClick: true
  })
}

/**
 * jiaoYiWindow1: 被交易方
 * jiaoyiWindow2: 交易方
 */
export default async function jiaoYi(
  jiaoYiWindow1: GameWindowControl,
  jiaoyiWindow2: GameWindowControl,
  jiaoYiWuPin: string[]
) {
  await jiaoyiWindow2.setForeground()

  // 隐藏其他人
  {
    const templateImagePath = path.join(pythonImagesPath, `GUIElements/common/yinCangXianShi.jpg`)
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('yinCangXianShi')}.jpg`)
    await screenCaptureToFile(tempCapturePath)

    const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

    if (!found) {
      robotUtils.keyTap('2', ['alt'])
      await sleep(500)
    }
  }
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  robotUtils.keyTap('X', ['alt'])
  await sleep(500)
  await moveMouseToBlank()

  let teamLeaderPosition: number[] = []

  // find team leader position and jiao yi
  {
    const teamLeaderImagePath = path.join(
      pythonImagesPath,
      `GUIElements/npcRelative/jiaoYi_${jiaoYiWindow1?.roleInfo.account}.jpg`
    )
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('juesePosition')}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    teamLeaderPosition = await findImagePositions(tempCapturePath, teamLeaderImagePath)
  }

  await moveMouseToAndClick(
    '',
    {
      buttonName: 'jiaoYiKuang',
      position: [teamLeaderPosition[0], teamLeaderPosition[1] - 200],
      size: [100, 150],
    },
    {
      callback: async () => {
        const jiaoYiTemplateImagePath = path.join(pythonImagesPath, `GUIElements/common/jiaoYi.jpg`)
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('jiaoYiKuang')}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, jiaoYiTemplateImagePath)

        return found
      },
    }
  )

  await jiaoYiWindow1?.setForeground()
  for (const wuPin of jiaoYiWuPin) {
    await useWuPin(wuPin, { times: 1, hasOpenedWuPinLan: true, isJiaoYi: true })
    await sleep(500)
  }
  await clickGamePoint('交易-确定', 'jiaoYiQueDing', {
    tabOptions: {
      isTab: true,
      activeTabColor: '#505050',
      top_n: 10,
    },
  })

  await jiaoyiWindow2?.setForeground()
  await clickGamePoint('交易-确定', 'jiaoYiQueDing')
}
