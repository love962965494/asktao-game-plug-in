import { FastifyInstance } from 'fastify'
import { useGetTextFromImage } from './getTextFromImage'

async function routes(fastify: FastifyInstance, options: any) {
  useGetTextFromImage(fastify)
}

export default routes
