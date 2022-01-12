import { FastifyInstance } from 'fastify'
import { HttpStatus } from '../index'
import GameServerGroup from '../../constants/GameServerGroup.json'
import fs from 'fs/promises'
import { constantsPath } from '../../paths'
import path from 'path'
import { GameAccount, GameAccountList } from 'constants/types'

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
      const { account, password, serverGroup, groupName } = request.body as GameAccount & { groupName: string }
      const GameAccountList = await fs.readFile(path.resolve(constantsPath, 'GameAccountList.json'), 'utf-8')

      const newGameAccountList = JSON.parse(GameAccountList) as GameAccountList
      const item = newGameAccountList.find((item) => item.groupName === groupName)
      if (item) {
        item.accountList.push({
          account,
          password,
          serverGroup,
        })
      } else {
        newGameAccountList.push({
          groupName,
          accountList: [
            {
              account,
              password,
              serverGroup,
            },
          ],
        })
      }
      fs.writeFile(path.resolve(constantsPath, 'GameAccountList.json'), JSON.stringify(newGameAccountList, undefined, 4))

      response.send({ ...HttpStatus.Success })
    } catch (error) {
      console.log('addGameAccount error: ', error)

      response.send({ ...HttpStatus.Failure })
    }
  })
}

export default function getConstantsConfig(fastify: FastifyInstance) {
  getGameSeverGroup(fastify)
  getGameAccountList(fastify)
  addGameAccount(fastify)
}
