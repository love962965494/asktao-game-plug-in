import { Point } from '../../constants/types'
import { ipcMain } from 'electron'
import robot from 'robotjs'
import GameWindowControl from '../../utils/gameWindowControll'

const YouDaoPid = 10272

export function registerTestTasks() {
  ipcMain.on('alternate-window-click', () => {
    const alternateWindow = GameWindowControl.getAlternateWindow()
    alternateWindow.hide()
    robot.mouseClick()
    alternateWindow.show()
  })

  ipcMain.on('set-position', (_event, pos: Point) => {
    const instance = new GameWindowControl(YouDaoPid)

    instance.setPosition(pos.x, pos.y)
  })

  ipcMain.on('show-window', () => {
    const instance = new GameWindowControl(YouDaoPid)

    instance.showGameWindow()
  })
}
