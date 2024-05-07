import GameWindowControl from './gameWindowControll'
import robotUtils from './robot'
import { ImageFileInfo, randomName, randomNum, randomPixelNum, sleep } from './toolkits'
import path from 'path'
import { logPath, pythonImagesPath, staticPath } from '../paths'
import { compareTwoImages, extractThemeColors, findImageWithinTemplate, screenCaptureToFile } from './fileOperations'
import { IGamePoints } from 'constants/types'
import fs from 'fs'
import { MyPromise } from './customizePromise'
import playSound from 'play-sound'

export async function moveMouseTo(x: number, y: number) {
  const alternateWindow = GameWindowControl.getAlternateWindow()

  alternateWindow.show()
  await sleep(500)
  robotUtils.moveMouseSmooth(x, y)
  alternateWindow.hide()

  await sleep(500)
  robotUtils.mouseClick('left')
}

export async function clickButton(
  options: {
    buttonName: string
    position: number[]
    size: number[]
  },
  needPreProcessing = false
) {
  await moveMouseToBlank()
  await sleep(200)
  const tempCapturePath = path.join(pythonImagesPath, `temp/${options.buttonName}__${randomName()}.jpg`)
  await screenCaptureToFile(tempCapturePath, options.position, options.size)
  await moveMouseToAndClick(tempCapturePath, options, {
    needPreProcessing,
  })
}

/**
 * 移动鼠标到指定位置并点击，通过callback检测鼠标是否成功点击
 */
export async function moveMouseToAndClick1(
  templateImagePath: string,
  fileInfo: ImageFileInfo,
  otherOptions: {
    needPreProcessing?: boolean
    rightClick?: boolean
    callback?: Function
    threshold?: number
    notCheck?: boolean
    randomPixNums?: number[]
  } = {
    needPreProcessing: false,
    rightClick: false,
    notCheck: false,
    randomPixNums: [20, 5],
  }
) {
  let isInRange = false
  let lastXPos = fileInfo.position[0] + Math.round(fileInfo.size[0] / 2)
  let lastYPos = fileInfo.position[1] + Math.round(fileInfo.size[1] / 2)
  let errorCounts = 0
  while (!isInRange) {
    errorCounts++
    const position = [
      lastXPos + randomPixelNum(otherOptions.randomPixNums?.[0] || 20),
      lastYPos + Math.min(Math.ceil(errorCounts / 5), 4) * randomPixelNum(otherOptions.randomPixNums?.[1] || 5),
    ]
    // console.log('position: ', position);

    await moveMouseTo(position[0], position[1])
    await sleep(500)

    if (otherOptions.notCheck) {
      isInRange = true
      robotUtils.mouseClick(otherOptions.rightClick ? 'right' : 'left')
      return
    }

    const srcImagePath = path.join(pythonImagesPath, `temp/${fileInfo.buttonName + '_' + randomName()}.jpg`)
    await screenCaptureToFile(srcImagePath, fileInfo.position, fileInfo.size)
    const [result] = await compareTwoImages(srcImagePath, templateImagePath, { ...otherOptions })

    if (result === 1) {
      isInRange = true
      robotUtils.mouseClick(otherOptions.rightClick ? 'right' : 'left')
      await sleep(1000)

      if (otherOptions.callback) {
        const success = await otherOptions.callback()

        if (!success) {
          isInRange = false
        }
      } else {
        async function defaultCallback() {
          await moveMouseToBlank()
          const tempCapturePath = path.join(pythonImagesPath, `temp/moveMouseToAndClick_${randomName()}.jpg`)
          await screenCaptureToFile(tempCapturePath, fileInfo.position, fileInfo.size)
          const [result] = await compareTwoImages(tempCapturePath, templateImagePath)

          if (result === 0) {
            // 没有点到按钮，需要重试
            isInRange = false
          }
        }

        await defaultCallback()
      }
    } else {
      await moveMouseToBlank()
    }
  }
}

