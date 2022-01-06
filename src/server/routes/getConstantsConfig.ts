import path from 'path'
import fs from 'fs/promises'
import { FastifyInstance } from 'fastify'
import { HttpStatus } from 'server'

/**
 * 获取游戏区组信息
 */
export function getGameSeverGroup(fastify: FastifyInstance) {
  fastify.get('/getGameServerGroup', async (_request, response) => {
    try {
      const data = await fs.readFile(path.join(__dirname, '../../constants/GameServerGroup.json'), 'utf8')

      response.send({ ...HttpStatus.Success, data })
    } catch (error) {
      console.log('getGameSeverGroup: ', error)

      response.send({ ...HttpStatus.Failure, error })
    }
  })
}

export default function getConstantsConfig(fastify: FastifyInstance) {
  getGameSeverGroup(fastify)
}
