import Fastify from 'fastify'

import { fetchTimeline } from './fetchTimeline.js'
import { makeHTML } from './utils.js'

const port = parseInt(process.env.PORT || '8080', 10)
const hostname = `localhost:${port}`

const fastify = Fastify({
  logger: true,
})

fastify.get('/timeline/:screenName', (request, reply) => {
  const { screenName: screenName = 'twitter' } = request.params as {
    screenName: string
  }
  const html = makeHTML(screenName)
  reply.type('text/html').send(html)
})

fastify.get('/timeline/:screenName/json', async (request, reply) => {
  const { screenName: screenName = 'twitter' } = request.params as {
    screenName: string
  }
  const tweets = await fetchTimeline(screenName, hostname)
  reply.send({ tweets })
})

fastify.get('/timeline/:screenName/atom', async (request, reply) => {
  const { screenName: screenName = 'twitter' } = request.params as {
    screenName: string
  }
  const tweets = await fetchTimeline(screenName, hostname)
  reply.header('content-type', 'application/atom+xml')
  reply.send('TODO')
})

fastify.listen({ port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
