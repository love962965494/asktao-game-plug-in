import { ipcMain } from 'electron/main'
import yuWaiFengYun from './yuWaiFengYun'

export async function registerShiShiFindTarget() {
  ipcMain.on('yu-wai-feng-yun', async () => yuWaiFengYun())
}
