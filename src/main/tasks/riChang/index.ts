import { clickGamePoint, hasChecked, moveMouseToAndClick, moveMouseToBlank } from '../../../utils/common'
import { pythonImagesPath } from '../../../paths'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import path from 'path'
import { randomName, sleep } from '../../../utils/toolkits'
import { ipcMain } from 'electron'
import robotUtils from '../../../utils/robot'
import { findImagePositions, findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'
import { getTeamsInfo, liDui } from '../basicTasks'
import { escShouCangTasks } from '../gameTask'
import { goToNPCAndTalk, hasGoneToNPC } from '../npcTasks'
import { waitFinishZhanDou } from '../zhanDouTasks'
import { chiXiang } from '../wuPinTask'
import commonConfig from '../../../constants/config.json'
import { monitorGameDiaoXian } from '../monitorTask'
import { waKuang } from './waKuang'

export async function registerYiJianQianDao() {
  ipcMain.on('yi-jian-qian-dao', async () => yiJianQianDao())
  ipcMain.on('yi-jian-ri-chang', async () => yiJianRiChang())
  ipcMain.on('wa-kuang', async () => waKuang())
}

// 一键领取每天的日常签到
export async function yiJianQianDao() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/fuLi.jpg')
  await moveMouseToBlank()
  const tempCapturePath = path.join(pythonImagesPath, `temp/riChangQianDao_${randomName()}.jpg`)
  let position: number[] | undefined = undefined
  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    robotUtils.keyTap('B', ['control'])
    await sleep(500)
    await clickGamePoint('活动图标', 'riChangQianDao', { threshold: 30 })
    await sleep(500)
    if (!position) {
      await screenCaptureToFile(tempCapturePath)
      position = await findImagePositions(tempCapturePath, templateImagePath)
    }
    await moveMouseToAndClick(templateImagePath, {
      buttonName: 'riChangQianDao_fuLi',
      position,
      size: [40, 30],
    })
    await sleep(500)
    await clickGamePoint('每日必领_一键领取', 'meiRiBiLing_YiJianLingQu', {
      callback: () => true,
    })
    await sleep(500)
    robotUtils.keyTap('B', ['control'])
  }
}

// 每日日常
const riChangTasks_ZuDui = [
  '收藏任务_昆仑神境',
  '收藏任务_仙宠大逃亡',
  '收藏任务_二十八星宿',
  '收藏任务_帮派日常挑战',
  '收藏任务_沙漠商队',
  '收藏任务_阵营任务',
  '收藏任务_通天塔',
]
export async function meiRiRiChang_ZuDui() {
  const teamWindowsWithGroup = await getTeamsInfo()
  for (const [teamLeaderWindow] of teamWindowsWithGroup) {
    await teamLeaderWindow.setForeground()
    await chiXiang(2)
    robotUtils.keyTap('B', ['control'])
    await sleep(500)
    robotUtils.keyTap('escape')
    await clickGamePoint('收藏任务_图标', 'meiRiRiChang_ZuDui', {
      callback: async () => {
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/ziDongRenWuPeiZhi.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/meiRiRiChang_ZuDui_${randomName()}.jpg`)
        await screenCaptureToFile(tempCapturePath)

        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)
        return found
      },
      randomPixNums: [5, 2],
    })
    await sleep(500)

    for (const task of riChangTasks_ZuDui) {
      const isChecked = await hasChecked(task)

      if (!isChecked) {
        await clickGamePoint(task, 'meiRiRiChang_ZuDui', {
          randomPixNums: [5, 2],
        })
      }
    }

    await clickGamePoint('收藏任务_一键自动', 'meiRiRiChang_ZuDui')
  }
}

const riChangTasks_DanRen = ['收藏任务_娃娃训练营', '收藏任务_师门任务']
export async function meiRiRiChang_DanRen() {
  const teamWindowsWithGroup = await getTeamsInfo()

  for (const [teamLeaderWindow] of teamWindowsWithGroup) {
    await teamLeaderWindow.setForeground()
    await liDui()
  }

  for (const teamWindows of teamWindowsWithGroup) {
    for (const teamWindow of teamWindows) {
      await teamWindow.setForeground()
      // 预设方案三
      robotUtils.keyTap('R', ['control'])
      await chiXiang(2)
      robotUtils.keyTap('B', ['control'])
      await sleep(500)
      robotUtils.keyTap('escape')
      await clickGamePoint('收藏任务_图标', 'meiRiRiChang_ZuDui', {
        callback: async () => {
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/ziDongRenWuPeiZhi.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/meiRiRiChang_DanRen_${randomName()}.jpg`)
          await screenCaptureToFile(tempCapturePath)

          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)
          return found
        },
        randomPixNums: [5, 2],
      })
      await sleep(500)
      await clickGamePoint('收藏任务_单人', 'meiRiRiChang_DanRen', {
        tabOptions: {
          isTab: true,
          activeTabColor: '#785a00',
        },
      })
      await sleep(500)

      for (const task of riChangTasks_DanRen) {
        const isChecked = await hasChecked(task)

        if (!isChecked) {
          await clickGamePoint(task, 'meiRiRiChang_ZuDui', {
            randomPixNums: [5, 2],
          })
        }
      }

      await clickGamePoint('收藏任务_一键自动', 'meiRiRiChang_ZuDui')
    }
  }
}

