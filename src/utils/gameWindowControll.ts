// const { Window: WindowControl } = require('win-control')
// import WinControl = require('win-control')
import { WinControlInstance, Window as WinControl, WindowStates, HWND, SWP } from 'win-control'
import robot from 'robotjs'

export default class GameWindowControl {
  public gameWindow: WinControlInstance
  constructor(public pid: number) {
    this.pid = pid
    this.gameWindow = WinControl.getByPid(pid)
  }

  getGameWindow() {
    return this.gameWindow
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
