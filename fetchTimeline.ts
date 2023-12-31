import { chromium, FrameLocator, Locator } from 'playwright'
import memoize from 'memoizee'

import { type Tweet, type User } from './types.js'

const second = 1000
const minute = 60 * second
const maxAge = 15 * minute

export const fetchTimeline = memoize(_fetchTimeline, {
  maxAge,
  preFetch: true,
})

async function _fetchTimeline(screenName: string, hostname: string) {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`http://${hostname}/timeline/${screenName}`)
  await page.waitForSelector('iframe[title="Twitter Timeline"]')

  const timelineLocator = await page.frameLocator(
    'iframe[title="Twitter Timeline"]'
  )
  const tweetLocators = await timelineLocator.getByRole('article').all()
  const tweets = await getTweets(tweetLocators)

  await browser.close()

  return tweets
}

async function getTweets(tweetLocators: Locator[]) {
  const tweets: Tweet[] = []
  for (const tweetLocator of tweetLocators) {
    const user: User = await tweetLocator
      .getByTestId('User-Name')
      // TODO: include quoted tweet
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
      // TODO: include quoted tweet
      .first()
      .evaluate((time: HTMLTimeElement) => time?.getAttribute('datetime') ?? '')

    const link = await tweetLocator
      .locator('time')
      // TODO: include quoted tweet
      .first()
      .evaluate(
        (time: HTMLTimeElement) =>
          time.parentElement?.getAttribute('href')?.split('?')[0] ?? ''
      )

    let isRetweet: boolean
    try {
      await tweetLocator.locator('a[id^="id"]').waitFor({ timeout: 100 })
      isRetweet = true
    } catch {
      isRetweet = false
    }
    tweets.push({ user, text, time, link, isRetweet })
  }
  return tweets
}

// function getMetadata(tweets) {
//   const userName = [...tweets].map(
//     (t) =>
//       t.querySelector('a[id^="id"] > span > span > span')?.textContent ??
//       t.querySelector('[data-testid="User-Name"] a')?.textContent
//   )[0]
// }
