const { chromium } = require('playwright')

type User = {
  name: string
  screenName: string
}

export async function fetchTimeline(screenName: string) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`http://localhost:8080/timeline/${screenName}`)
  await page.waitForSelector('iframe[title="Twitter Timeline"]')

  const timeline = await page.frameLocator('iframe[title="Twitter Timeline"]')
  const tweetLocators = await timeline.getByRole('article').all()

  const tweets = []
  for (const tweetLocator of tweetLocators) {
    const user: User = await tweetLocator
      .getByTestId('User-Name')
      .evaluate((user: HTMLElement) => {
        const match = /(.+)@(.+)·/.exec(user?.textContent || '')
        if (match === null) {
          return { name: '', screenName: '' }
        }
        const [, username, screenName] = match
        return { username, screenName }
      })

    let text: string
    try {
      const tweetText = await tweetLocator.getByTestId('tweetText')
      await tweetText.waitFor({ timeout: 100 })
      text = (await tweetText.textContent()) ?? ''
    } catch {
      // some special tweet has no 'tweetText' node
      text = ''
    }

    const time = await tweetLocator
      .locator('time')
      .evaluate((time: HTMLTimeElement) => time?.getAttribute('datetime') ?? '')

    const link = await tweetLocator
      .locator('time')
      .evaluate(
        (time: HTMLTimeElement) =>
          time.parentElement?.getAttribute('href')?.split('?')[0] ?? ''
      )

    tweets.push({
      ...user,
      text,
      time,
      link,
    })
  }

  await browser.close()

  return tweets
}

(async ()=> {
  const screenName = 'twitter';
  const tweets = await fetchTimeline(screenName)
  console.log(tweets)
})()
