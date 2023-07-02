// const { chromium } = require('playwright');
//
// (async () => {
//   const browser = await chromium.launch({
//     headless: false
//   });

import { test } from '@playwright/test'

type User = {
  name: string
  screenName: string
}

test('construct timeline items', async ({ page }) => {
  const screenName = 'twitter'

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
        const [, name, screenName] = match
        return { name, screenName }
      })
    let text: string
    try {
      const tweetText = await tweetLocator.getByTestId('tweetText')
      await tweetText.waitFor({ timeout: 100 })
      text = (await tweetText.textContent()) ?? ''
    } catch {
      console.log('catch')
      text = ''
    }
    const time = await tweetLocator
      .locator('time')
      .evaluate((time: HTMLTimeElement) => time?.getAttribute('datetime') ?? '')
    const link = await tweetLocator
      .locator('time')
      .evaluate(
        (time) => time.parentElement?.getAttribute('href')?.split('?')[0] ?? ''
      )

    tweets.push({
      name: user.name,
      screenName: user.screenName,
      text,
      time,
      link,
    })
  }
  console.log(tweets)
})
