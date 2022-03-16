import { ipcMain } from 'electron'
import taskConfigs from './taskConfigs'
import { startGameTask } from './taskConfigs/testTasks'
import fs from 'fs/promises'
import path from 'path'
import { constantsPath } from '../../paths'
import { GameAccount, GameAccountList, GameTaskList, GameTaskPlanList, RoleStatus } from 'constants/types'
import GameWindowControl from '../../utils/gameWindowControll'

export type ExecuteTaskRoleInfo = Partial<RoleStatus & Omit<GameAccount, 'roleList'>>

export function registerTestTasks() {
  ipcMain.on('test-start-game', async () => {
    const iterator = startGameTask()

    do {
      const value = await iterator.next()

      if (value.done) {
        break
      }
    } while (true)
  })

  ipcMain.on('test-execute-plan', async (_, taskPlanId: string) => {
    const GameTaskPlanList = JSON.parse(
      await fs.readFile(path.resolve(constantsPath, 'GameTaskPlanList.json'), 'utf-8')
    ) as GameTaskPlanList
    const gameAccountList: GameAccountList = JSON.parse(
      await fs.readFile(path.resolve(constantsPath, 'GameAccountList.json'), 'utf-8')
    )
    const gameTaskList: GameTaskList = JSON.parse(
      await fs.readFile(path.resolve(constantsPath, 'GameTaskList.json'), 'utf-8')
    )
    const gameTaskPlan = GameTaskPlanList.find((taskPlan) => taskPlan.id === taskPlanId)!

    /**
     * 任务堆栈
     *
     *     . x x x x x x x x x .
     *     y                   y
     *     y      login        y  第一个任务永远是登录角色或者切换角色
     *     y                   y
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
    const taskStack: { taskType: 'group' | 'single', taskCount: number; taskFunction: Function }[] = []
    gameTaskPlan.gameTaskList.forEach((taskGroup) => {
      const taskConfig = taskConfigs.find((config) => config.tag === taskGroup.tag)!
      taskGroup.taskList
        .filter((taskItem) => taskItem.checked)
        .forEach((taskItem) => {
          const { taskType, taskCount = 1 } = gameTaskList
            .find((item) => item.tag === taskGroup.tag)
            ?.taskList?.find((item) => item.id === taskItem.id)!
          const { taskFunction } = taskConfig.taskList.find(({ id }) => id === taskItem.id)!

          if (taskType === 'group') {
            taskStack.push({ taskType, taskCount, taskFunction })
          } else {
            taskStack.unshift({ taskType, taskCount, taskFunction })
          }
        })
    })

    // 栈顶放入登录任务
    taskStack.push({ taskType: 'single', taskCount: 1, taskFunction: startGameTask })

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
      let len = taskStack.length

      do {
        const { taskType, taskCount, taskFunction } = taskStack[len - 1]
        for (let i = 0; i < taskCount; i++) {
          let iterators
          if (taskType === 'single') {
            iterators = roles.filter(Boolean).map((role, index) => taskFunction(role, index, i))
          } else {
            iterators = [taskFunction(roles.filter(Boolean), i)]
          }
          const allFinished = Array.from({ length: iterators.length }, () => false)

          do {
            for await (const [index, iterator] of iterators.entries()) {
              const value = await iterator.next()

              if (value.done) {
                allFinished[index] = true
              }
            }
          } while (allFinished.filter(Boolean).length !== allFinished.length)
        }
      } while (--len > 0)
    }
  })

  ipcMain.on('test-close-window', async () => {
    const allGameWindows = GameWindowControl.getAllGameWindows()

    for (const gameWindow of allGameWindows.values()) {
      gameWindow.closeGameWindow()
    }
  })
}