export async function xianJieTongJi() {
  const teamWindowsWithGroup = await getTeamsInfo()

  for (const [teamLeaderWindow] of teamWindowsWithGroup) {
    await teamLeaderWindow.setForeground()
    await escShouCangTasks('quanMinShuaDao', true)
    await hasGoneToNPC(teamLeaderWindow)
    await goToNPCAndTalk({
      city: '无名小镇',
      npcName: 'yuJianShangRen',
      conversition: 'haoANaWoJiuZouYiTang',
      gameWindow: teamLeaderWindow,
    })

    await sleep(1000)
  }
}

export async function yiJianRiChang() {
  const teamWindowsWithGroup = await getTeamsInfo()
  monitorGameDiaoXian()

  for (const teamWindows of teamWindowsWithGroup) {
    for (const teamWindow of teamWindows) {
      await teamWindow.setForeground()
      robotUtils.keyTap('W', ['control'])
    }
  }
  const currentHour = new Date().getHours()
  if ((currentHour >= 20 && currentHour < 24) || (currentHour >= 0 && currentHour < 2)) {
    await xianJieTongJi()
    await sleep(4 * 60 * 60 * 1000)
    // for (const [teamLeaderWindow] of teamWindowsWithGroup) {
    //   await teamLeaderWindow.setForeground()

    //   await MyPromise<void>((resolve) => {
    //     const interval = setInterval(async () => {
    //       const inBattle = await isInBattle(teamLeaderWindow)
    //       const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/zhongZhi.jpg')
    //       const tempCapturePath = path.join(pythonImagesPath, `temp/yiJianRiChang_${randomName()}.jpg`)
    //       await screenCaptureToFile(tempCapturePath)
    //       const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

    //       if (inBattle && found) {
    //         await clickGamePoint('终止', 'yiJianRiChang', {
    //           callback: async () => {
    //             const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/zhongZhiZhanZhou.jpg')
    //             const tempCapturePath = path.join(pythonImagesPath, `temp/yiJianRiChang_${randomName()}.jpg`)
    //             await screenCaptureToFile(tempCapturePath)
    //             const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

    //             return found
    //           },
    //         })
    //         await sleep(300)
    //         robotUtils.keyTap('enter')
    //         clearInterval(interval)
    //         resolve()
    //       }
    //     }, 20 * 1000)
    //   })
    // }

    for (const [teamLeaderWindow] of teamWindowsWithGroup) {
      await waitFinishZhanDou(teamLeaderWindow)
      robotUtils.keyTap('f1')
      await sleep(200)
      robotUtils.keyTap('f1')
      await sleep(3000)
    }
  }

  await meiRiRiChang_ZuDui()

  await sleep(commonConfig.zuDuiTaskTime * 60 * 60 * 1000)

  for (const [teamLeaderWindow] of teamWindowsWithGroup) {
    await waitFinishZhanDou(teamLeaderWindow)
    robotUtils.keyTap('f1')
    await sleep(200)
    robotUtils.keyTap('f1')
  }

  await sleep(5000)
  await meiRiRiChang_DanRen()
}
