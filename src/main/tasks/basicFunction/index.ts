import { ipcMain } from 'electron'
import { xunHuanShiChen } from './shiChen'
import { getGameWindows } from '../../../utils/systemCotroll'
import GameWindowControl from '../../../utils/gameWindowControll'
import { ruYiKaiQiGuanBi } from './ruYi'
import robotUtils from '../../../utils/robot'

export async function registerBasicFunction() {
  ipcMain.on('shi-chen-yun-shi', async (_, open: boolean) => xunHuanShiChen(open, true))
  ipcMain.on('ru-yi', async (_, open: boolean) => ruYiKaiQiGuanBi(open))
  ipcMain.on('xun-huan-zi-dong', async (_) => xunHuanZiDong())
}

// 循环保持自动回合
export async function xunHuanZiDong() {
  await getGameWindows()
  const gameWindows = [...(await GameWindowControl.getAllGameWindows().values())]

  function _loop() {
    setTimeout(async () => {
      // await keepZiDong()

      // for (const gameWindow of gameWindows) {
      //   await hasMeetLaoJun(gameWindow)
      // }
      for (const gameWindow of gameWindows) {
        await gameWindow.setForeground()
        robotUtils.keyTap('2', ['control'])
      }
      _loop()
    }, 10 * 1000)
  }

  _loop()
}
