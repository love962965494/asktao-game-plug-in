import { Point } from '../../constants/types'
import { ipcMain, IpcMainInvokeEvent } from 'electron'
import robot from 'robotjs'
import GamePointList from '../../constants/GamePointList.json'
import GameWindowControl from '../../utils/gameWindowControll'

const YouDaoPid = 10272

async function handleYouDaoOperation(_event: IpcMainInvokeEvent, name: string) {
  const instance = new GameWindowControl(YouDaoPid)
  instance.showGameWindow()
  const alternateWindow = GameWindowControl.getAlternateWindow()
  const { left, top } = instance.getDimensions()
  const { left: trueLeft, top: trueTop } = instance.getBounds()
  const scaleFactor = instance.getScaleFactor()
  const { x, y } = GamePointList.find((item) => item.tag === '有道词典')?.pointList.find((item) => item.name === name)
    ?.point!

  // 不同的软件根据屏幕分辨率所作的处理都不相同
  // 需要确定窗口大小和屏幕分辨率之间的关系后，来决定最后的坐标位置
  const mouseLeft = left + x * scaleFactor
  const mouseTop = top + y * scaleFactor

  alternateWindow.setPosition(trueLeft, trueTop)
  alternateWindow.show()
  robot.moveMouseSmooth(mouseLeft, mouseTop)
  alternateWindow.hide()
  robot.mouseClick()
  alternateWindow.show()
}

export function registerTestTasks() {
  ipcMain.on('alternate-window-click', () => {
    const alternateWindow = GameWindowControl.getAlternateWindow()
    alternateWindow.hide()
    robot.mouseClick()
    alternateWindow.show()
  })

  ipcMain.on('set-position', (_event, pos: Point) => {
    const instance = GameWindowControl.getAllGameWindows().get(YouDaoPid)!

    instance.setPosition(pos.x, pos.y)
  })
}
