import fs from 'fs/promises'
import Jimp from 'jimp'
import path from 'path'
import child_process from 'child_process'
import { pythonEnvPath, pythonImagesPath, pythonPath } from '../paths'
import sharp from 'sharp'
import robotjs from 'robotjs'
import { randomName } from './toolkits'
import { MyPromise } from './customizePromise'
import commonConfig from '../constants/config.json'

/**
 * 删除目录和下边所有文件
 */
async function deleteDir(dirPath: string) {
  try {
    // 读取目录中的所有文件和子目录
    const entries = await fs.readdir(dirPath, { withFileTypes: true })

    for (let entry of entries) {
      const entryPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        // 如果是目录，则递归调用自身
        await deleteDir(entryPath)
        // 删除空目录
        await fs.rmdir(entryPath)
      } else {
        // 如果是文件，则直接删除
        await fs.unlink(entryPath)
      }
    }
  } catch (error) {
    console.error(`Error while deleting contents of ${dirPath}:`, error)
  }
}

// 将截图文件转换为png图片
function screenCaptureToFile(filePath: string, position: number[] = [], size: number[] = []) {
  const robotScreenPic = robotjs.screen.capture(...position, ...size)

  return MyPromise((resolve, reject) => {
    try {
      const image = new Jimp(robotScreenPic.width, robotScreenPic.height)
      let pos = 0
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (_x, _y, idx) => {
        image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++)
      })
      image.write(filePath, resolve)
    } catch (e) {
      console.error(e)
      reject(e)
    }
  })
}

// 从图片中找到目标图片的坐标位置
function findImagePositions(bigImagePath: string, smallImagePath: string): Promise<number[]> {
  const filePath = path.join(pythonPath, 'findPositionWithinTemplate.py')

  return MyPromise((resolve, reject) => {
    child_process.exec(`python -u ${filePath} ${smallImagePath} ${bigImagePath}`, (error, stdout) => {
      if (error) {
        console.log('findImagePos error: ', error)
        reject(error)
      }

      const position: number[] = JSON.parse(stdout) as number[]
      resolve(position)
    })
  })
}

// 调用paddle-ocr对图片进行文字识别
async function paddleOcr(sourceImagePath: string, needPreProcessing = true, lang: string = 'ch'): Promise<string[]> {
  let targetImagePath = sourceImagePath
  if (needPreProcessing) {
    targetImagePath = path.join(pythonImagesPath, `temp/${randomName()}.jpg`)
    targetImagePath = await prePorcessingImage(sourceImagePath, targetImagePath)
  }

  // 替换为您的Python解释器路径和脚本路径
  const filePath = path.join(pythonPath, 'paddle_ocr.py')

  return MyPromise((resolve, reject) => {
    child_process.exec(`${pythonEnvPath} -u ${filePath} ${targetImagePath} ${lang}`, (error, stdout) => {
      if (error) {
        console.error(`stderr: ${error}`)
        reject(error)
      }

      const results: string[] = JSON.parse(stdout.split('\r\n')[5]) as string[]

      resolve(results)
    })
  })
}

async function prePorcessingImage(sourceImagePath: string, targetImagePath: string): Promise<string> {
  return MyPromise((resolve, reject) =>
    sharp(sourceImagePath)
      .greyscale() // 转换为灰度图像，简化图像，减少处理复杂度
      .resize(800) // 根据需要调整大小，较大的图像可以帮助保留文字细节
      .threshold(80) // 应用二值化，阈值需要根据图像的具体情况进行调整
      .toColourspace('b-w') // 转换为黑白色彩空间，进一步增强对比度
      .sharpen() // 锐化图像，增强文字边缘，使文字更加清晰
      .toFile(targetImagePath, (err, info) => {
        if (err) {
          reject(err)
        }
        resolve(targetImagePath)
      })
  )
}

