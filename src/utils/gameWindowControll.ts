// const { Window: WindowControl } = require('win-control')
// import WinControl = require('win-control')
import { WinControlInstance, Window as WinControl, WindowStates, HWND, SWP } from 'win-control'

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
    this.gameWindow.setPosition(HWND.NOTOPMOST, 0, 0, 0, 0, SWP.NOMOVE + SWP.NOSIZE)
    this.gameWindow.setShowStatus(WindowStates.SHOWNORMAL)
  }

  getDimensions() {
    return this.gameWindow.getDimensions()
  }
}
