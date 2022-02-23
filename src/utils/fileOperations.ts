import fs from 'fs/promises'
import { Bitmap } from 'robotjs'
import Jimp from 'jimp'
import path from 'path'
import child_process from 'child_process'
import { pythonPath } from '../paths'
import random from 'random'

/**
 * 删除目录和下边所有文件
 */
async function deleteDir(path: string) {
  try {
    await fs.access(path)
    const files = await fs.readdir(path)

    for (const file of files) {
      const currentPath = path + '/' + file
      const stats = await fs.stat(currentPath)

      if (stats.isDirectory()) {
        await deleteDir(currentPath)
      } else {
        await fs.unlink(currentPath)
      }
    }

    await fs.rmdir(path)
  } catch (error) {
    console.log('deleteDir error: ', error)
  }
}

// 将截图文件转换为png图片
function screenCaptureToFile(robotScreenPic: Bitmap, path: string) {
  return new Promise((resolve, reject) => {
    try {
      const image = new Jimp(robotScreenPic.width, robotScreenPic.height)
      let pos = 0
      image.scan(0, 0, image.bitmap.width, image.bitmap.height, (_x, _y, idx) => {
        image.bitmap.data[idx + 2] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 1] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 0] = robotScreenPic.image.readUInt8(pos++)
        image.bitmap.data[idx + 3] = robotScreenPic.image.readUInt8(pos++)
      })
      image.write(path, resolve)
    } catch (e) {
      console.error(e)
      reject(e)
    }
  })
}

function findImagePositions(
  srcImage: string,
  targetImage: string,
  minOffset: number = 0,
  maxOffset: number = 0,
  match_method: number = 4
): Promise<Array<[number, number]>> {
  const filePath = path.join(pythonPath, 'findPositions.py')

  return new Promise((resolve, reject) => {
    const workerProcess = child_process.exec(
      `python -u ${filePath} ${srcImage} ${targetImage} ${match_method}`,
      (error, stdout) => {
        if (error) {
          console.log('findImagePos error: ', error)
          reject(error)
        }

        const positions: Array<[number, number]> = (JSON.parse(stdout.split('\r\n')[0]) as Array<[number, number]>).map(
          ([x, y]) => [x + random.integer(minOffset, maxOffset), y + random.integer(minOffset, maxOffset)]
        )

        resolve(positions)
      }
    )

    workerProcess.on('exit', () => {
      console.log('执行python脚本完成')
    })
  })
}

export { deleteDir, screenCaptureToFile, findImagePositions }
