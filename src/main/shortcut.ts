import { globalShortcut } from 'electron'
import GameWindowControl from '../utils/gameWindowControll'

export function registerGlobalShortcut() {
  globalShortcut.register('CommandOrControl+Alt+num1', () => {
    const instance = [...GameWindowControl.getAllGameWindows().values()][0]
    const alternateWindow = GameWindowControl.getAlternateWindow()
    const { left, top } = instance.getBounds()

    alternateWindow.setPosition(left, top)
    alternateWindow.show()
  })
}

export function unregisterGloableShortcut() {
  globalShortcut.unregisterAll()
}
