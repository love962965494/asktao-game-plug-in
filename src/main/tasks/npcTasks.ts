import { findImageWithinTemplate, paddleOcr, screenCaptureToFile } from '../../utils/fileOperations'
import { pythonImagesPath } from '../../paths'
import { matchString, moveMouseToAndClickUseColor, moveMouseToBlank } from '../../utils/common'
import robotUtils from '../../utils/robot'
import { randomName, sleep } from '../../utils/toolkits'
import path from 'path'
import { INPC } from 'constants/types'
import { clipboard } from 'electron'
import GameWindowControl from '../../utils/gameWindowControll'
import { MyPromise } from '../../utils/customizePromise'

export function findCity(address: string) {
  let matchCity = '' as keyof INPC

  for (const city of Object.keys(appContext.npc)) {
    if (matchString(address, city)) {
      matchCity = city as keyof INPC
      break
    }
  }

  if (!matchCity) {
    throw new Error('can not found match city!')
  }

  return matchCity
}

export function getCurrentCityByNpc(npc: string) {
  let matchCity = '' as keyof INPC
  for (const city of Object.keys(global.appContext.npc)) {
    const npcs = global.appContext.npc[city as keyof INPC]
    
    if (npcs[npc as keyof INPC[keyof INPC]]) {
      matchCity = city as keyof INPC

      break
    } 
  }
  
  if (!matchCity) {
    throw new Error('can not found match city by given npc!')
  }

  return matchCity
}

export async function getCurrentCity() {
  await sleep(200)
  robotUtils.keyTap('B', ['control'])
  await sleep(200)
  robotUtils.keyTap('W', ['alt'])

  await moveMouseToBlank()

  let tempCapturePath = path.join(pythonImagesPath, `temp/${'currentCity_' + randomName() + '_1'}.jpg`)
  const { position, size } = global.appContext.gamePoints['当前地图']
  await screenCaptureToFile(tempCapturePath, position, size)
  // 获取当前地图名称
  const address = (await paddleOcr(tempCapturePath))[0] as keyof INPC
  if (appContext.npc[address]) {
    return address
  }
  const matchCity = findCity(address)
  return matchCity
}

// 走到指定NPC
export async function goToNPC(city: string, npcName: string) {
  robotUtils.keyTap('B', ['control'])
  await sleep(200)
  robotUtils.keyTap('W', ['alt'])

  await sleep(200)
  let {
    search: { abstract, steps },
  } = appContext.npc[city as keyof INPC][npcName as keyof INPC[keyof INPC]] as {
    search: { abstract: string; steps: string[] }
  }
  clipboard.writeText(Buffer.from(abstract, 'utf-8').toLocaleString())
  robotUtils.keyTap('v', 'control')
  for (const step of steps) {
    robotUtils.keyTap(step)
    await sleep(100)
  }
}

export async function hasGoneToNPC(gameWindow: GameWindowControl, time = 5): Promise<void> {
  const { position, size } = global.appContext.gamePoints['NPC对话-蓝色框框']
  const templateImagePath = path.join(pythonImagesPath, `GUIElements/common/hasGoneToNPC.jpg`)

  return MyPromise((resolve) => {
    const interval = setInterval(async () => {
      await gameWindow.setForeground()
      const tempCapturePath = path.join(pythonImagesPath, `temp/hasGoneToNPC_${randomName()}.jpg`)
      await screenCaptureToFile(tempCapturePath, position, size)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      if (found) {
        clearInterval(interval)
        resolve()
      }
    }, time * 1000)
  })
}

export async function talkToNPC(city: string, npcName: string, conversition: string, calculatePosition?: Function) {
  let { position, size } =
    global.appContext.npc?.[city as keyof INPC]?.[npcName as keyof INPC[keyof INPC]]?.['conversitions']?.[
      conversition
    ] as { position: number[]; size: number[]; }
  
  if (calculatePosition) {
    position = await calculatePosition()
  }

  await moveMouseToBlank()

  await moveMouseToAndClickUseColor(
    {
      buttonName: 'talkToNPC',
      position: [position[0] + Math.round(size[0] / 2) - 50, position[1]],
      size: [200, size[1]],
    },
    '#fa0000'
  )
}

export async function goToNPCAndTalk(options: {
  city?: string
  npcName: string
  conversition: string
  intervalTime?: number
  gameWindow: GameWindowControl
  calculatePosition?: Function
}) {
  const { city, npcName, conversition, intervalTime = 5, gameWindow, calculatePosition } = options
  const currentCity = city || (await getCurrentCity())
  await goToNPC(currentCity, npcName)
  await hasGoneToNPC(gameWindow, intervalTime)
  await talkToNPC(currentCity, npcName, conversition, calculatePosition)
}