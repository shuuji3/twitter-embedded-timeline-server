import Fastify from 'fastify'

import { fetchTimeline } from './fetchTimeline.js'
import { makeHTML } from './utils.js'

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
  const tweets = await fetchTimeline(screenName)
  reply.send({ tweets })
})

const port = parseInt(process.env.PORT || '8080', 10)

fastify.listen({ port }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
