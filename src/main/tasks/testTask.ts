import { ipcMain } from 'electron'
import { teamLeaderByTurn } from './basicTasks'

export function registerTestTasks() {
  ipcMain.on('test-team-leader-by-turn', teamLeaderByTurn)
}