const errorBgm = path.join(staticPath, '/error.wav')
export async function moveMouseToAndClick(
  templateImagePath: string,
  fileInfo: ImageFileInfo,
  otherOptions: {
    needPreProcessing?: boolean
    rightClick?: boolean
    callback?: Function
    threshold?: number
    notCheck?: boolean
    randomPixNums?: number[]
  } = {
    needPreProcessing: false,
    rightClick: false,
    notCheck: false,
    randomPixNums: [20, 5],
  }
) {
  let isInRange = false
  let lastXPos = fileInfo.position[0] + Math.round(fileInfo.size[0] / 2)
  let lastYPos = fileInfo.position[1] + Math.round(fileInfo.size[1] / 2)
  let errorCounts = 0
  while (!isInRange) {
    if (errorCounts > 10) {
      playSound().play(errorBgm)
      return
    }
    errorCounts++
    const position = [
      lastXPos + randomPixelNum(otherOptions.randomPixNums?.[0] || 20),
      lastYPos + Math.min(Math.ceil(errorCounts / 5), 4) * randomPixelNum(otherOptions.randomPixNums?.[1] || 5),
    ]

    await moveMouseTo(position[0], position[1])
    await sleep(200)

    if (otherOptions.notCheck) {
      isInRange = true
      robotUtils.mouseClick(otherOptions.rightClick ? 'right' : 'left')
      await moveMouseToBlank()
      return
    }

    robotUtils.mouseClick(otherOptions.rightClick ? 'right' : 'left')
    isInRange = true
    await sleep(1000)
    await moveMouseToBlank()

    const callback =
      otherOptions.callback ||
      async function defaultCallback() {
        const tempCapturePath = path.join(pythonImagesPath, `temp/${fileInfo.buttonName}_${randomName()}.jpg`)
        await screenCaptureToFile(tempCapturePath, fileInfo.position, fileInfo.size)
        const [result] = await compareTwoImages(tempCapturePath, templateImagePath, {
          threshold: otherOptions.threshold,
        })

        return result === -1
      }
    const success = await callback()

    if (!success) {
      isInRange = false
    }
  }
}

/**
 * 通过点击的按钮或者文字颜色改变
 */
export async function moveMouseToAndClickUseColor(fileInfo: ImageFileInfo, color: string) {
  let isInRange = false
  let lastXPos = fileInfo.position[0] + Math.round(fileInfo.size[0] / 2)
  let lastYPos = fileInfo.position[1] + Math.round(fileInfo.size[1] / 2)
  while (!isInRange) {
    await moveMouseTo(lastXPos + randomPixelNum(20), lastYPos + randomPixelNum(10))
    await sleep(500)
    const srcImagePath = path.join(pythonImagesPath, `temp/${fileInfo.buttonName + '_' + randomName()}.jpg`)
    await screenCaptureToFile(srcImagePath, fileInfo.position, fileInfo.size)
    const colors = await extractThemeColors(srcImagePath)

    if (colors.includes(color)) {
      isInRange = true
      robotUtils.mouseClick('left')
    }
  }
}

/**
 * 判断padleocr识别出的字符串是否可以和模板字符串匹配
 */
export function matchString(paddleOcrStr: string, templateStr: string) {
  let count = 0
  let prevIndex = 0
  for (const char of paddleOcrStr) {
    const index = templateStr.slice(prevIndex).toUpperCase().indexOf(char.toUpperCase())
    if (index > -1) {
      count++
      prevIndex += index + 1
    }
  }

  return count >= Math.ceil(templateStr.length / 2)
}

/**
 * 从模板字符串中找到最符合paddleOcr识别的字符串
 */
export function matchStrings(paddleOcrStr: string, matchStrings: string[]) {
  let prevSimilarity = Number(0).toFixed(2)
  let result = ''
  for (const templateStr of matchStrings) {
    let count = 0
    let prevIndex = 0
    for (const char of paddleOcrStr) {
      const index = templateStr.slice(prevIndex).toUpperCase().indexOf(char.toUpperCase())
      if (index > -1) {
        count++
        prevIndex += index + 1
      }
    }

    let similarity = (count / templateStr.length).toFixed(2)
    if (similarity > prevSimilarity) {
      prevSimilarity = similarity
      result = templateStr
    }
  }

  return result
}

