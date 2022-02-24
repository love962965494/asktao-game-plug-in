import { ipcMain } from 'electron'
import taskConfigs from './taskConfigs'
import { startGameTask, wangyiTask, youdaoTask } from './taskConfigs/testTasks'
import fs from 'fs/promises'
import path from 'path'
import { constantsPath } from '../../paths'
import { GameTaskPlanList } from 'constants/types'
import GameWindowControl from '../../utils/gameWindowControll'

export function registerTestTasks() {
  ipcMain.on('test-youdao', async () => {
    const iterator = youdaoTask()

    do {
      const value = await iterator.next()

      if (value.done) {
        break
      }
    } while (true)
  })

  ipcMain.on('test-wangyi', async () => {
    const iterator = wangyiTask()

    do {
      const value = await iterator.next()

      if (value.done) {
        break
      }
    } while (true)
  })

  ipcMain.on('test-start-game', async () => {
    const iterator = startGameTask()

    do {
      const value = await iterator.next()

      if (value.done) {
        break
      }
    } while (true)
  })

  ipcMain.on('test-start-all', async () => {
    const iterators = [youdaoTask(), wangyiTask(), startGameTask()]
    const allFinished = [false, false, false]

    do {
      for await (const [index, iterator] of iterators.entries()) {
        const value = await iterator.next()

        if (value.done) {
          allFinished[index] = true
        }
      }
    } while (allFinished.filter(Boolean).length !== 3)
  })

  ipcMain.on('test-execute-plan', async (_, taskPlanId: string) => {
    const GameTaskPlanList = JSON.parse(
      await fs.readFile(path.resolve(constantsPath, 'GameTaskPlanList.json'), 'utf-8')
    ) as GameTaskPlanList
    const gameTaskPlan = GameTaskPlanList.find((taskPlan) => taskPlan.id === taskPlanId)!

    const taskFunctions = gameTaskPlan.gameTaskList.reduce<Function[]>((arr, taskGroup) => {
      const taskConfig = taskConfigs.find((config) => config.tag === taskGroup.tag)!
      const functions = taskGroup.taskList
        .filter((taskItem) => taskItem.checked)
        .map((taskItem) => {
          const { taskFunction } = taskConfig.taskList.find(({ taskName }) => taskName === taskItem.taskName)!

          return taskFunction
        })

      return [...arr, ...functions]
    }, [])

    const iterators = taskFunctions.map(func => func())
    const allFinished = new Array(taskFunctions.length).fill(false)

    do {
      for await (const [index, iterator] of iterators.entries()) {
        const value = await iterator.next()

        if (value.done) {
          allFinished[index] = true
        }
      }
    } while (allFinished.filter(Boolean).length !== allFinished.length)
  })

  ipcMain.on('test-close-window', async () => {
    const allGameWindows = GameWindowControl.getAllGameWindows()

    for (const gameWindow of allGameWindows.values()) {
      gameWindow.closeGameWindow()
    }
  })
}
