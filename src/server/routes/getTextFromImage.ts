import { FastifyInstance } from 'fastify'

export function useGetTextFromImage(fastify: FastifyInstance) {
  fastify.get('/getImageText', (_request, response) => {
    console.log('request received')
    response.send({ hello: 'hhh' })
  })
}
