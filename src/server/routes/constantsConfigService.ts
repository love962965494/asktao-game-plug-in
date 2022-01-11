import { FastifyInstance } from 'fastify'
import { HttpStatus } from '../index'
import GameAccountList from '../../constants/GameAccountList.json'
import GameServerGroup from '../../constants/GameServerGroup.json'
import fs from 'fs/promises'
import { constantsPath } from '../../paths'
import path from 'path'
import { GameAccount } from 'constants/types'
import Item from 'antd/lib/list/Item'

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
  fastify.get('/getGameAccountList', (_request, response) => {
    response.send({ ...HttpStatus.Success, data: GameAccountList })
  })
}

/**
 * 添加游戏账户
 */
function addGameAccount(fastify: FastifyInstance) {
  fastify.post('/addGameAccount', (request, response) => {
    try {
      // const { account, password, serverGroup, groupName } = request.body as GameAccount & { groupName: string; serverGroup: string }
      // const data = []
      // const item = GameAccountList.find(item => item.groupName === groupName)
      // if (item) {
      //   item.accountList.push({
      //     account,
      //     password,
      //     serverGroup: serverGroup.split('/')
      //   })
      // }
      fs.writeFile(path.resolve(constantsPath, 'test.json'), JSON.stringify(request.body))

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
