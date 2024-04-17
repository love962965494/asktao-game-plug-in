import { sleep } from '../../../utils/toolkits'
import GameWindowControl from '../../../utils/gameWindowControll'
import { getGameWindows } from '../../../utils/systemCotroll'
import { hasGameTask } from '../gameTask'
import { AsyncQueue, moveMouseToBlank } from '../../../utils/common'
import { getCurrentCity, goToNPC, goToNPCAndTalk, talkToNPC } from '../npcTasks'
import { ipcMain } from 'electron/main'
import { buChongZhuangTai, keepZiDong } from '../zhanDouTasks'
import robotUtils from '../../../utils/robot'

export async function registerQuanMinShuaDao() {
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
    queue.enqueue(async () => await buChongZhuangTai(true))
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

  setInterval(() => {
    queue.enqueue(async () => {
      for (const teamLeaderWindow of teamLeaderWindows) {
        await teamLeaderWindow?.setForeground()
        await moveMouseToBlank()
        const hasTask = await hasGameTask('伏魔任务')

        if (!hasTask) {
          await buChongZhuangTai()
          await teamLeaderWindow?.setForeground()
          await goToNPC('轩辕庙', 'luYaZhenRen')
          await sleep(500)
          await talkToNPC('轩辕庙', 'luYaZhenRen', 'woZheJiuQu')
        }
      }
    })
  }, 3.2 * 60 * 1000)

  setInterval(() => {
    queue.enqueue(async () => await keepZiDong())
  }, 1.8 * 60 * 1000)

  setInterval(() => {
    queue.enqueue(async () => await buChongZhuangTai())
  }, 0.5 * 60 * 1000)
}

export async function quanMinShengJi() {
  await getGameWindows()
  const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
  const teamIndexes = [1].concat(gameWindows.length > 5 ? [2] : [])
  const queue = new AsyncQueue()
  const teamLeaderWindows: GameWindowControl[] = []

  for (const teamIndex of teamIndexes) {
    const [teamLeaderWindow] = await GameWindowControl.getTeamWindowsWithSequence(teamIndex)
    teamLeaderWindows.push(teamLeaderWindow!)
  }

  for (const teamLeaderWindow of teamLeaderWindows) {
    await teamLeaderWindow.setForeground()
    let city = await getCurrentCity()
    if (city !== '东海渔村') {
      robotUtils.keyTap('f1')
      await sleep(500)
      await goToNPCAndTalk({
        npcName: 'jieYinDaoTong',
        intervalTime: 1,
        conversition: 'woYaoHuiTianYongChengBanXieShi',
        gameWindow: teamLeaderWindow,
      })
      await sleep(1000)
      await goToNPCAndTalk({
        city: '天墉城',
        npcName: 'cheFu',
        conversition: 'songWoQuDongHaiYuCun',
        gameWindow: teamLeaderWindow,
      })
      await sleep(1000)
    }

    // 去东海渔村
    await goToNPCAndTalk({
      city: '东海渔村',
      npcName: 'liuRuYan',
      conversition: '[quanMinShengJi]ZiDongChuanSong',
      gameWindow: teamLeaderWindow,
    })
  }

  setInterval(() => {
    queue.enqueue(async () => {
      for (const teamLeaderWindow of teamLeaderWindows) {
        await teamLeaderWindow.setForeground()
        robotUtils.keyTap('enter')
        await sleep(500)  
      }
    })
  }, 2 * 60 * 1000)

  setInterval(() => {
    queue.enqueue(async () => await keepZiDong())
  }, 1 * 60 * 1000)
}
