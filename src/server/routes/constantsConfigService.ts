import path from 'path'
import fs from 'fs/promises'
import { HttpStatus } from '../index'
import { FastifyInstance } from 'fastify'
import { constantsPath } from '../../paths'
import GameServerGroup from '../../constants/GameServerGroup.json'
import {
  GameAccount,
  GameAccountList,
  GamePoint,
  GamePointList,
  GameTask,
  GameTaskList,
  GameTaskPlan,
  GameTaskPlanList,
} from 'constants/types'
const uuid = require('uuid')

/************************************* 游戏账户管理 *******************************/

/**
 * 获取游戏区组信息
 */
function getGameSeverGroup(fastify: FastifyInstance) {
  fastify.get('/getGameServerGroup', (_request, response) => {
    response.send({ ...HttpStatus.Success, data: GameServerGroup })
  })
}

/**
 * 获取游戏账户列表信息
 */
function getGameAccountList(fastify: FastifyInstance) {
  fastify.get('/getGameAccountList', async (_request, response) => {
    const GameAccountList = await fs.readFile(path.resolve(constantsPath, 'GameAccountList.json'), 'utf-8')

    response.send({ ...HttpStatus.Success, data: JSON.parse(GameAccountList) })
  })
}

/**
 * 添加游戏账户
 */
function addGameAccount(fastify: FastifyInstance) {
  fastify.post('/addGameAccount', async (request, response) => {
    try {
      const { account, password, serverGroup, groupName } = request.body as GameAccount & {
        groupName: string
        serverGroup: string
      }
      const GameAccountList = await fs.readFile(path.resolve(constantsPath, 'GameAccountList.json'), 'utf-8')
      const newGameAccountList = JSON.parse(GameAccountList) as GameAccountList
      const item = newGameAccountList.find((item) => item.groupName === groupName)
      const id = uuid.v4()

      if (item) {
        item.accountList.push({
          id,
          account,
          password,
          roleInfo: {},
        })
      } else {
        newGameAccountList.push({
          groupName,
          captainAccount: '',
          serverGroup: serverGroup.split('/') as [string, string],
          accountList: [
            {
              id,
              account,
              password,
              roleInfo: {},
            },
          ],
        })
      }

      await fs.writeFile(
        path.resolve(constantsPath, 'GameAccountList.json'),
        JSON.stringify(newGameAccountList, undefined, 4)
      )

      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('addGameAccount error: ', error)

      response.send({ ...HttpStatus.Failure })
    }
  })
}

/**
 * 改变游戏队长账号
 */
function changeCaptainAccount(fastify: FastifyInstance) {
  fastify.post('/changeCaptainAccount', async (request, response) => {
    try {
      const { captainAccount, groupName } = request.body as { groupName: string; captainAccount: string }
      const GameAccountList = await fs.readFile(path.resolve(constantsPath, 'GameAccountList.json'), 'utf-8')
      const newGameAccountList = JSON.parse(GameAccountList) as GameAccountList
      const item = newGameAccountList.find((item) => item.groupName === groupName)!

      item.captainAccount = captainAccount
      await fs.writeFile(
        path.resolve(constantsPath, 'GameAccountList.json'),
        JSON.stringify(newGameAccountList, undefined, 4)
      )

      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('changeCaptainAccount error: ', error)

      response.send({ ...HttpStatus.Failure })
    }
  })
}

/************************************* 游戏坐标管理 *******************************/

/**
 * 获取游戏坐标
 */
function getGamePointList(fastify: FastifyInstance) {
  fastify.get('/getGamePointList', async (_request, response) => {
    const GamePointList = await fs.readFile(path.resolve(constantsPath, 'GamePointList.json'), 'utf-8')

    response.send({ ...HttpStatus.Success, data: JSON.parse(GamePointList) })
  })
}

/**
 * 添加游戏坐标
 */
