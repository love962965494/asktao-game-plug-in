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
import { gameWindows, getGameWindows } from '../../../utils/systemCotroll'
import path from 'path'
import { randomName, randomPixelNum, sleep } from '../../../utils/toolkits'
import { ipcMain } from 'electron'
import robotUtils from '../../../utils/robot'
import {
  extractThemeColors,
  findImagePositionsWithErrorHandle,
  findImageWithinTemplate,
  paddleOcr,
  screenCaptureToFile,
} from '../../../utils/fileOperations'
import { displayGameWindows, getTeamsInfo, isGroupedTeam, liDui, yiJianZuDui } from '../basicTasks'
import { escShouCangTasks } from '../gameTask'
import { goToNPCAndTalk, hasGoneToNPC, talkToNPC } from '../npcTasks'
import { isInBattle, isInBattle_1, waitFinishZhanDou } from '../zhanDouTasks'
import { chiXiang } from '../wuPinTask'
import commonConfig from '../../../constants/config.json'
import { monitorGameDiaoXian } from '../monitorTask'
import { waKuang } from './waKuang'
import FuShengLu from '../../../constants/fuShengLu.json'
import { xiuLianFaBao } from './xiuLianFaBao'
import { xianJieShenBu } from '../xiuXing/xianJieShenBu'

export async function registerYiJianQianDao() {
  ipcMain.on('yi-jian-qian-dao', async () => yiJianQianDao())
  ipcMain.on('yi-jian-ri-chang', async () => yiJianRiChang())
  ipcMain.on('wa-kuang', async () => waKuang())
  ipcMain.on('xiu-lian-fa-bao', async () => xiuLianFaBao())
  ipcMain.on('shi-men-ren-wu', async () => shiMenRenWu())
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
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('wuLeiLing')}.jpg`)
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
  let hasFoundHuoDongTask = false
  {
    const templateImagePath = path.join(pythonImagesPath, `GUIElements/taskRelative/huoDongTask.jpg`)
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('huoDongTask')}.jpg`)
    await screenCaptureToFile(
      tempCapturePath,
    )
    hasFoundHuoDongTask = await findImageWithinTemplate(tempCapturePath, templateImagePath)
  }
  await clickGamePoint(hasFoundHuoDongTask ? '收藏任务_2' : '收藏任务_1', 'wuLeiLing', {
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

  // 删除所有邮件
  {
    await clickGamePoint('浮生录_全选', 'fuShengLuQuanXuan', {
      callback: async () => true,
    })
    await sleep(500)
    await clickGamePoint('浮生录_删除', 'fuShengLuShanChu', {
      callback: async () => true,
    })
    await sleep(500)
    await clickGamePoint('换线', 'huanXian', {
      randomPixNums: [3, 3],
      callback: async () => {
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/jinRu.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('huanXian')}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        return found
      },
    })
    robotUtils.keyTap('enter')
    await sleep(3000)
  }

  robotUtils.keyTap('B', ['control'])
  await sleep(500)
  robotUtils.keyTap('N', ['alt'])
  await sleep(500)

  // 找到邮件
  {
    const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/haoXiang.jpg')
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('fuShengLu1')}.jpg`)
    const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
    if (position.length === 0) {
      return
    }
    await moveMouseToAndClick(
      '',
      {
        buttonName: 'fuShengLu2',
        position,
        size: [72, 36],
      },
      {
        callback: async function () {
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/fuShengLu.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('fuShengLu2')}.jpg`)
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
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('fuShengLu3')}.jpg`)
    const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath)
    await moveMouseToAndClick(
      '',
      {
        buttonName: 'fuShengLuLvZi',
        position,
        size: [102, 36],
      },
      {
        callback: async function () {
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/chaKan.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('fuShengLu4')}.jpg`)
          await screenCaptureToFile(tempCapturePath)
          const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

          return found
        },
      }
    )
  }

  {
    const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/fuShengLuDuiHuaKuang.jpg')
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('fuShengLu5')}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

    if (!found) {
      return
    }
  }

  // 打开对话框
  {
    await clickGamePoint('浮生录', 'fuShengLu6', {
      callback: async () => {
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/hasGoneToNPC.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('fuShengLu7')}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        return found
      },
    })

    // 判断是否需要物品
    const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/zuiJinJiYong.jpg')
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('fuShengLu8')}.jpg`)
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
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('fuShengLu9')}.jpg`)
    await screenCaptureToFile(tempCapturePath, [left + position[0], top + position[1]], size)
    const [name] = await paddleOcr(tempCapturePath)
    const fuShengLuName = matchStrings(name, Object.keys(FuShengLu))
    writeLog('浮生录', `${gameWindow.roleInfo.roleName}: ${fuShengLuName}`)
    await gameWindow.maximizGameWindow()
    const [first, second] = FuShengLu[fuShengLuName as keyof typeof FuShengLu]
    await clickGamePoint(`浮生录_${first}`, 'fuShengLu10')
    await sleep(2000)
    await clickGamePoint(`浮生录_${second}`, 'fuShengLu11')
    await sleep(2000)
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
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('openFuLiCenter1')}.jpg`)
    fuLiTuBiaoPosition = await findImagePositionsWithErrorHandle(tempCapturePath, fuLiTemplateImagePath)
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
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('openFuLiCenter2')}.jpg`)
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
  const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('meiRiBiLing')}.jpg`)
  await screenCaptureToFile(tempCapturePath)
  const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

  if (!found) {
    return
  }

  await clickGamePoint('每日必领_一键领取', 'meiRiBiLing_YiJianLingQu', {
    callback: async () => {
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('yiJianZuDui')}.jpg`)
      await screenCaptureToFile(tempCapturePath, [870, 475], [100, 20])

      const colors = await extractThemeColors(tempCapturePath)

      if (colors.includes('#e6c8')) {
        return true
      }

      return false
    },
  })
}

