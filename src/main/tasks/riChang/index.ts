import {
  clickGamePoint,
  hasChecked,
  matchStrings,
  moveMouseTo,
  moveMouseToAndClick,
  moveMouseToBlank,
  writeLog,
} from '../../../utils/common'
import { pythonImagesPath } from '../../../paths'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import path from 'path'
import { randomName, randomPixelNum, sleep } from '../../../utils/toolkits'
import { ipcMain } from 'electron'
import robotUtils from '../../../utils/robot'
import {
  extractThemeColors,
  findImagePositions,
  findImageWithinTemplate,
  paddleOcr,
  screenCaptureToFile,
} from '../../../utils/fileOperations'
import { displayGameWindows, getTeamsInfo, liDui } from '../basicTasks'
import { escShouCangTasks } from '../gameTask'
import { goToNPCAndTalk, hasGoneToNPC, talkToNPC } from '../npcTasks'
import { waitFinishZhanDou } from '../zhanDouTasks'
import { chiXiang } from '../wuPinTask'
import commonConfig from '../../../constants/config.json'
import { monitorGameDiaoXian } from '../monitorTask'
import { waKuang } from './waKuang'
import FuShengLu from '../../../constants/fuShengLu.json'

export async function registerYiJianQianDao() {
  ipcMain.on('yi-jian-qian-dao', async () => yiJianQianDao())
  ipcMain.on('yi-jian-ri-chang', async () => yiJianRiChang())
  ipcMain.on('wa-kuang', async () => waKuang())
}

// 五雷令
export async function wuLeiLing() {
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  robotUtils.keyTap('escape')
  await sleep(500)
  await clickGamePoint('五雷令_图标', 'wuLeiLing', {
    callback: async () => {
      const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/wuLeiLing.jpg')
      const tempCapturePath = path.join(pythonImagesPath, `temp/wuLeiLing_${randomName()}.jpg`)
      await screenCaptureToFile(tempCapturePath)

      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)
      return found
    },
    randomPixNums: [5, 2],
  })
  await sleep(500)
  const { position, size } = global.appContext.gamePoints['五雷令_一键领取']
  let xPos = position[0] + Math.round(size[0] / 2)
  let yPos = position[1] + Math.round(size[1] / 2)
  await moveMouseTo(xPos, yPos)
  let count = 0
  while (count < 15) {
    robotUtils.mouseClick('left', true)
    await sleep(30)
    await moveMouseTo(xPos + randomPixelNum(5), yPos + randomPixelNum(3))
    await sleep(20)
    count++
  }

  await sleep(1000)
  robotUtils.keyTap('B', ['control'])
  await sleep(1000)
  robotUtils.keyTap('escape')
  await sleep(1000)
  await clickGamePoint('收藏任务', 'wuLeiLing', {
    tabOptions: {
      isTab: true,
      activeTabColor: '#1e140a',
    },
  })
}