function addGamePoint(fastify: FastifyInstance) {
  fastify.post('/addGamePoint', async (request, response) => {
    try {
      const { tag, ...gamePoint } = request.body as GamePoint & { tag: string }

      gamePoint.id = uuid.v4()
      const GamePointList = await fs.readFile(path.join(constantsPath, 'GamePointList.json'), 'utf-8')
      const newGamePointList = JSON.parse(GamePointList) as GamePointList
      const item = newGamePointList.find((item) => item.tag === tag)

      if (item) {
        item.pointList.push(gamePoint)
      } else {
        newGamePointList.push({
          tag,
          pointList: [gamePoint],
        })
      }

      await fs.writeFile(path.join(constantsPath, 'GamePointList.json'), JSON.stringify(newGamePointList, undefined, 4))

      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('addGamePoint error: ', error)
    }
  })
}

/**
 * 修改游戏坐标
 */
function editGamePoint(fastify: FastifyInstance) {
  fastify.post('/editGamePoint', async (request, response) => {
    try {
      const { tag, ...gamePoint } = request.body as GamePoint & { tag: string }
      const GamePointList = await fs.readFile(path.join(constantsPath, 'GamePointList.json'), 'utf-8')
      const newGamePointList = JSON.parse(GamePointList) as GamePointList
      let hasEdit = false

      for (const item of newGamePointList) {
        for (const [index, point] of item.pointList.entries()) {
          if (point.id === gamePoint.id) {
            if (tag === item.tag) {
              item.pointList.splice(index, 1, gamePoint)
              hasEdit = true
            } else {
              item.pointList.splice(index, 1)
            }

            break
          }
        }
      }

      if (!hasEdit) {
        const item = newGamePointList.find((item) => item.tag === tag)

        if (item) {
          item.pointList.push(gamePoint)
        } else {
          newGamePointList.push({
            tag,
            pointList: [gamePoint],
          })
        }
      }

      await fs.writeFile(path.join(constantsPath, 'GamePointList.json'), JSON.stringify(newGamePointList, undefined, 4))
      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('editGamePoint error: ', error)
    }
  })
}

/************************************* 游戏任务管理 *******************************/

/**
 * 获取游戏任务
 */
function getGameTaskList(fastify: FastifyInstance) {
  fastify.get('/getGameTaskList', async (_request, response) => {
    const GameTaskList = await fs.readFile(path.resolve(constantsPath, 'GameTaskList.json'), 'utf-8')

    response.send({ ...HttpStatus.Success, data: JSON.parse(GameTaskList) })
  })
}

/**
 * 添加游戏任务
 */
function addGameTask(fastify: FastifyInstance) {
  fastify.post('/addGameTask', async (request, response) => {
    try {
      const { tag, ...gameTask } = request.body as GameTask & { tag: string }
      gameTask.id = uuid.v4()
      gameTask.taskCount = gameTask.taskCount || 1
      const GameTaskList = await fs.readFile(path.join(constantsPath, 'GameTaskList.json'), 'utf-8')
      const newGameTaskList = JSON.parse(GameTaskList) as GameTaskList
      const item = newGameTaskList.find((item) => item.tag === tag)

      if (item) {
        item.taskList.push(gameTask)
      } else {
        newGameTaskList.push({
          tag,
          taskList: [gameTask],
        })
      }

      await fs.writeFile(path.join(constantsPath, 'GameTaskList.json'), JSON.stringify(newGameTaskList, undefined, 4))

      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('addGameTask error: ', error)
    }
  })
}

/**
 * 修改游戏任务
 */
function editGameTask(fastify: FastifyInstance) {
  fastify.post('/editGameTask', async (request, response) => {
    try {
      const { tag, ...gameTask } = request.body as GameTask & { tag: string }
      gameTask.taskCount = gameTask.taskCount || 1
      const GameTaskList = await fs.readFile(path.join(constantsPath, 'GameTaskList.json'), 'utf-8')
      const newGameTaskList = JSON.parse(GameTaskList) as GameTaskList
      let hasEdit = false

      for (const item of newGameTaskList) {
        for (const [index, point] of item.taskList.entries()) {
          if (point.id === gameTask.id) {
            if (tag === item.tag) {
              item.taskList.splice(index, 1, gameTask)
              hasEdit = true
            } else {
              item.taskList.splice(index, 1)
            }

            break
          }
        }
      }

      if (!hasEdit) {
        const item = newGameTaskList.find((item) => item.tag === tag)

        if (item) {
          item.taskList.push(gameTask)
        } else {
          newGameTaskList.push({
            tag,
            taskList: [gameTask],
          })
        }
      }

      await fs.writeFile(path.join(constantsPath, 'GameTaskList.json'), JSON.stringify(newGameTaskList, undefined, 4))
      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('editGameTask error: ', error)
    }
  })
}

