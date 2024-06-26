import { randomName, sleep } from '../../../utils/toolkits'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import { hasGameTask, searchGameTask } from '../gameTask'
import { AsyncQueue, clickGamePoint, moveMouseToAndClickUseColor, moveMouseToBlank } from '../../../utils/common'
import { goToNPC, talkToNPC } from '../npcTasks'
import { ipcMain } from 'electron/main'
import { buChongZhuangTai, isInBattle_1, keepZiDong } from '../zhanDouTasks'
import robotUtils from '../../../utils/robot'
import path from 'path'
import { pythonImagesPath } from '../../../paths'
import { findImageWithinTemplate, screenCaptureToFile } from '../../../utils/fileOperations'

export async function registerQuanMin() {
  ipcMain.on('chu-yao-ren-wu', async () => chuYaoRenWu())
  ipcMain.on('fu-mo-ren-wu', async () => fuMoRenWu())
  ipcMain.on('quan-min-sheng-ji', async () => quanMinShengJi())
}

export async function chuYaoRenWu() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const teamIndexes = [1].concat(gameWindows.length > 5 ? [2] : [])
  const queue = new AsyncQueue()
  const teamLeaderWindows: GameWindowControl[] = []
  for (const teamIndex of teamIndexes) {
    const [teamLeaderWindow] = await GameWindowControl.getTeamWindowsWithSequence(teamIndex)
    teamLeaderWindows.push(teamLeaderWindow!)
  }
  setInterval(() => {
    queue.enqueue(async () => {
      for (const teamLeaderWindow of teamLeaderWindows) {
        await teamLeaderWindow?.setForeground()
        await moveMouseToBlank()
        const hasTask = await hasGameTask('降妖任务')

        if (!hasTask) {
          await buChongZhuangTai()
          await teamLeaderWindow?.setForeground()
          await goToNPC('天墉城', 'tongLingDaoRen')
          await sleep(500)
          await talkToNPC('天墉城', 'tongLingDaoRen', 'woYuanXieZhuDaoZhangXiangNaYaoGuai')
        }
      }
    })
  }, 3 * 60 * 1000)

  setInterval(() => {
    queue.enqueue(async () => await keepZiDong())
  }, 2 * 60 * 1000)

  setInterval(() => {
    queue.enqueue(async () => await buChongZhuangTai({ needJueSe: true }))
  }, 1 * 60 * 1000)
}

export async function fuMoRenWu() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const teamIndexes = [1].concat(gameWindows.length > 5 ? [2] : [])
  const queue = new AsyncQueue()
  const teamLeaderWindows: GameWindowControl[] = []
  for (const teamIndex of teamIndexes) {
    const [teamLeaderWindow] = await GameWindowControl.getTeamWindowsWithSequence(teamIndex)
    teamLeaderWindows.push(teamLeaderWindow!)
  }

  let hasTask1 = false
  setInterval(() => {
    if (!hasTask1) {
      hasTask1 = true
      queue.enqueue(async () => {
        for (const teamLeaderWindow of teamLeaderWindows) {
          await teamLeaderWindow?.setForeground()
          await moveMouseToBlank()
          const hasTask = await hasGameTask('伏魔任务')
          robotUtils.keyTap('B', ['control'])
          if (!hasTask) {
            await teamLeaderWindow?.setForeground()
            await goToNPC('轩辕庙', 'luYaZhenRen')
            await sleep(500)
            await talkToNPC('轩辕庙', 'luYaZhenRen', 'woZheJiuQu')
          }
        }

        hasTask1 = false
      })
    }
  }, 3.2 * 60 * 1000)

  let hasTask2 = false
  setInterval(() => {
    if (!hasTask2) {
      hasTask2 = true
      queue.enqueue(async () => {
        for (const gameWindow of gameWindows) {
          await gameWindow.setForeground()
          robotUtils.keyTap('2', ['control'])
        }

        hasTask2 = false
      })
    }
  }, 0.2 * 60 * 1000)

  let hasTask3 = false
  setInterval(() => {
    if (!hasTask3) {
      hasTask3 = true
      queue.enqueue(async () => {
        await buChongZhuangTai()
        hasTask3 = false
      })
    }
  }, 1.3 * 60 * 1000)
}

