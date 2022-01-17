import { WinControlInstance, Window as WinControl, WindowStates, HWND, SWP } from 'win-control'
import robot from 'robotjs'
import { BrowserWindow, screen } from 'electron'
import path from 'path'
import { rendererPath } from '../paths'

const gameWindows = new Map<number, GameWindowControl>()

export default class GameWindowControl {
  public gameWindow!: WinControlInstance
  public alternateWindow!: BrowserWindow

  constructor(public pid: number) {
    const instance = gameWindows.get(pid)

    if (instance) {
      return instance
    }

    this.pid = pid
    this.gameWindow = WinControl.getByPid(pid)

    this.showGameWindow()
    const { left, top, right, bottom } = this.getDimensions()
    const { scaleFactor } = screen.getPrimaryDisplay()

    this.alternateWindow = new BrowserWindow({
      width: (right - left) / scaleFactor,
      height: (bottom - top) / scaleFactor,
      x: left,
      y: top,
      show: true,
      frame: false,
      webPreferences: {
        devTools: true,
      },
      // transparent: true,
    })

    this.alternateWindow.loadFile(path.resolve(rendererPath, 'subWindow.html'))

    gameWindows.set(pid, this)
  }

  getGameWindow() {
    return this.gameWindow
  }

  static getAllGameWindows() {
    return gameWindows
  }

  showGameWindow() {
    // 先把窗口设置到最顶层
    this.gameWindow.setPosition(HWND.NOTOPMOST, 0, 0, 0, 0, SWP.NOMOVE + SWP.NOSIZE)
    // 再设置窗口显示
    this.gameWindow.setShowStatus(WindowStates.SHOWNORMAL)
  }

  getDimensions() {
    return this.gameWindow.getDimensions()
  }

  /**
   * @returns img: 截图文件; density: 屏幕分辨率;
   */
  getCapture(x: number, y: number, width: number = 10, height: number = 10) {
    // 先展示窗口
    this.showGameWindow()
    robot.moveMouseSmooth(x, y)
    const img = robot.screen.capture(x, y, width, height)
    // 对于屏幕分辨率高的设备，先获取分辨率
    const density = img.width / width

    return { img, density }
  }
}
