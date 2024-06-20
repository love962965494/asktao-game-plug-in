import { ipcMain } from 'electron'
import { baiBaoFanPai } from './baiBaoFanPai'
import yuWaiFengYun from './yuWaiFengYun'
import tianXuMiFu from './tianXuMiFu'
import { huangJinLuoPanLoop } from './huangJinLuoPan'

export async function registerXianShiHuoDong() {
  ipcMain.on('bai-bao-fan-pai', async () => baiBaoFanPai())
  ipcMain.on('yu-wai-feng-yun', async () => yuWaiFengYun())
  ipcMain.on('tian-xu-mi-fu', async () => tianXuMiFu())
  ipcMain.on('huang-jin-luo-pan', async (_, city) => huangJinLuoPanLoop(city))
}