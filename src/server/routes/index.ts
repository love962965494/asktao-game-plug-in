import { FastifyInstance } from 'fastify'
import getTextFromImage from './getTextFromImage'
import constantsConfigService from './constantsConfigService'

async function routes(fastify: FastifyInstance, options: any) {
  getTextFromImage(fastify)
  constantsConfigService(fastify)
}

export default routes
