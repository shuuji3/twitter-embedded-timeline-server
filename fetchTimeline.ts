import { chromium } from 'playwright'

type User = {
  name: string
  screenName: string
}

type Tweet = {
  user: User
  text: string
  time: string
  link: string
}

export async function fetchTimeline(screenName: string, hostname: string) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`http://${hostname}/timeline/${screenName}`)
  await page.waitForSelector('iframe[title="Twitter Timeline"]')

  const timeline = await page.frameLocator('iframe[title="Twitter Timeline"]')
  const tweetLocators = await timeline.getByRole('article').all()

  const tweets: Tweet[] = []
  for (const tweetLocator of tweetLocators) {
    const user: User = await tweetLocator
      .getByTestId('User-Name')
      // TODO: include quite tweet
      .first()
      .evaluate((user: HTMLElement) => {
        const match = /(.+)@(.+)·/.exec(user?.textContent || '')
        if (match === null) {
          return { name: '', screenName: '' }
        }
        const [, name, screenName] = match
        return { name, screenName }
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
      // TODO: include quite tweet
      .first()
      .evaluate((time: HTMLTimeElement) => time?.getAttribute('datetime') ?? '')

    const link = await tweetLocator
      .locator('time')
      // TODO: include quite tweet
      .first()
      .evaluate(
        (time: HTMLTimeElement) =>
          time.parentElement?.getAttribute('href')?.split('?')[0] ?? ''
      )

    tweets.push({
      user,
      text,
      time,
      link,
    })
  }

  await browser.close()

  return tweets
}
