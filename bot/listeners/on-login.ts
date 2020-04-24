import { log, Contact, Wechaty, Room } from 'wechaty'
const { FileBox }  = require('file-box')

async function onLogin (user: Contact, bot: Wechaty) {
  log.info(`${user} login`)
  // todo Contacts.get()

  // 2.13 我的群好多，我等不了ready事件就想要操作bot的群
  // https://wechaty.js.org/v/zh/faq#too-many-rooms-to-wait
  // const room = bot.Room.load(roomId)
  // await room.sync()
  const cron = require('node-schedule')
  cron.scheduleJob('25 10 * * *', () => sendDaily(bot))
}

async function sendDaily (bot: Wechaty) {
  const TOPIC = '主人0421' // 诗篇群发源
  const COUNT = 150
  const TYPE = '.mp3'
  let PATH = '/Users/dale/Downloads/Share/19_Psalm/19_'
  // get the room by topic
  const room: Room | null = await bot.Room.find({ topic: TOPIC })
  if (!room) return

  let moment = require('moment')
  let startDate = moment('2020-4-1 0:0:00', 'YYYY-M-DD HH:mm:ss')
  const FROM = 36 + COUNT // 诗篇总共150篇 001.mp3
  let daysDiff = moment().diff(startDate, 'days')
  const current = String((FROM + daysDiff) % COUNT).padStart(3, '0')
  log.info(`scheduleJob: room:${room} Current:${current}`)
  // '/Users/dale/Downloads/Share/19_Psalm/19_059.mp3'
  const fileBox = FileBox.fromFile(`${PATH}${current}${TYPE}`)
  return room.say(fileBox)
}

module.exports = onLogin
