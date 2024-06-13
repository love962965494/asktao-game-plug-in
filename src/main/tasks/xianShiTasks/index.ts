import { ipcMain } from 'electron'
import { baiBaoFanPai } from './baiBaoFanPai'
import yuWaiFengYun from './yuWaiFengYun'

export async function registerXianShiHuoDong() {
  ipcMain.on('bai-bao-fan-pai', async () => baiBaoFanPai())
  ipcMain.on('yu-wai-feng-yun', async () => yuWaiFengYun())
}