/************************************* 游戏任务方案管理 *******************************/

/**
 * 获取游戏任务方案
 */
function getGameTaskPlanList(fastify: FastifyInstance) {
  fastify.get('/getGameTaskPlanList', async (_request, response) => {
    const GameTaskPlanList = await fs.readFile(path.resolve(constantsPath, 'GameTaskPlanList.json'), 'utf-8')

    response.send({ ...HttpStatus.Success, data: JSON.parse(GameTaskPlanList) })
  })
}

/**
 * 添加游戏任务方案
 */
function addGameTaskPlan(fastify: FastifyInstance) {
  fastify.post('/addGameTaskPlan', async (request, response) => {
    try {
      const gameTaskPlan = request.body as GameTaskPlan
      gameTaskPlan.id = uuid.v4()
      const GameTaskPlanList = await fs.readFile(path.join(constantsPath, 'GameTaskPlanList.json'), 'utf-8')
      const newGameTaskPlanList = JSON.parse(GameTaskPlanList) as GameTaskPlanList
      newGameTaskPlanList.push(gameTaskPlan)

      await fs.writeFile(
        path.join(constantsPath, 'GameTaskPlanList.json'),
        JSON.stringify(newGameTaskPlanList, undefined, 4)
      )

      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('addGameTaskPlan error: ', error)
    }
  })
}

/**
 * 修改游戏任务方案
 */
function editGameTaskPlan(fastify: FastifyInstance) {
  fastify.post('/editGameTaskPlan', async (request, response) => {
    try {
      const gameTaskPlan = request.body as GameTaskPlan
      const GameTaskPlanList = await fs.readFile(path.join(constantsPath, 'GameTaskPlanList.json'), 'utf-8')
      const newGameTaskPlanList = JSON.parse(GameTaskPlanList) as GameTaskPlanList
      const index = newGameTaskPlanList.findIndex((item) => item.id === gameTaskPlan.id)

      newGameTaskPlanList.splice(index, 1, gameTaskPlan)

      await fs.writeFile(
        path.join(constantsPath, 'GameTaskPlanList.json'),
        JSON.stringify(newGameTaskPlanList, undefined, 4)
      )

      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('editGameTaskPlan error: ', error)
    }
  })
}

/**
 * 删除游戏任务方案
 */
function removeGameTaskPlan(fastify: FastifyInstance) {
  fastify.post('/removeGameTaskPlan', async (request, response) => {
    try {
      const { id } = request.body as { id: string }
      const GameTaskPlanList = await fs.readFile(path.join(constantsPath, 'GameTaskPlanList.json'), 'utf-8')
      const newGameTaskPlanList = JSON.parse(GameTaskPlanList) as GameTaskPlanList
      const index = newGameTaskPlanList.findIndex((task) => task.id === id)
      newGameTaskPlanList.splice(index, 1)

      await fs.writeFile(
        path.join(constantsPath, 'GameTaskPlanList.json'),
        JSON.stringify(newGameTaskPlanList, undefined, 4)
      )
      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('editGameTask error: ', error)
    }
  })
}

export default function getConstantsConfig(fastify: FastifyInstance) {
  // 游戏账户管理
  getGameSeverGroup(fastify)
  getGameAccountList(fastify)
  addGameAccount(fastify)
  changeCaptainAccount(fastify)

  // 游戏坐标管理
  getGamePointList(fastify)
  addGamePoint(fastify)
  editGamePoint(fastify)

  // 游戏任务管理
  getGameTaskList(fastify)
  addGameTask(fastify)
  editGameTask(fastify)

  // 游戏任务方案管理
  getGameTaskPlanList(fastify)
  addGameTaskPlan(fastify)
  editGameTaskPlan(fastify)
  removeGameTaskPlan(fastify)
}
