import { createServer } from 'node:http'

function makeHTML(screenName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Twitter timeline for @${screenName}</title>
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

const server = createServer((req, res) => {
  const screenName = req.url?.substring(1) || 'twitter'
  const html = makeHTML(screenName)
  res.setHeader('Content-Type', 'text/html');
  res.end(html)
})

const port = process.env.PORT || 8080
console.log(`listening at port ${port} ...`)
server.listen(port)
