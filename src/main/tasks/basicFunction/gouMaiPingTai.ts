import robotUtils from '../../../utils/robot'
import GameWindowControl from '../../../utils/gameWindowControll'
import { clickGamePoint } from '../../../utils/common'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import { randomName, sleep } from '../../../utils/toolkits'
import { extractThemeColors, findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import { clipboard } from 'electron'

export type GouMaiPingTaiType = {
  搜索装备: SouSuoZhuangBei
}
export interface SouSuoZhuangBei {
  武器: {}
  防具: {}
  首饰: {}
  法宝: {}
  仙器: {}
  其他: {}
}

export async function gouMaiPingTai(
  gameWindow: GameWindowControl,
  options: {
    type: keyof GouMaiPingTaiType
    subType: keyof GouMaiPingTaiType[keyof GouMaiPingTaiType]
    targetName: string
  }
) {
  await gameWindow.setForeground()
  robotUtils.keyTap('B', ['control'])
  await clickGamePoint('互动图标', 'huDongTuBiao', {
    callback: async () => {
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/huDongZhongXin.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('huDongZhongXin')}`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      return found
    },
  })
  await sleep(500)
  await clickGamePoint('互动中心-摆摊购买平台', 'baiTanGouMaiPingTai', {
    callback: async () => {
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/baiTaiGouMaiPingTai.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('baiTaiGouMaiPingTai')}.jpg`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      return found
    },
  })

  switch (options.type) {
    case '搜索装备': {
      await souSuoZhuangBei(options.subType, options.targetName)
      break
    }
  }

  await sleep(2000)
  await clickGamePoint('摆摊购买平台-购买', 'baiTanGouMaiPingTai-buy', {
    callback: async () => {
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('souSuoZhuangBei-search')}.jpg`)
      await screenCaptureToFile(tempCapturePath, [645, 698], [200, 8])
      const colors = await extractThemeColors(tempCapturePath)

      return colors.includes('#bea')
    }
  })
  robotUtils.keyTap('enter')
}

// 暂时只做到根据装备名字搜索物品
const targetNameEnum = {
  武器: 'wuQiMingCheng',
  防具: 'fangJuMingCheng',
  首饰: 'shouShiMingCheng',
}
async function souSuoZhuangBei(type: keyof SouSuoZhuangBei, targetName: string) {
  await clickGamePoint('摆摊购买平台-搜索装备', 'souSuoZhuangBei1', {
    callback: async () => {
      await sleep(500)
      robotUtils.keyTap('enter')
      await sleep(500)
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/souSuoZhuangBei.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('souSuoZhuangBei1')}.jpg`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      return found
    },
  })
  await sleep(500)
  await clickGamePoint(`摆摊购买平台-搜索装备-${type}`, `souSuoZhuangBei2`, {
    tabOptions: {
      isTab: true,
      activeTabColor: '#785a00',
    },
  })
  await sleep(500)

  if (['武器', '防具', '首饰'].includes(type)) {
    const templateImagePath = path.join(
      pythonImagesPath,
      `GUIElements/common/${targetNameEnum[type as keyof typeof targetNameEnum]}.jpg`
    )
    const tempCapturePath = path.join(
      pythonImagesPath,
      `temp/${randomName(`souSuoZhuangBei-${targetNameEnum[type as keyof typeof targetNameEnum]}`)}`
    )
    await screenCaptureToFile(tempCapturePath)
    const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

    if (!found) {
      await clickGamePoint('摆摊购买平台-搜索装备-类型选择', 'souSuoZhuangBei-typeSelect')
      await sleep(500)
      robotUtils.keyTap('down')
      await sleep(100)
      robotUtils.keyTap('enter')
      await sleep(500)
    }

    await clickGamePoint('摆摊购买平台-搜索装备-类型输入框', 'souSuoZhuangBei-typeInput', {
      callback: async () => {
        const { position, size } = global.appContext.gamePoints['摆摊购买平台-搜索装备-类型输入框']
        robotUtils.keyTap('A', ['control'])
        await sleep(100)
        robotUtils.keyTap('delete')
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/inputLogo.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('souSuoZhuangBei-typeInput')}.jpg`)
        await screenCaptureToFile(tempCapturePath, position, size)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        return found
      }
    })
    clipboard.writeText(Buffer.from(targetName, 'utf-8').toLocaleString())
    robotUtils.keyTap('v', 'control')
    await sleep(500)
    robotUtils.keyTap('down')
    await sleep(100)
    robotUtils.keyTap('enter')
    await sleep(500)
  }

  await clickGamePoint('摆摊购买平台-搜索装备-搜索', 'souSuoZhuangBei-search', {
    callback: async () => {
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('souSuoZhuangBei-search')}.jpg`)
      await screenCaptureToFile(tempCapturePath, [645, 698], [200, 8])
      const colors = await extractThemeColors(tempCapturePath)

      return colors.includes('#bea')
    }
  })

  await robotUtils.keyTap('enter')
}
