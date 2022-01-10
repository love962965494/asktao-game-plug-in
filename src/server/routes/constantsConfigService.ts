import { FastifyInstance } from 'fastify'
import { HttpStatus } from '../index'
import GameAccountList from '../../constants/GameAccountList.json'
import GameServerGroup from '../../constants/GameServerGroup.json'

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
    console.log('request: ', request)

    response.send('hhh')
  })
}

export default function getConstantsConfig(fastify: FastifyInstance) {
  getGameSeverGroup(fastify)
  getGameAccountList(fastify)
  addGameAccount(fastify)
}
