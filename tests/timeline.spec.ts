import { test, expect } from '@playwright/test';
import { zip } from 'underscore';

type User = {
  name: string;
  screenName: string;
}

function getNames(userNameText: string) {
  const [_, name, screenName] = /(.+)@(.+)·/.exec(userNameText)
  return { name, screenName }
}

test('construct timeline items', async ({ page }) => {
  const screenName = 'twitter'

  await page.goto(`http://localhost:8080/${screenName}`);
  await page.waitForSelector('iframe[title="Twitter Timeline"]')

  const timeline = await page.frameLocator('iframe[title="Twitter Timeline"]')
  const users: User[] = await timeline.getByTestId('User-Name').evaluateAll(users => users.map(user => {
    const [, name, screenName] = /(.+)@(.+)·/.exec(user.textContent)
    return {name, screenName}
  }))
  const texts = await timeline.getByTestId('tweetText').allInnerTexts()
  const times = await timeline.locator('time').evaluateAll(times => times.map(time => time.getAttribute('datetime')))
  const links = await timeline.locator('time').evaluateAll(times => times.map(time => time.parentElement.getAttribute('href')))

  for (const [{name, screenName}, text, time, link] of zip(users, texts, times, links)) {
    const tweet = {name, screenName, text, time, link};
    console.log(tweet)
  }
});
