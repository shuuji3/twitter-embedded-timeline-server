export function makeHTML(screenName: string) {
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
