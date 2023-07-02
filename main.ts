import Fastify from 'fastify'

import { fetchTimeline } from './fetchTimeline.js'

const fastify = Fastify({
  logger: true,
})

function makeHTML(screenName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Twitter timeline for @${screenName}</title>
  <style>
  body {
    width: 40rem;
    margin: 2rem auto;
  }  
  </style>
</head>
<body>
<a class="twitter-timeline" href="https://twitter.com/${screenName}?ref_src=twsrc%5Etfw">
  Tweets by @${screenName}
</a>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</body>
</html>
`
}

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
