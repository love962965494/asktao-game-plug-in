import { IGameTask } from 'constants/types'
import { clickGamePoint, matchString } from '../../utils/common'
import robotUtils from '../../utils/robot'
import { randomName, sleep } from '../../utils/toolkits'
import { clipboard } from 'electron'
import path from 'path'
import { pythonImagesPath } from '../../paths'
import { paddleOcr, removeBackground, screenCaptureToFile } from '../../utils/fileOperations'

export async function hasGameTask(taskName: string) {
  await searchGameTask(taskName)

  const tempCapturePath = path.join(pythonImagesPath, `temp/hasGameTask_${randomName()}.jpg`)
  const { position, size } = global.appContext.gamePoints['当前任务-列表框']
  const { description } = global.appContext.gameTask[taskName as keyof IGameTask]
  await screenCaptureToFile(tempCapturePath, position, size)

  await removeBackground(tempCapturePath)
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
