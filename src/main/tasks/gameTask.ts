import { IGameTask } from 'constants/types'
import { clickGamePoint, matchString, moveMouseToAndClick } from '../../utils/common'
import robotUtils from '../../utils/robot'
import { randomName, sleep } from '../../utils/toolkits'
import { clipboard } from 'electron'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import {
  extractThemeColors,
  findImagePositions,
  findImageWithinTemplate,
  paddleOcr,
  screenCaptureToFile,
} from '../../utils/fileOperations'

export async function hasGameTask(taskName: string) {
  await searchGameTask(taskName)

  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('hasGameTask')}.jpg`)
  const { position, size } = global.appContext.gamePoints['当前任务-列表框']
  const { description } = global.appContext.gameTask[taskName as keyof IGameTask]
  await screenCaptureToFile(tempCapturePath, position, size)

  // TODO: 换台电脑后是否有问题？？
  // await removeBackground(tempCapturePath)
  const tasks = await paddleOcr(tempCapturePath, false)

  for (const task of tasks) {
    if (matchString(task, description + taskName)) {
      return true
    }
  }

  return false
}

export async function searchGameTask(taskName: string) {
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  const { description, pinYin } = global.appContext.gameTask[taskName as keyof IGameTask]
  robotUtils.keyTap('Q', 'alt')

  const templateImagePath = path.join(pythonImagesPath, `GUIElements/common/${pinYin}Task.jpg`)
  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('searchGameTask')}.jpg`)
  await screenCaptureToFile(tempCapturePath)
  const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)
  if (found) {
    return true
  }

  await clickGamePoint('当前任务', 'searchGameTask', {
    tabOptions: {
      isTab: true,
      activeTabColor: '#785a00',
    },
  })
  await sleep(500)
  await clickGamePoint('当前任务-搜索框', 'searchGameTask', {
    threshold: 1,
  })
  await sleep(500)

  clipboard.writeText(Buffer.from(description, 'utf-8').toLocaleString())
  robotUtils.keyTap('v', 'control')
  await sleep(200)
  robotUtils.keyTap('enter')
  await sleep(200)
  robotUtils.keyTap('enter')
  await sleep(200)
  robotUtils.keyTap('enter')

  await sleep(500)
  return false
}

// 标题size
export const escTaskBarSize = [250, 28]
// 任务框框size
const taskBarSize = [250, 60]
export async function escShouCangTasks(taskName: string, ignoreHasFinished = false) {
  robotUtils.keyTap('B', ['control'])
  await sleep(300)
  robotUtils.keyTap('escape')
  await sleep(300)
  await clickGamePoint('收藏任务', 'xianJieShenBu', {
    tabOptions: {
      isTab: true,
      activeTabColor: '#1e140a',
    },
  })
  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('shouCangRenWu1')}.jpg`)
  const templateImagePath = path.join(pythonImagesPath, `GUIElements/common/${taskName}.jpg`)
  await screenCaptureToFile(tempCapturePath)
  const position = await findImagePositions(tempCapturePath, templateImagePath)
  let hasFinished = false
  {
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('shouCangRenWu2')}.jpg`)
    await screenCaptureToFile(
      tempCapturePath,
      [position[0], position[1] + escTaskBarSize[1] + 5],
      [escTaskBarSize[0], taskBarSize[1] - escTaskBarSize[1]]
    )
    const colors = await extractThemeColors(tempCapturePath)
    if (!colors.includes('#e6c878')) {
      hasFinished = true
    }
  }
  if (hasFinished && !ignoreHasFinished) {
    return hasFinished
  }
  {
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('shouCangRenWu3')}.jpg`)
    await screenCaptureToFile(tempCapturePath, position, taskBarSize)
    await moveMouseToAndClick(tempCapturePath, {
      buttonName: 'shouCangRenWu',
      position,
      size: taskBarSize,
    })
  }

  return hasFinished
}
