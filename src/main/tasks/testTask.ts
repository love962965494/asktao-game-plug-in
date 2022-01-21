import { Point } from '../../constants/types'
import { ipcMain } from 'electron'
import robot from 'robotjs'

export function registerTestTasks() {
  ipcMain.on('test-task', (_event, [{ x: x1, y: y1 }, { x: x2, y: y2 }]: Point[]) => {
    robot.moveMouseSmooth(x1, y1)
    robot.mouseClick()
    robot.keyTap('numpad_1')

    robot.moveMouseSmooth(x2, y2)
    robot.mouseClick()
    robot.setMouseDelay(100)
    robot.mouseClick()
    robot.keyTap('numpad_2')

    robot.moveMouseSmooth(x1, y1)
    robot.mouseClick()
    robot.keyTap('numpad_3')

    robot.moveMouseSmooth(x2, y2 - 60)
    robot.mouseClick()
    robot.setMouseDelay(100)
    robot.mouseClick()
    robot.keyTap('numpad_4')

    robot.moveMouseSmooth(x1, y1)
    robot.mouseClick()
    robot.keyTap('numpad_5')

    robot.moveMouseSmooth(x2, y2 -60) 
    robot.mouseClick()
    robot.setMouseDelay(100)
    robot.mouseClick()
    robot.keyTap('numpad_6')
  })
}
