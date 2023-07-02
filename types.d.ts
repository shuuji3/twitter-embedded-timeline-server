export type User = {
  name: string
  screenName: string
}

export type Tweet = {
  user: User
  text: string
  time: string
  link: string
}
