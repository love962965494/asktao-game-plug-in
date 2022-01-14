import path from 'path'
import fs from 'fs/promises'
import { HttpStatus } from '../index'
import { FastifyInstance } from 'fastify'
import { constantsPath } from '../../paths'
import GameServerGroup from '../../constants/GameServerGroup.json'
import { GameAccount, GameAccountList, GamePoint, GamePointList } from 'constants/types'
const uuid = require('uuid')

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
        })
      } else {
        newGameAccountList.push({
          groupName,
          serverGroup: serverGroup.split('/') as [string, string],
          accountList: [
            {
              id,
              account,
              password,
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

      console.log('uuid: ', uuid)
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

export default function getConstantsConfig(fastify: FastifyInstance) {
  // 游戏账户管理
  getGameSeverGroup(fastify)
  getGameAccountList(fastify)
  addGameAccount(fastify)

  // 游戏坐标管理
  getGamePointList(fastify)
  addGamePoint(fastify)
  editGamePoint(fastify)
}