// 比较两张大小一样的图片是否相同
async function compareTwoImages(
  captureImagePath: string,
  templateImagePath: string,
  otherOptions: { needPreProcessing?: boolean; threshold?: number } = { needPreProcessing: false, threshold: 10 }
): Promise<[number, number]> {
  const filePath = path.join(pythonPath, 'compareTwoImages.py')
  let targetImagePath1 = captureImagePath
  let targetImagePath2 = templateImagePath
  if (otherOptions.needPreProcessing) {
    const name = randomName()
    targetImagePath1 = path.join(pythonImagesPath, `temp/preProcessing_${name + '_1'}.jpg`)
    targetImagePath2 = path.join(pythonImagesPath, `temp/preProcessing_${name + '_2'}.jpg`)
    targetImagePath1 = await prePorcessingImage(captureImagePath, targetImagePath1)
    targetImagePath2 = await prePorcessingImage(templateImagePath, targetImagePath2)
  }

  return MyPromise((resolve, reject) => {
    child_process.exec(
      `python -u ${filePath} ${captureImagePath} ${templateImagePath} ${otherOptions.threshold || 15}`,
      (error, stdout) => {
        if (error) {
          console.log('compareTwoImages error: ', error)
          reject(error)
        }

        const res = JSON.parse(stdout)
        console.log('meanDifference: ', res[1])

        resolve(res)
      }
    )
  })
}

// 提取图片颜色
async function extractThemeColors(imagePath: string, top_n = 50): Promise<string> {
  const filePath = path.join(pythonPath, 'extractThemeColors.py')

  return MyPromise((resolve, reject) => {
    child_process.exec(`python -u ${filePath} ${imagePath} ${top_n}`, (error, stdout) => {
      if (error) {
        console.log('extractThemeColors error: ', error)
        reject(error)
      }

      resolve(stdout)
    })
  })
}

// 是否可以从模板中找到目标
async function findImageWithinTemplate(
  bigImagePath: string,
  smallImagePath: string,
  threshold = 0.8
): Promise<boolean> {
  const filePath = path.join(pythonPath, 'findImageWithinTemplate.py')

  return MyPromise((resolve, reject) => {
    child_process.exec(`python -u ${filePath} ${bigImagePath} ${smallImagePath} ${threshold}`, (error, stdout) => {
      if (error) {
        console.log('findImageWithinTemplate error: ', error)
        reject(error)
      }

      resolve(stdout.trim() === 'True')
    })
  })
}

// 删除图片背景色
async function removeBackground(imagePath: string): Promise<void> {
  const filePath = path.join(pythonPath, 'removeBackground.py')

  return MyPromise((resolve, reject) => {
    child_process.exec(`python -u ${filePath} ${imagePath}`, (error) => {
      if (error) {
        console.log('removeBackground error: ', error)
        reject(error)
      }

      resolve()
    })
  })
}

// 从大图片里找到与小图片匹配的多个位置
async function findMultiMatchPositions(bigImagePath: string, smallImagePath: string): Promise<number[][]> {
  const filePath = path.join(pythonPath, 'findMultiMatchPositions.py')

  return MyPromise((resolve, reject) => {
    child_process.exec(`python -u ${filePath} ${bigImagePath} ${smallImagePath}`, (error, stdout) => {
      if (error) {
        console.log('findMultiMatchPositions error: ', error)
        reject(error)
      }

      const res = JSON.parse(stdout) as number[][]

      resolve(res)
    })
  })
}

// 不停监控屏幕，直到找到目标
async function findTargetInVideo(targetImagePath: string) {
  const filePath = path.join(pythonPath, 'findTargetInVideo.py')

  return MyPromise((resolve, reject) => {
    child_process.exec(`python -u ${filePath} ${targetImagePath}`, (error, stdout) => {
      if (error) {
        console.log('findTargetInVideo error: ', error)
        reject(error)
      }

      const result = stdout.trim() === 'True'
      if (result) {
        global.appContext.hasFoundTarget = true
      }

      resolve(result)
    })
  })
}

export {
  deleteDir,
  screenCaptureToFile,
  findImagePositions,
  paddleOcr,
  prePorcessingImage,
  extractThemeColors,
  findImageWithinTemplate,
  compareTwoImages,
  removeBackground,
  findTargetInVideo,
  findMultiMatchPositions,
}
