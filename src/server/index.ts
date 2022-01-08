import Fastify from 'fastify'
import routes from './routes'

export type HttpCodes = typeof HttpStatus[keyof typeof HttpStatus]['code']

export const HttpStatus = {
  Success: {
    code: 200 as const,
    msg: '请求数据成功！',
  },
  Failure: {
    code: 500 as const,
    msg: '请求数据失败！',
  },
}

const fastify = Fastify({
  logger: true,
})

fastify.register(routes)

function startServer(port: number) {
  fastify.listen(port, (err, address) => {
    if (err) {
      fastify.log.error(err)

      process.exit(1)
    }

    console.log('address: ', address)
  })
}

export default startServer
