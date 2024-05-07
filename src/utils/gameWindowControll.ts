import { HWND, SWP, WinControlInstance, Window as WinControl, WindowStates } from 'win-control'
import robot from 'robotjs'
import { BrowserWindow, screen } from 'electron'
import path from 'path'
import { mainPath, pythonImagesPath, rendererPath } from '../paths'
import robotUtils from './robot'
import { randomName, sleep } from './toolkits'
import { findImagePositions, paddleOcr, screenCaptureToFile } from './fileOperations'
import { matchStrings, moveMouseToBlank } from './common'
import { IAccountInfo } from 'constants/types'

const gameWindows = new Map<number, GameWindowControl>()
let alternateWindow: BrowserWindow

type IBounds = {
  left: number
  top: number
  right: number
  bottom: number
}

// interface RoleInfo {
//   roleName: string
//   teamIndex: number
//   accountNum: string
//   lang: 'ch' | 'en'
// }

export default class GameWindowControl {
  public gameWindow!: WinControlInstance
  /**
   * 记录当前窗口对应的角色信息
   */
  public roleInfo!: IAccountInfo & { roleName: string }
  #bounds!: IBounds
  #scaleFactor!: number
  #ziDongZhanDou!: number[]

  constructor(public pid: number, public isLeader: boolean = false) {
    const instance = gameWindows.get(pid)
    const { scaleFactor } = screen.getPrimaryDisplay()

    if (instance) {
      return instance
    }

    this.pid = pid
    this.gameWindow = WinControl.getByPid(pid)
    this.isLeader = isLeader

    this.showGameWindow()
    const title = this.gameWindow.getTitle()
    const roleName = title.split('【')[0]
    const accountsData = global.appContext.accounts
    for (const groupAccountData of accountsData) {
      for (const account of groupAccountData) {
        if (account.roles.includes(roleName)) {
          this.roleInfo = { ...account, roleName}
        }
      }
    }

    const { left, top, right, bottom } = this.getDimensions()
    this.#bounds = { left, top, right, bottom }
    this.#scaleFactor = scaleFactor
    this.#ziDongZhanDou = []

    gameWindows.set(pid, this)
  }

  static getAllGameWindows() {
    return gameWindows
  }

  static getGameWindowsByTeamIndex(teamIndex: number): GameWindowControl[] {
    const gameWindows = GameWindowControl.getAllGameWindows()
    return [...gameWindows.values()].filter(
      (gameWindow: GameWindowControl) => gameWindow.roleInfo.teamIndex === teamIndex
    )
  }

  static getGameWindowByRoleName(roleName: string) {
    const gameWindows = [...GameWindowControl.getAllGameWindows().values()]
    const roleNames = gameWindows.map((gameWindow) => gameWindow.roleInfo.roleName)
    const matchRoleName = matchStrings(roleName, roleNames)
    return gameWindows.find((gameWindow) => gameWindow.roleInfo.roleName === matchRoleName)
  }

  static async getTeamWindowsWithSequence(teamIndex: number) {
    const gameWindows = GameWindowControl.getGameWindowsByTeamIndex(teamIndex)
    // const tempGameWindow = gameWindows.find(gameWindow => gameWindow.roleInfo.defaultTeamLeader)!
    const tempGameWindow = gameWindows[0]

    await tempGameWindow.setForeground()
    await tempGameWindow.restoreGameWindow()
    robotUtils.moveMouseSmooth(0, 0)
    robotUtils.keyTap('B', ['control'])
    await sleep(500)
    robotUtils.keyTap('T', ['alt'])
    await sleep(500)

    // const checked = await hasChecked('经典模式-框框')

    // if (!checked) {
    //   await clickGamePoint('经典模式-未选中', 'getTeamLeader')

    //   await sleep(500)
    // }

    let srcImagePath = path.join(pythonImagesPath, `temp/getTeamLeader_${randomName()}.jpg`)
    const { position, size } = global.appContext.gamePoints['组队-队员姓名']
    const { left, top } = tempGameWindow.getDimensions()
    await screenCaptureToFile(srcImagePath, [left + position[0], top + position[1]], size)
    const names = await paddleOcr(srcImagePath, false, tempGameWindow.roleInfo.lang)
    const teamWindows: GameWindowControl[] = []
    for (const name of names) {
      const teamWindow = GameWindowControl.getGameWindowByRoleName(name)!
      teamWindows.push(teamWindow)
    }

    robotUtils.keyTap('B', ['control'])
    await tempGameWindow.maximizGameWindow()
    await sleep(500)

    return teamWindows
  }

