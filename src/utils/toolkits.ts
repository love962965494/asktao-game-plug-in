import { MyPromise } from "./customizePromise"

export function simpleCloneKeep<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

export async function sleep(time: number): Promise<void> {
  return MyPromise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export function setTimeoutPromise(callback: Function, time: number): Promise<void> {
  return MyPromise((resolve, reject) => {
    setTimeout(async () => {
      try {
        await callback()
        resolve()
      } catch (error) {
        reject(error)
      }
    }, time)
  })
}

/**
 * 在给定参数范围内进行一个坐标偏移
 */
export function randomPixelNum(num: number) {
  return Math.ceil(Math.random() * num) * (Math.random() > 0.5 ? 1 : -1)
}

let indexMap = new Map<string, number>()
export function randomName(name: string) {
  if (!indexMap.get(name)) {
    indexMap.set(name, 1)
  }
  let index = indexMap.get(name)!
  if (index > 30) {
    index = 1
  } else {
    index++
  }
  
  indexMap.set(name, index)
  return `${name}_${index}`
}

export function randomNum(num: number) {
  return Math.floor(Math.random() * num)
}

export type ImageFileInfo = {
  buttonName: string;
  position: number[];
  size: number[];
}
export function extractFileInfo(fileName: string): ImageFileInfo {
  const [buttonName, position, size] = fileName.split('_')
  const [x, y] = position.split('and')
  const [width, height] = size.split('and')

  return {
    buttonName,
    position: [+x, +y],
    size: [+width, +height],
  }
}