export async function xianJieTongJi() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const teamIndexes = [1].concat(gameWindows.length > 5 ? [2] : [])
  const queue = new AsyncQueue()
  const teamLeaderWindows: GameWindowControl[] = []
  for (const teamIndex of teamIndexes) {
    const [teamLeaderWindow] = await GameWindowControl.getTeamWindowsWithSequence(teamIndex)
    teamLeaderWindows.push(teamLeaderWindow!)
  }

  let hasTask1 = false
  setInterval(() => {
    if (!hasTask1) {
      hasTask1 = true
      queue.enqueue(async () => {
        for (const teamLeaderWindow of teamLeaderWindows) {
          await teamLeaderWindow?.setForeground()
          await moveMouseToBlank()
          const hasTask = await hasGameTask('仙界通缉')

          if (!hasTask) {
            await teamLeaderWindow?.setForeground()
            await goToNPC('无名小镇', 'yuJianShangRen')
            await sleep(500)
            await talkToNPC('无名小镇', 'yuJianShangRen', 'haoANaWoJiuZouYiTang')
          }
        }

        hasTask1 = false
      })
    }
  }, 3.2 * 60 * 1000)

  let hasTask2 = false
  setInterval(() => {
    if (!hasTask2) {
      hasTask2 = true
      queue.enqueue(async () => {
        for (const gameWindow of gameWindows) {
          await gameWindow.setForeground()
          robotUtils.keyTap('2', ['control'])
        }
        hasTask2 = false
      })
    }
  }, 0.2 * 60 * 1000)

  let hasTask3 = false
  setInterval(() => {
    if (!hasTask3) {
      hasTask3 = true
      queue.enqueue(async () => {
        await buChongZhuangTai({ needJueSe: true })
        hasTask3 = false
      })
    }
  }, 1.3 * 60 * 1000)
}

export async function quanMinShengJi() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const queue = new AsyncQueue()
  const teamLeaderWindows: GameWindowControl[] = []

  for (const gameWindow of gameWindows) {
    if (gameWindow.roleInfo.defaultTeamLeader) {
      teamLeaderWindows.push(gameWindow)
    }
  }

  // for (const teamLeaderWindow of teamLeaderWindows) {
  //   await teamLeaderWindow.setForeground()
  //   let city = await getCurrentCity()
  //   if (city !== '东海渔村') {
  //     robotUtils.keyTap('f1')
  //     await sleep(500)
  //     await goToNPCAndTalk({
  //       npcName: 'jieYinDaoTong',
  //       conversition: 'woYaoHuiTianYongChengBanXieShi',
  //       gameWindow: teamLeaderWindow,
  //     })
  //     await sleep(1000)
  //     await goToNPCAndTalk({
  //       city: '天墉城',
  //       npcName: 'cheFu',
  //       conversition: 'songWoQuDongHaiYuCun',
  //       gameWindow: teamLeaderWindow,
  //     })
  //     await sleep(1000)
  //   }

  //   // 去东海渔村
  //   await goToNPCAndTalk({
  //     city: '东海渔村',
  //     npcName: 'liuRuYan',
  //     conversition: '[quanMinShengJi]ZiDongChuanSong',
  //     gameWindow: teamLeaderWindow,
  //   })
  // }

  let hasTask1 = false
  setInterval(() => {
    if (!hasTask1) {
      hasTask1 = true

      queue.enqueue(async () => {
        for (const teamLeaderWindow of teamLeaderWindows) {
          await teamLeaderWindow.setForeground()
          robotUtils.keyTap('enter')
          await sleep(500)
        }

        hasTask1 = false
      })
    }
  }, 2 * 60 * 1000)

  let hasTask2 = false
  setInterval(() => {
    if (!hasTask2) {
      hasTask2 = true

      queue.enqueue(async () => {
        for (const gameWindow of gameWindows) {
          await gameWindow.setForeground()
          const inBattle = await isInBattle_1(gameWindow)
          if (inBattle) {
            robotUtils.keyTap('Z', ['alt'])
            await sleep(50)
            robotUtils.keyTap('Z', ['alt'])
          }
        }

        hasTask2 = false
      })
    }
  }, 0.7 * 60 * 1000)
}

export async function jiuYaoShenYou() {
  await getGameWindows()
  const gameWindows = [...(await GameWindowControl.getAllGameWindows().values())]
  const teamLeaderWindows: GameWindowControl[] = gameWindows.filter(
    (gameWindow) => gameWindow.roleInfo.defaultTeamLeader
  )
  while (true) {
    for (const teamLeaderWindow of teamLeaderWindows) {
      await teamLeaderWindow.setForeground()
      const inBattle1 = await isInBattle_1(teamLeaderWindow)
      if (!inBattle1) {
        await sleep(5000)
      } else {
        continue
      }
      const inBattle2 = await isInBattle_1(teamLeaderWindow)
      if (!inBattle2) {
        await searchGameTask('九曜神游')
        await clickGamePoint('九曜神游-NPC', 'jiuYaoShenYou', {
          callback: async () => {
            const tempCapturePath = path.join(pythonImagesPath, `temp/${randomName(`jiuYaoShenYou`)}.jpg`)
            const templateImagePath = path.join(pythonImagesPath, 'GUIElements/common/renWuRiZhi.jpg')
            await screenCaptureToFile(tempCapturePath)
            const found = await findImageWithinTemplate(tempCapturePath, templateImagePath)

            return !found
          },
        })
        await moveMouseToAndClickUseColor(
          {
            buttonName: 'jiuYaoShenYou_duiHua',
            position: [535, 550],
            size: [330, 36],
          },
          '#fa0000'
        )
      }
    }
  }
}
