import { ipcMain } from 'electron'
import robot from 'robotjs'
import GameWindowControl from '../../utils/gameWindowControll'

export function registerMouseTasks() {
  ipcMain.handle('get-mouse-pos', async () => {
    const { x, y } = robot.getMousePos()

    return { x, y }
  })

  ipcMain.on('move-mouse', (_event, option: { x: number; y: number; speed?: number }) => {
    const { x, y, speed } = option

    robot.moveMouseSmooth(x, y, speed)
  })

  ipcMain.handle('get-game-point', async (_event, pid: number) => {
    const instance = new GameWindowControl(pid)
    const {
      bounds: { left, top },
    } = instance
    const { x, y } = robot.getMousePos()

    return { x, y, left, top }
  })
}