  static getAlternateWindow() {
    if (!alternateWindow) {
      alternateWindow = new BrowserWindow({
        show: true,
        frame: false,
        webPreferences: {
          devTools: false,
          preload: path.join(mainPath, 'preload.js'),
        },
        // backgroundColor: '#456',
        transparent: true,
      })
      const {
        size: { width, height },
      } = screen.getPrimaryDisplay()

      alternateWindow.setBounds({
        x: -400,
        y: -400,
        height: height + 800,
        width: width + 800,
      })
      alternateWindow.loadFile(path.resolve(rendererPath, 'subWindow.html'))
    }

    return alternateWindow
  }

  showGameWindow() {
    this.gameWindow.setShowStatus(WindowStates.SHOWNORMAL)
    this.gameWindow.setPosition(HWND.TOP, 0, 0, 0, 0, SWP.NOMOVE + SWP.NOSIZE)
  }

  async setForeground() {
    this.gameWindow.setForeground()
    await sleep(300)
  }

  hideGameWindow() {
    this.gameWindow.setShowStatus(WindowStates.MINIMIZE)
  }

  closeGameWindow() {
    process.kill(this.pid)
  }

  /**
   * 获取窗口鼠标位置信息
   */
  getDimensions() {
    return this.gameWindow.getDimensions()
  }

  /**
   * 获取窗口实际位置信息，考虑屏幕缩放后的位置
   */
  getBounds(reCompute?: boolean) {
    if (reCompute) {
      const bounds = this.getDimensions()

      this.#bounds = bounds
    }

    return this.#bounds
  }

  /**
   * 获取窗口所在屏幕的屏幕缩放比
   */
  getScaleFactor(reCompute?: boolean) {
    if (reCompute) {
      const { scaleFactor } = screen.getPrimaryDisplay()

      this.#scaleFactor = scaleFactor
    }

    return this.#scaleFactor
  }

  /**
   * 设置窗口位置
   */
  setPosition(x: number, y: number) {
    this.gameWindow.setShowStatus(WindowStates.SHOWNORMAL)
    this.gameWindow.setPosition(HWND.NOTOPMOST, x, y, 0, 0, SWP.NOSIZE)
  }

  setSize(width: number, height: number) {
    this.gameWindow.setPosition(HWND.NOTOPMOST, 0, 0, width, height, SWP.NOMOVE)
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

  // 升为队长
  becomeTeamLeader() {
    const gameWindows = GameWindowControl.getGameWindowsByTeamIndex(this.roleInfo.teamIndex)
    for (const gameWindow of gameWindows) {
      if (this.pid === gameWindow.pid) {
        this.isLeader = true
      } else {
        gameWindow.isLeader = false
      }
    }
  }

  refreshRoleName() {
    const title = this.gameWindow.getTitle()
    const roleName = title.split('【')[0]
    const accountsData = global.appContext.accounts
    for (const groupAccountData of accountsData) {
      for (const account of groupAccountData) {
        if (account.roles.includes(roleName)) {
          this.roleInfo = { ...account, roleName }
        }
      }
    }
  }

  minimizGameWindow() {
    this.gameWindow.setShowStatus(WindowStates.MINIMIZE)
  }

  async maximizGameWindow() {
    this.gameWindow.setShowStatus(WindowStates.MAXIMIZE)
    await sleep(300)
  }

  async restoreGameWindow() {
    this.gameWindow.setShowStatus(WindowStates.RESTORE)
    await sleep(300)
  }

  async getZiDongZhanDouPosition() {
    if (this.#ziDongZhanDou.length > 0) {
      return this.#ziDongZhanDou
    }
    await this.setForeground()
    await moveMouseToBlank()
    robotUtils.keyTap('B', ['control'])
    await sleep(200)
    const templatePath = path.join(pythonImagesPath, 'GUIElements/common/ziDongZhanDou.jpg')
    const tempCapturePath = path.join(pythonImagesPath, `temp/getZiDongZhanDouPosition_${randomName()}.jpg`)
    await screenCaptureToFile(tempCapturePath)
    const position = await findImagePositions(tempCapturePath, templatePath)

    this.#ziDongZhanDou = position
    return this.#ziDongZhanDou
  }
}