// 浮生录
export async function fuShengLu(gameWindow: GameWindowControl) {
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  robotUtils.keyTap('N', ['alt'])
  await sleep(500)

  // 找到邮件
  {
    const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/haoXiang.jpg')
    const tempCapturePath = path.join(pythonImagesPath, `temp/fuShengLuEmail_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    const position = await findImagePositions(tempCapturePath, templateImagePath)
    await moveMouseToAndClick(
      templateImagePath,
      {
        buttonName: 'fuShengLuEmail',
        position,
        size: [72, 36],
      },
      {
        callback: async function () {
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/fuShengLu.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/fuShengLu_${randomName()}.jpg`)
          await screenCaptureToFile(tempCapturePath)
          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          return found
        },
      }
    )
  }

  // 找到浮生录位置
  {
    const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/fuShengLu.jpg')
    const tempCapturePath = path.join(pythonImagesPath, `temp/fuShengLuLvZi_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    const position = await findImagePositions(tempCapturePath, templateImagePath)
    await moveMouseToAndClick(
      templateImagePath,
      {
        buttonName: 'fuShengLuLvZi',
        position,
        size: [102, 36],
      },
      {
        callback: async function () {
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/chaKan.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/fuShengLu_${randomName()}.jpg`)
          await screenCaptureToFile(tempCapturePath)
          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          return found
        },
      }
    )
  }

  {
    const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/fuShengLuDuiHuaKuang.jpg')
    const tempCapturePath = path.join(pythonImagesPath, `temp/fuShengLuDuiHuaKuang_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

    if (!found) {
      return
    }
  }

  // 打开对话框
  {
    await clickGamePoint('浮生录', 'fuShengLuDuiHuaKuang', {
      callback: async () => {
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/hasGoneToNPC.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/fuShengLu_${randomName()}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        return found
      },
    })

    // 判断是否需要物品
    const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/zuiJinJiYong.jpg')
    const tempCapturePath = path.join(pythonImagesPath, `temp/fuShengLuDialog_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

    if (found) {
      return
    }
  }

  // 回答
  {
    const { position, size } = global.appContext.gamePoints['浮生录_角色姓名']
    await gameWindow.restoreGameWindow()
    const { left, top } = gameWindow.getDimensions()
    const tempCapturePath = path.join(pythonImagesPath, `temp/fuShengLuDuiHua_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath, [left + position[0], top + position[1]], size)
    const [name] = await paddleOcr(tempCapturePath)
    const fuShengLuName = matchStrings(name, Object.keys(FuShengLu))
    writeLog('浮生录', `${gameWindow.roleInfo.roleName}: ${fuShengLuName}`)
    await gameWindow.maximizGameWindow()
    const [first, second] = FuShengLu[fuShengLuName as keyof typeof FuShengLu]
    await clickGamePoint(`浮生录_${first}`, 'fuShengLuDuiHua')
    await sleep(500)
    await clickGamePoint(`浮生录_${second}`, 'fuShengLuDuiHua')
    await sleep(500)
  }
}

// 打开福利中心
let fuLiTuBiaoPosition: number[] | undefined = undefined
const fuLiTemplateImagePath = path.join(pythonImagesPath, 'GUIElements/common/fuLi.jpg')
export async function openFuLiCenter() {
  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  await clickGamePoint('活动图标', 'riChangQianDao', { threshold: 30 })
  await sleep(500)
  if (!fuLiTuBiaoPosition) {
    const tempCapturePath = path.join(pythonImagesPath, `temp/openFuLiCenter_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    fuLiTuBiaoPosition = await findImagePositions(tempCapturePath, fuLiTemplateImagePath)
  }
  await moveMouseToAndClick(
    fuLiTemplateImagePath,
    {
      buttonName: 'riChangQianDao_fuLi',
      position: fuLiTuBiaoPosition,
      size: [40, 30],
    },
    {
      callback: async function () {
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/fuLiCenter.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/openFuLiCenter_${randomName()}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        return found
      },
    }
  )
}

export async function meiRiBiLing() {
  await openFuLiCenter()
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/yiJianLingQu.jpg')
  const tempCapturePath = path.join(pythonImagesPath, `temp/meiRiBiLing_${randomName()}.jpg`)
  await screenCaptureToFile(tempCapturePath)
  const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

  if (!found) {
    return
  }

  await clickGamePoint('每日必领_一键领取', 'meiRiBiLing_YiJianLingQu', {
    callback: async () => {
      const tempCapturePath = path.join(pythonImagesPath, `temp/yiJianZuDui_${randomName()}.jpg`)
      await screenCaptureToFile(tempCapturePath, [870, 475], [100, 20])

      const colors = await extractThemeColors(tempCapturePath)

      if (colors.includes('#e6c8')) {
        return true
      }

      return false
    },
  })
}

// 一键领取每天的日常签到
export async function yiJianQianDao() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  await moveMouseToBlank()

  // 清空浮生录日志
  writeLog('浮生录', '', true)

  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    await meiRiBiLing()
    await fuShengLu(gameWindow)
    await wuLeiLing()
  }

  await displayGameWindows()
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
      await sleep(1000)
      robotUtils.keyTap('escape')
      await sleep(1000)
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

      {
        const isChecked = await hasChecked('收藏任务_玄脉寻矿')
        if (isChecked) {
          await clickGamePoint('收藏任务_玄脉寻矿', 'meiRiRiChang_ZuDui', {
            randomPixNums: [5, 2],
          })
        }
      }

      await clickGamePoint('收藏任务_一键自动', 'meiRiRiChang_ZuDui')
    }
  }

  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/qianMianGuai.jpg')
  const hasFoundQianMianGuai = {} as { [key: string]: boolean }

  writeLog('师门任务', '', true)
  while (true) {
    for (const teamWindows of teamWindowsWithGroup) {
      for (const teamWindow of teamWindows) {
        if (hasFoundQianMianGuai[teamWindow.roleInfo.roleName]) {
          continue
        }
        await teamWindow.setForeground()
        const tempCapturePath = path.join(pythonImagesPath, `temp/shiMen_${randomName()}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        if (found) {
          hasFoundQianMianGuai[teamWindow.roleInfo.roleName] = true
          robotUtils.keyTap('f1')
          await sleep(200)
          robotUtils.keyTap('f1')
          writeLog('师门任务', `${teamWindow.roleInfo.roleName}`)
        }
        await sleep(500)
      }
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

export async function gouMaiYaoPin() {
  const teamWindowsWithGroup = await getTeamsInfo()
  const templateImagePath = path.join(pythonImagesPath, `GUIElements/npcRelative/${commonConfig.gouMaiYaoPin}.jpg`)
  for (const [teamLeaderWindow] of teamWindowsWithGroup) {
    await teamLeaderWindow.setForeground()
    robotUtils.keyTap('B', ['control'])
    await sleep(300)
    robotUtils.keyTap('W', ['alt'])
    await sleep(300)
    const tempCapturePath = path.join(pythonImagesPath, `temp/gouMaiYaoPin_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    const position = await findImagePositions(tempCapturePath, templateImagePath)
    await moveMouseToAndClick(templateImagePath, {
      buttonName: 'gouMaiYaoPin',
      position,
      size: [371, 34],
    })
    await hasGoneToNPC(teamLeaderWindow)
    await talkToNPC('无名小镇', 'wuMingYaoPuLaoBan', 'maiMai', undefined, 100)
    await sleep(500)
    await clickGamePoint('批量购买', 'piLiangGouMai', {
      callback: async () => {
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/gouMaiYaoPin.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/piLiangGouMai_${randomName()}.jpg`)
        await screenCaptureToFile(tempCapturePath)

        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        return found
      },
    })
    robotUtils.keyTap('enter')
  }

  for (const [_, ...teamMemberWindows] of teamWindowsWithGroup) {
    for (const teamMemberWindow of teamMemberWindows) {
      await teamMemberWindow.setForeground()
      await clickGamePoint('批量购买', 'piLiangGouMai', {
        callback: async () => {
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/gouMaiYaoPin.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/piLiangGouMai_${randomName()}.jpg`)
          await screenCaptureToFile(tempCapturePath)

          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          return found
        },
      })
      robotUtils.keyTap('enter')
    }
  }

  for (const [teamLeaderWindow] of teamWindowsWithGroup) {
    await teamLeaderWindow.setForeground()
    robotUtils.keyTap('f1')
    await sleep(500)
    robotUtils.keyTap('f1')
  }
}