export async function bangPaiZuDui() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]

  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    const isGrouped = await isGroupedTeam(gameWindow)
    if (isGrouped) {
      await liDui()
      await sleep(500)
    }
    robotUtils.keyTap('f1')
    await sleep(1000)
    await goToNPCAndTalk({
      npcName: 'jieYinDaoTong',
      conversition: 'woYaoHuiBangPaiZongTanBangXieShi',
      gameWindow,
    })
    await sleep(500)
    await robotUtils.keyTap('enter')
    await sleep(1000)
  }

  for (const gameWindow of gameWindows) {
    if (gameWindow.roleInfo.defaultTeamLeader) {
      await gameWindow.setForeground()
      await yiJianZuDui(gameWindow.roleInfo.roleName)
      await sleep(1000)
    }
  }
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
    robotUtils.keyTap('E', ['control'])
    await sleep(500)
    robotUtils.keyTap('2', ['control'])
    await meiRiBiLing()
    await fuShengLu(gameWindow)
  }

  await bangPaiZuDui()

  for (const gameWindow of gameWindows) {
    if (gameWindow.roleInfo.defaultTeamLeader) {
      await gameWindow.setForeground()
      robotUtils.keyTap('f1')
      await sleep(1000)
    }
  }

  for (const gameWindow of gameWindows) {
    await gameWindow.setForeground()
    await wuLeiLing()
  }

  await displayGameWindows()
}

