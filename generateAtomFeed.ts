import { Feed } from 'feed'

import { Tweet } from './types.js'

export function generateAtomFeed(tweets: Tweet[]) {
  const feed = new Feed({
    title: 'Feed Title',
    description: 'This is my personal feed!',
    id: `https://twitter.com/`,
    link: 'http://example.com/',
    language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: 'http://example.com/image.png',
    favicon: 'http://example.com/favicon.ico',
    copyright: 'All rights reserved 2013, John Doe',
    updated: new Date(2013, 6, 14), // optional, default = today
    generator: 'awesome', // optional, default = 'Feed for Node.js'
    feedLinks: {
      json: 'https://example.com/json',
      atom: 'https://example.com/atom',
    },
    author: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      link: 'https://example.com/johndoe',
    },
  })

  tweets.forEach((tweet) => {
    feed.addItem({
      id: tweet.link,
      title: tweet.text,
      link: tweet.link,
      description: tweet.text,
      content: tweet.text,
      author: [
        {
          name: `${tweet.user.name} (@${tweet.user.screenName})`,
          email: 'joesmith@example.com',
          link: `https://twitter.com/${tweet.user.screenName}`,
        },
      ],
      date: new Date(tweet.time),
    })
  })

  return feed.atom1()
}
