import { ipcMain } from 'electron'
import taskConfigs from './taskConfigs'
import { startGameTask, wangyiTask, youdaoTask } from './taskConfigs/testTasks'
import fs from 'fs/promises'
import path from 'path'
import { constantsPath } from '../../paths'
import { GameAccount, GameAccountList, GameTaskPlanList, RoleStatus } from 'constants/types'
import GameWindowControl from '../../utils/gameWindowControll'

export type ExecuteTaskRoleInfo = Partial<RoleStatus & Omit<GameAccount, 'roleList'>>

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
    const gameAccountList: GameAccountList = JSON.parse(
      await fs.readFile(path.resolve(constantsPath, 'GameAccountList.json'), 'utf-8')
    )
    const gameTaskPlan = GameTaskPlanList.find((taskPlan) => taskPlan.id === taskPlanId)!

    const taskFunctions = gameTaskPlan.gameTaskList.reduce<Function[]>((arr, taskGroup) => {
      const taskConfig = taskConfigs.find((config) => config.tag === taskGroup.tag)!
      const functions = taskGroup.taskList
        .filter((taskItem) => taskItem.checked)
        .map((taskItem) => {
          const { taskFunction } = taskConfig.taskList.find(({ id }) => id === taskItem.id)!

          return taskFunction
        })

      return [...arr, ...functions]
    }, [])

    /**
     * 任务堆栈
     *
     *     . x x x x x x x x x .
     *     y   limitTimeTask   y
     *     y     groupTask     y  顶层放置限时任务，限时任务优先执行，限时组队任务优先于限时单人任务执行
     *     y     singleTask    y
     *     . x x x x x x x x x .
     *     y                   y
     *     y     groupTask     y  第二层放置组队任务
     *     y                   y
     *     . x x x x x x x x x .
     *     y                   y
     *     y    singleTask     y  第三层放置单人任务
     *     y                   y
     *     . x x x x x x x x x .
     */
    const taskStack = []

    const accountGroups = gameTaskPlan.accountGroups
    /**
     * 一组账号下可以有多个角色，每个角色遍历执行任务，一次执行两组账号，所以有十个角色同时执行任务
     * x代表角色不存在
     * [
     *    [角色1, 角色2, 角色3, 角色4, 角色5, 角色6, 角色7, 角色8, 角色9, 角色10],
     *    [角色1, 角色2, 角色3, 角色4, 角色5, 角色6, 角色7, 角色8, 角色9, 角色10],
     *    [角色1, 角色2, 角色3, 角色4, 角色5, x, x, x, x, x],
     *    ...
     * ]
     */
    const allToExecuteTaskRoles = accountGroups.reduce<(ExecuteTaskRoleInfo | null)[][]>((arr, groupName, index) => {
      // 每次处理两组账号，奇数时直接返回arr
      if (index % 2 === 0) {
        const account1 = gameAccountList.find((item) => item.groupName === groupName)
        const account2 = gameAccountList.find((item) => item.groupName === accountGroups[index + 1])
        const tenAccounts = Array.from({ length: 5 }, (_, index) => account1?.accountList[index] || null).concat(
          Array.from({ length: 5 }, (_, index) => account2?.accountList[index] || null)
        )

        for (let i = 0; i < 4; i++) {
          // 每个账号下最多4个角色
          const roles = tenAccounts.map((account) => {
            if (account && account.roleList?.[i]) {
              const { roleList, ...others } = account
              const role = { ...account.roleList[i], ...others }

              return role
            }

            return null
          })

          if (roles.every((item) => Boolean(item) === false)) {
            break
          }

          arr.push(roles)
        }
      }

      return arr
    }, [])

    for (const roles of allToExecuteTaskRoles) {
      const iterators = taskFunctions.map((func) => func(roles))
      const allFinished = new Array(taskFunctions.length).fill(false)

      do {
        for await (const [index, iterator] of iterators.entries()) {
          const value = await iterator.next()

          if (value.done) {
            allFinished[index] = true
          }
        }
      } while (allFinished.filter(Boolean).length !== allFinished.length)
    }
  })

  ipcMain.on('test-close-window', async () => {
    const allGameWindows = GameWindowControl.getAllGameWindows()

    for (const gameWindow of allGameWindows.values()) {
      gameWindow.closeGameWindow()
    }
  })
}