// 每日日常
const riChangTasks_ZuDui = [
  '收藏任务_五人副本',
  '收藏任务_仙宠大逃亡',
  '收藏任务_二十八星宿',
  '收藏任务_帮派日常挑战',
  '收藏任务_沙漠商队',
  '收藏任务_阵营任务',
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
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('meiRiRiChang_ZuDui')}.jpg`)
        await screenCaptureToFile(tempCapturePath)

        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)
        return found
      },
      randomPixNums: [5, 2],
    })
    await sleep(500)

    // if (commonConfig.danDuTongTianTa) {
    //   const isChecked = await hasChecked('收藏任务_通天塔')

    //   if (isChecked) {
    //     await clickGamePoint('收藏任务_通天塔', 'meiRiRiChang_tongTianTa', {
    //       randomPixNums: [5, 2],
    //     })
    //   }
    // }

    // for (const task of riChangTasks_ZuDui.concat(commonConfig.danDuTongTianTa ? [] : ['收藏任务_通天塔'])) {
    //   const isChecked = await hasChecked(task)

    //   if (!isChecked) {
    //     await clickGamePoint(task, 'meiRiRiChang_ZuDui', {
    //       randomPixNums: [5, 2],
    //     })
    //   }
    // }

    await clickGamePoint('收藏任务_一键自动', 'meiRiRiChang_ZuDui')
    await sleep(3 * 1000)
    robotUtils.keyTap('enter')
  }
}

const riChangTasks_DanRen = ['收藏任务_娃娃训练营', '收藏任务_师门任务', '收藏任务_门派试炼', '收藏任务_助人为乐']
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
          const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('meiRiRiChang_DanRen')}.jpg`)
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
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('shiMen')}.jpg`)
        await screenCaptureToFile(tempCapturePath)
        const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

        if (found) {
          hasFoundQianMianGuai[teamWindow.roleInfo.roleName] = true
          robotUtils.keyTap('f1')
          await sleep(200)
          robotUtils.keyTap('f1')
          await writeLog('师门任务', `${teamWindow.roleInfo.roleName}`)

          // 发现千面怪，取消师门任务，继续执行其他任务
          robotUtils.keyTap('B', ['control'])
          await sleep(1000)
          robotUtils.keyTap('escape')
          await sleep(1000)
          await clickGamePoint('收藏任务_图标', 'meiRiRiChang_ZuDui', {
            callback: async () => {
              const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/ziDongRenWuPeiZhi.jpg')
              const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('meiRiRiChang_DanRen')}.jpg`)
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
          // 取消师门任务
          await clickGamePoint('收藏任务_师门任务', 'meiRiRiChang_ZuDui',{
            randomPixNums: [5, 2],
          })
          await clickGamePoint('收藏任务_一键自动', 'meiRiRiChang_ZuDui')
        }
        await sleep(500)
      }
    }
  }
}