export async function yiJianRiChang() {
  const teamWindowsWithGroup = await getTeamsInfo()
  monitorGameDiaoXian()

  for (const teamWindows of teamWindowsWithGroup) {
    for (const teamWindow of teamWindows) {
      await teamWindow.setForeground()
      robotUtils.keyTap('E', ['control'])
    }
  }
  const currentHour = new Date().getHours()
  if ((currentHour >= 20 && currentHour < 24) || (currentHour >= 0 && currentHour < 2)) {
    await xianJieTongJi()
    await sleep(2.5 * 60 * 60 * 1000)
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

    let count = 0
    while (count < 3) {
      for (const [teamLeaderWindow] of teamWindowsWithGroup) {
        await waitFinishZhanDou(teamLeaderWindow)
        robotUtils.keyTap('f1')
        await sleep(200)
        robotUtils.keyTap('f1')
        await sleep(3000)
      }
      count++
    }

    for (const [teamLeaderWindow] of teamWindowsWithGroup) {
      await teamLeaderWindow.setForeground()
      await clickGamePoint('换线', 'huanXian', {
        randomPixNums: [3, 3],
        callback: async () => {
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/jinRu.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/huanXian_${randomName()}.jpg`)
          await screenCaptureToFile(tempCapturePath)
          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          return found
        },
      })
      robotUtils.keyTap('enter')
      await sleep(3000)
    }
  }

  await gouMaiYaoPin()

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
