import { globalShortcut } from 'electron'
import GameWindowControl from '../utils/gameWindowControll'

export function registerGlobalShortcut() {
  for (let i = 0; i < 9; i++) {
    globalShortcut.register(`CommandOrControl+Alt+num${i}`, () => {
      const instance = [...GameWindowControl.getAllGameWindows().values()][i]
      const alternateWindow = GameWindowControl.getAlternateWindow()
      if (instance) {
        const { left, top } = instance.getBounds()

        alternateWindow.setPosition(left, top)
        alternateWindow.show()
      }
    })
  }

  globalShortcut.register('CommandOrControl+Alt+Enter', () => {
    const alternateWindow = GameWindowControl.getAlternateWindow()

    alternateWindow.hide()
  })
}

export function unregisterGloableShortcut() {
  globalShortcut.unregisterAll()
}
