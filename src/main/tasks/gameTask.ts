import { IGameTask } from 'constants/types'
import { clickGamePoint, matchString, moveMouseToAndClick } from '../../utils/common'
import robotUtils from '../../utils/robot'
import { randomName, sleep } from '../../utils/toolkits'
import { clipboard } from 'electron'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import { findImagePositions, paddleOcr, removeBackground, screenCaptureToFile } from '../../utils/fileOperations'

export async function hasGameTask(taskName: string) {
  await searchGameTask(taskName)

  const tempCapturePath = path.join(pythonImagesPath, `temp/hasGameTask_${randomName()}.jpg`)
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
  const { description } = global.appContext.gameTask[taskName as keyof IGameTask]
  robotUtils.keyTap('Q', 'alt')

  await clickGamePoint('当前任务', 'searchGameTask', { callback: () => undefined })
  await sleep(500)
  await clickGamePoint('当前任务-搜索框', 'searchGameTask', { callback: () => undefined })
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
}

// 标题size
export const escTaskBarSize = [250, 28]
// 任务框框size
const taskBarSize = [250, 60]
export async function escShouCangTasks(taskName: string) {
  robotUtils.keyTap('B', ['control'])
  await sleep(300)
  robotUtils.keyTap('escape')
  await sleep(300)
  await clickGamePoint('收藏任务', 'xianJieShenBu', {
    callback: () => undefined
  })
  const tempCapturePath = path.join(pythonImagesPath, `temp/shouCangRenWu_${randomName()}.jpg`)
  const templateImagePath = path.join(pythonImagesPath, `GUIElements/common/${taskName}.jpg`)
  await screenCaptureToFile(tempCapturePath)
  const position = await findImagePositions(tempCapturePath, templateImagePath)
  let hasFinished = false
  {
    const tempCapturePath = path.join(pythonImagesPath, `temp/shouCangRenWu_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath, [position[0], position[1] + escTaskBarSize[1] + 5], [escTaskBarSize[0], taskBarSize[1] - escTaskBarSize[1]])
    const [taskNums] = await paddleOcr(tempCapturePath, false, 'en')
    const [firstNum, secondNum] = taskNums.split('/')
    if (firstNum === secondNum) {
      hasFinished = true
    }
  }
  if (hasFinished) {
    return hasFinished
  }
  {
    const tempCapturePath = path.join(pythonImagesPath, `temp/shouCangRenWu_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath, position, taskBarSize)
    await moveMouseToAndClick(tempCapturePath, {
      buttonName: 'shouCangRenWu',
      position,
      size: taskBarSize
    })
  }

  return hasFinished
}