// 判断选择框是否选中
export async function hasChecked(name: string) {
  await moveMouseToBlank()
  const { position, size } = global.appContext.gamePoints[name as keyof IGamePoints]

  await sleep(200)
  const smallImagePath = path.join(pythonImagesPath, 'GUIElements/common/checkedCheckbox.jpg')
  const bigImagePath = path.join(pythonImagesPath, `temp/hasChecked_${randomName()}.jpg`)
  await screenCaptureToFile(bigImagePath, position, size)

  const found = await findImageWithinTemplate(bigImagePath, smallImagePath)

  return found
}

/**
 * 点击gamePoint
 */
export async function clickGamePoint(
  gamePoint: string,
  captureName: string,
  otherOptions?: {
    rightClick?: boolean
    callback?: Function
    notCheck?: boolean
    threshold?: number
    randomPixNums?: number[]
    tabOptions?: {
      isTab: boolean
      activeTabColor: string
    }
    notMoveMouse?: boolean
  }
) {
  if (!otherOptions?.notMoveMouse) {
    await moveMouseToBlank()
  }
  const { position, size } = global.appContext.gamePoints[gamePoint as keyof IGamePoints]
  const tempCapturePath = path.join(pythonImagesPath, `temp/${captureName}_${randomName()}.jpg`)
  await screenCaptureToFile(tempCapturePath, position, size)
  if (otherOptions?.tabOptions?.isTab) {
    otherOptions.callback =
      otherOptions.callback ||
      async function defaultCallback() {
        const tempCapturePath = path.join(pythonImagesPath, `temp/${captureName}_${randomName()}.jpg`)
        await screenCaptureToFile(tempCapturePath, position, size)

        const colors = await extractThemeColors(tempCapturePath)

        if (colors.includes(otherOptions.tabOptions?.activeTabColor || '')) {
          return true
        }

        return false
      }
  }

  await moveMouseToAndClick(
    tempCapturePath,
    {
      buttonName: captureName,
      position,
      size,
    },
    otherOptions
  )
}

export class AsyncQueue {
  #queue: Function[]
  #running: boolean
  constructor() {
    this.#queue = []
    this.#running = false
  }

  async enqueue(asyncFunction: () => Promise<void>) {
    this.#queue.push(asyncFunction)
    if (!this.#running) {
      await this.processQueue()
    }
  }

  async processQueue() {
    this.#running = true
    while (this.#queue.length > 0) {
      const asyncFunction = this.#queue.shift()!
      await asyncFunction()
    }
    this.#running = false
  }
}

export async function moveMouseToBlank() {
  const moustPostions = global.appContext.mousePositions
  const { position, size } = moustPostions[randomNum(moustPostions.length)]

  await moveMouseTo(position[0] + randomPixelNum(size[0]), position[1] + randomPixelNum(size[1]))
}

export async function writeLog(logFile: string, logMessage: string, rewrite: boolean = false) {
  // 构建日志格式
  const logLine = `\n\n\n${logMessage}\n\n\n`
  const filePath = path.join(logPath, logFile + '.txt')

  // 使用 fs.appendFile() 向日志文件中追加日志
  if (rewrite) {
    fs.writeFile(filePath, logLine, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err)
      }
    })
  } else {
    fs.appendFile(filePath, logLine, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err)
      }
    })
  }
}

export async function readLog(logFile: string): Promise<string> {
  const filePath = path.join(logPath, logFile + '.txt')
  return MyPromise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // 文件不存在
          console.log('File does not exist. Creating a new file...')
          // 创建一个空文件
          fs.writeFile(filePath, '', (err) => {
            if (err) {
              console.error('Error creating file:', err)
            } else {
              console.log('Empty file created successfully.')
            }
          })
        } else {
          console.error('Error reading file:', err)
          reject(err)
        }
      }

      resolve(data)
    })
  })
}
