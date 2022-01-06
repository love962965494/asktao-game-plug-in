import { FastifyInstance } from 'fastify'
import getTextFromImage from './getTextFromImage'
import getConstantsConfig from './getConstantsConfig'

async function routes(fastify: FastifyInstance, options: any) {
  getTextFromImage(fastify)
  getConstantsConfig(fastify)
}

export default routes
