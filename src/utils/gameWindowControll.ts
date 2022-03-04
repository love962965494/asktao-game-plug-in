import { HWND, SWP, WinControlInstance, Window as WinControl, WindowStates } from 'win-control'
import robot from 'robotjs'
import { BrowserWindow, screen } from 'electron'
import path from 'path'
import { mainPath, rendererPath } from '../paths'
import { Directions } from '../constants/types'
import { ExecuteTaskRoleInfo } from 'main/tasks/testTask'

const gameWindows = new Map<number, GameWindowControl>()
let alternateWindow: BrowserWindow

type IBounds = {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * 获取真正的坐标信息
 */
function getBoundsAndScaleFactor(bounds: IBounds): IBounds & { scaleFactor: number } {
  let { left, top, right, bottom } = bounds
  // TODO: 目前只处理只有最多两块显示器的情形，因为没有更多显示器用于测试，暂不考虑
  const [screen1, screen2] = screen.getAllDisplays()
  const subScreen = screen1.bounds.x === 0 && screen1.bounds.y === 0 ? screen2 : screen1
  const {
    scaleFactor: mainScaleFactor,
    bounds: { width: mainWidth, height: mainHeight },
  } = screen.getPrimaryDisplay()
  const {
    scaleFactor: subScaleFactor,
    bounds: { width: subWidth, height: subHeight, x: subX, y: subY },
  } = subScreen
  let direction: Directions
  let scaleFactor: number

  if (left < mainWidth && top < mainHeight && left >= 0 && top >= 0) {
    // 目标窗口在主屏上
    direction = Directions.Middle
  } else if (subX === mainWidth) {
    direction = Directions.Right
  } else if (subX === -subWidth) {
    direction = Directions.Left
  } else if (subY === mainHeight) {
    direction = Directions.Bottom
  } else {
    direction = Directions.Top
  }

  /**
   *  (0, 0)                                   (1536, -216)
   *       . x x x x x x x x x x x x x x x x . . x x x x x x x x x x x x x x x .
   *       y                                 y y                               y
   *       y                                 y y                               y
   *       y                                 y y                               y
   *       y                                 y y                               y
   *       y         main: 1920, 1080        y y          sub: 1920, 1080      y
   *       y        scale: 125%              y y        scale: 100%            y
   *       y  actual size: 1536, 864         y y  actual size: 1920, 1080      y
   *       y                                 y y                               y
   *       y                                 y y                               y
   *       y                                 y y                               y
   *       y                                 y y                               y
   *       . x x x x x x x x x x x x x x x x . . x x x x x x x x x x x x x x x .
   *                               (1536, 864)
   *
   *       以副屏在主屏右边为例
   *       通过screen.getAllDisplays()得到的副屏左上角坐标为(1536, -216)[(mainActualWidth, mainActualHeight - subActualHeight)]
   *       通过getDimensions得到的副屏左上角坐标为(1920, 0)[(mainWidth, 0)]
   *       所以计算视口在副屏实际的位置公式就是：
   *       left = mainActualWidth + (left - mainWidth) / subScaleFactor
   *       top = (mainActualHeight - subActualHeight + top) / subScaleFactor
   */
  switch (direction) {
    case Directions.Middle: {
      scaleFactor = mainScaleFactor
      left = left / mainScaleFactor
      top = top / mainScaleFactor
      right = right / mainScaleFactor
      bottom = bottom / mainScaleFactor
      break
    }
    case Directions.Right: {
      scaleFactor = subScaleFactor
      left = subX + (left - mainWidth * mainScaleFactor) / subScaleFactor
      top = subY + top / subScaleFactor
      right = subX + (right - mainWidth * mainScaleFactor) / subScaleFactor
      bottom = subY + bottom / subScaleFactor
      break
    }
    case Directions.Left: {
      scaleFactor = subScaleFactor
      left = subX + (left + subWidth * subScaleFactor) / subScaleFactor
      top = subY + top / subScaleFactor
      right = subX + (right + subWidth * subScaleFactor) / subScaleFactor
      bottom = subY + bottom / subScaleFactor
      break
    }
    case Directions.Top: {
      scaleFactor = subScaleFactor
      left = subX + left / subScaleFactor
      top = subY + (top + subHeight * subScaleFactor) / subScaleFactor
      right = subX + right / subScaleFactor
      bottom = subY + (bottom + subHeight * subScaleFactor) / subScaleFactor
      break
    }
    case Directions.Bottom: {
      scaleFactor = subScaleFactor
      left = subX + left / subScaleFactor
      top = subY + (top - mainHeight * mainScaleFactor) / subScaleFactor
      right = subX + right / subScaleFactor
      bottom = subY + (bottom - mainHeight * mainScaleFactor) / subScaleFactor
      break
    }
  }

  return {
    left: Math.round(left),
    top: Math.round(top),
    right: Math.round(right),
    bottom: Math.round(bottom),
    scaleFactor,
  }
}

export default class GameWindowControl {
  public gameWindow!: WinControlInstance
  /**
   * 记录当前窗口对应的角色信息
   */
  public roleInfo?: ExecuteTaskRoleInfo
  #bounds!: IBounds
  #scaleFactor!: number

  constructor(public pid: number) {
    const instance = gameWindows.get(pid)
    const alternateWindow = GameWindowControl.getAlternateWindow()

    if (instance) {
      const { left, right, top, bottom } = instance.getBounds(true)
      // 每次访问实例后，都让alternateWindow定位并覆盖它
      alternateWindow.setBounds({
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
      })

      alternateWindow.show()

      return instance
    }

    this.pid = pid
    this.gameWindow = WinControl.getByPid(pid)

    this.showGameWindow()
    const bounds = this.getDimensions()
    const { left, top, right, bottom, scaleFactor } = getBoundsAndScaleFactor(bounds)
    this.#bounds = { left, top, right, bottom }
    this.#scaleFactor = scaleFactor

    // 每次新建实例后，都让alternateWindow定位并覆盖它
    alternateWindow.setBounds({
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    })

    gameWindows.set(pid, this)
  }

  static getAllGameWindows() {
    return gameWindows
  }

  /**
   * 根据游戏账号查找对应的游戏窗口
   */
  static getGameWindowByAccount(account: string) {
    if (!account) {
      return null
    }
    const windows = [...gameWindows.values()]
    const window = windows.find((item) => item.roleInfo?.account === account)

    return window
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
        backgroundColor: '#456',
        // transparent: true,
      })

      alternateWindow.loadFile(path.resolve(rendererPath, 'subWindow.html'))
    }

    return alternateWindow
  }

  showGameWindow() {
    this.gameWindow.setShowStatus(WindowStates.SHOWNORMAL)
    this.gameWindow.setPosition(HWND.TOP, 0, 0, 0, 0, SWP.NOMOVE + SWP.NOSIZE)
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
      const tempBounds = this.getDimensions()
      const { scaleFactor, ...bounds } = getBoundsAndScaleFactor(tempBounds)

      this.#bounds = bounds
    }

    return this.#bounds
  }

  /**
   * 获取窗口所在屏幕的屏幕缩放比
   */
  getScaleFactor(reCompute?: boolean) {
    if (reCompute) {
      const bounds = this.getDimensions()
      const { scaleFactor } = getBoundsAndScaleFactor(bounds)

      this.#scaleFactor = scaleFactor
    }

    return this.#scaleFactor
  }

  /**
   * 设置窗口位置
   */
  setPosition(x: number, y: number) {
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

  getRoleInfo() {
    return this.roleInfo
  }

  setRoleInfo(roleInfo: ExecuteTaskRoleInfo) {
    this.roleInfo = roleInfo
  }
}
