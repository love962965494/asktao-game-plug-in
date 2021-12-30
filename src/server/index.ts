import Fastify from 'fastify'
import routes from './routes'

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
