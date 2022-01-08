import { FastifyInstance } from 'fastify'
import { HttpStatus } from '../index'
import GameAccountList from 'constants/GameAccountList.json'
import GameServerGroup from 'constants/GameServerGroup.json'

/**
 * 获取游戏区组信息
 */
export function getGameSeverGroup(fastify: FastifyInstance) {
  fastify.get('/getGameServerGroup', (_request, response) => {
    response.send({ ...HttpStatus.Success, data: GameServerGroup })
  })
}

/**
 * 获取游戏账户列表信息
 */
export function getGameAccountList(fastify: FastifyInstance) {
  fastify.get('/getGameAccountList', (_request, response) => {
    response.send({ ...HttpStatus.Success, data: GameAccountList })
  })
}

export default function getConstantsConfig(fastify: FastifyInstance) {
  getGameSeverGroup(fastify)
}