export async function shiMenRenWu() {
  await getGameWindows()
  const allGameWindows = [...(await GameWindowControl.getAllGameWindows().values())]
  const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/qianMianGuai.jpg')
  const hasFoundQianMianGuai = {} as { [key: string]: boolean }

  writeLog('师门任务', '', true)
  while (true) {
    for (const gameWindow of allGameWindows) {
      if (hasFoundQianMianGuai[gameWindow.roleInfo.roleName]) {
        continue
      }
      await gameWindow.setForeground()
      const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('shiMen')}.jpg`)
      await screenCaptureToFile(tempCapturePath)
      const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

      if (found) {
        hasFoundQianMianGuai[gameWindow.roleInfo.roleName] = true
        robotUtils.keyTap('f1')
        await sleep(200)
        robotUtils.keyTap('f1')
        writeLog('师门任务', `${gameWindow.roleInfo.roleName}`)
      }
      await sleep(500)
    }
  }
}

export async function xianJieTongJi(taiXuanZhenJun = false) {
  const teamWindowsWithGroup = await getTeamsInfo()

  for (const [teamLeaderWindow] of teamWindowsWithGroup) {
    await teamLeaderWindow.setForeground()
    await escShouCangTasks('quanMinShuaDao', true)
    await hasGoneToNPC(teamLeaderWindow)
    if (taiXuanZhenJun) {
      await goToNPCAndTalk({
        city: '南天门',
        npcName: 'taiXuanZhenJun',
        conversition: 'haoAWoZheJiuQu',
        gameWindow: teamLeaderWindow,
      })
    } else {
      await goToNPCAndTalk({
        city: '无名小镇',
        npcName: 'yuJianShangRen',
        conversition: 'haoANaWoJiuZouYiTang',
        gameWindow: teamLeaderWindow,
      })
    }

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
    const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('gouMaiYaoPin')}.jpg`)
    const position = await findImagePositionsWithErrorHandle(tempCapturePath, templateImagePath, {
      position: [1147, 226],
      size: [510, 640],
    })
    await moveMouseToAndClick(
      templateImagePath,
      {
        buttonName: 'gouMaiYaoPin',
        position,
        size: [371, 34],
      },
      { quicklyClick: true }
    )
    await hasGoneToNPC(teamLeaderWindow)
    await talkToNPC('无名小镇', 'wuMingYaoPuLaoBan', 'maiMai', undefined, 100)
    await sleep(500)
    await clickGamePoint('批量购买', 'piLiangGouMai', {
      callback: async (errorCounts: number) => {
        if (errorCounts > 3) {
          return true
        }
        const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/gouMaiYaoPin.jpg')
        const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('piLiangGouMai1')}.jpg`)
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
        callback: async (errorCounts: number) => {
          if (errorCounts > 10) {
            await writeLog(
              'errorCountsLog',
              `
              ${teamMemberWindow.roleInfo.roleName}: 
              function: gouMaiYaoPin
              gamePoint: 批量购买
              buttonName: piLiangGouMai
            `
            )

            return true
          }
          const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/gouMaiYaoPin.jpg')
          const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('piLiangGouMai2')}.jpg`)
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

export async function yiJianRiChang(needGouMaiYaoPin = true) {
  const teamWindowsWithGroup = await getTeamsInfo()
  monitorGameDiaoXian()

  for (const teamWindows of teamWindowsWithGroup) {
    for (const teamWindow of teamWindows) {
      await teamWindow.setForeground()
      robotUtils.keyTap('E', ['control'])
      await sleep(500)
      robotUtils.keyTap('2', ['control'])
      await sleep(1000)
    }
  }
  if (commonConfig.needShuaDao) {
    const currentHour = new Date().getHours()
    if ((currentHour >= 20 && currentHour < 24) || (currentHour >= 0 && currentHour < 2)) {
      await xianJieTongJi(commonConfig.taiXuanZhenJun)
      await sleep(4 * 60 * 60 * 1000)

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
            const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName('huanXian')}.jpg`)
            await screenCaptureToFile(tempCapturePath)
            const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

            return found
          },
        })
        robotUtils.keyTap('enter')
        await sleep(3000)
      }
    }
  } else {
    await new Promise<void>((resolve, reject) => {
      async function _loop() {
        const currentHour = new Date().getHours()
        if (currentHour <= 22) {
          resolve()
        } else {
          setTimeout(() => {
            _loop()
          }, 5 * 60 * 1000)
        }
      }

      _loop()
    })
  }

  if (needGouMaiYaoPin) {
    await gouMaiYaoPin()
    await sleep(3000)
  }

  await meiRiRiChang_ZuDui()

  // await new Promise((resolve) => {
  //   let hasFinished: { [key: string]: boolean } = {}
  //   setInterval(async () => {
  //     for (const [teamLeaderWindow] of teamWindowsWithGroup) {
  //       if (hasFinished[teamLeaderWindow.roleInfo.roleName]) {
  //         continue
  //       }
  //       await teamLeaderWindow.setForeground()
  //       const isInBattle1 = await isInBattle_1(teamLeaderWindow)

  //       // 不在战斗中
  //       if (!isInBattle1) {
  //         await sleep(10 * 1000)
          
  //       }
  //     }
  //   }, 5 * 60 * 1000)
  // })

  await sleep(commonConfig.zuDuiTaskTime * 60 * 60 * 1000)

  for (const [teamLeaderWindow] of teamWindowsWithGroup) {
    await waitFinishZhanDou(teamLeaderWindow)
    robotUtils.keyTap('f1')
    await sleep(200)
    robotUtils.keyTap('f1')
  }

  await sleep(5000)

  await xianJieShenBu()

  for (const teamWindows of teamWindowsWithGroup) {
    for (const teamWindow of teamWindows) {
      await teamWindow.setForeground()
      robotUtils.keyTap('B', ['control'])
    }
  }

  await meiRiRiChang_DanRen()
}
