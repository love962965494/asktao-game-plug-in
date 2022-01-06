import { FastifyInstance } from 'fastify'

export default function getTextFromImage(fastify: FastifyInstance) {
  fastify.get('/getImageText', (_request, response) => {
    console.log('request received')
    response.send({ hello: 'hhh' })
  })
}
