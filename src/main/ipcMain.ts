import { ipcMain } from 'electron'
import robot from 'robotjs'
import Tesseract from 'tesseract.js'

ipcMain.on('get-mouse-pos', (event) => {
  const { x, y } = robot.getMousePos()

  event.reply('get-mouse-pos', { x, y })
})

ipcMain.on('move-mouse', (_event, { x, y }) => {
  robot.moveMouseSmooth(x, y)
})

ipcMain.on('get-image', (event, { x, y }) => {
  const img = robot.screen.capture(x, y, undefined, 50)

  event.reply('get-image', img)
})
