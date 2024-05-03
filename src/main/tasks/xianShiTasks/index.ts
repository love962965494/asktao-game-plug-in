import { ipcMain } from 'electron'
import { baiBaoFanPai } from './baiBaoFanPai'

export async function registerXianShiHuoDong() {
  ipcMain.on('bai-bao-fan-pai', async () => baiBaoFanPai())
}