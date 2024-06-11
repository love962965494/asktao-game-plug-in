import { randomName, sleep } from '../../utils/toolkits'
import robotUtils from '../../utils/robot'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import { clickGamePoint, moveMouseToAndClick, moveMouseToBlank } from '../../utils/common'
import { findImagePositions, screenCaptureToFile } from '../../utils/fileOperations'
import { hasGameTask } from './gameTask'

const packages = ['装备-包裹', '装备-行囊1', '装备-行囊2', '装备-坐骑']
export async function findWuPinPosition(name: string) {
  const wuPinImagePath = path.join(pythonImagesPath, `GUIElements/wuPinRelative/${name}.jpg`)
  robotUtils.keyTap('B', ['control'])
  await sleep(200)
  robotUtils.keyTap('E', ['alt'])
  await sleep(200)

  for (const packageName of packages) {
    await clickGamePoint(packageName, 'hasWuPin', { tabOptions: { isTab: true, activeTabColor: '#785a00' } })

    await sleep(200)

    {
      await moveMouseToBlank()
      const { position, size } = global.appContext.gamePoints['装备-物品框框']
      let tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('hasWuPin')}.jpg`)
      await screenCaptureToFile(tempCapturePath, position, size)
      const wuPinPosition = await findImagePositions(tempCapturePath, wuPinImagePath)

      if (wuPinPosition.length > 0) {
        return [position[0] + wuPinPosition[0], position[1] + wuPinPosition[1]]
      }
    }
  }

  return []
}

export const wuPinSize = [120, 90]

// 使用物品
export async function useWuPin(name: string, times: number = 1) {
  const position = await findWuPinPosition(name)

  if (position.length > 0) {
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('useWuPin')}.jpg`)
    await screenCaptureToFile(tempCapturePath, position, wuPinSize)
    let i = 0
    while (i < times) {
      await moveMouseToAndClick(
        tempCapturePath,
        {
          buttonName: 'useWuPin',
          position,
          size: wuPinSize,
        },
        {
          rightClick: true,
          callback: () => true,
        }
      )
      await sleep(200)
      robotUtils.keyTap('enter')
      await sleep(200)
      i++
    }
  }
}

// 吃香
export async function chiXiang(times: number, buXiang: boolean = true) {
  if (buXiang) {
    await useWuPin('qiangLiQuMoXiang', times)
    return
  }
  const hasQuMoXiang = await hasGameTask('强力驱魔香时间')
  if (hasQuMoXiang) {
    return
  }

  await useWuPin('qiangLiQuMoXiang', times)
}
