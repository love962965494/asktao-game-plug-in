import Fastify from 'fastify'
import routes from './routes'

export const HttpStatus = {
  Success: {
    status: 200,
    statusText: '请求数据成功！',
  },
  Failure: {
    status: 500,
    statusText: '请求数据失败！',
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
