/* eslint-disable sort-keys */
import { log, Wechaty } from 'wechaty'
import { PuppetPadplus } from 'wechaty-puppet-padplus'
// Config.autoReply 全局控制变量
import { Config } from './config'

import dotenv from 'dotenv'
dotenv.config()

const puppet = new PuppetPadplus()
// 如何能不多次扫码登陆机器人
// https://wechaty.js.org/v/zh/faq#login-status-persistent
const name = process.env.WECHATY_NAME || 'grace365'
const bot = new Wechaty({ name, puppet })

const onScan = require('./listeners/on-scan')
const onLogin = require('./listeners/on-login')
const onLogout = require('./listeners/on-logout')
// const onFriend = require('./listeners/on-friend')
// const onRoomjoin = require('./listeners/on-roomjoin')
const onMessage = require('./listeners/on-message')

// index.ts
bot.on('scan', onScan)
bot.on('login', (user) => onLogin(user, bot))
bot.on('logout', onLogout)
bot.on('message', (msg) => onMessage(msg, bot))

bot.on('room-join', (room, inviteeList, inviter) => {
  const nameList = inviteeList.map(c => c.name()).join(',')
  log.info(`Room ${room.topic()} got new member ${nameList}, invited by ${inviter}`)
  // 如果机器人被拉到一个新的群组里, inviteeList[0] === bot.self()
})

// https://wechaty.js.org/v/zh/faq#room-list-not-complete
const allRooms: any = false
log.info(allRooms)

bot.on('ready', async () => {
  const allRooms = await bot.Room.findAll()
  log.info('===bot.Room.findAll===')
  Config.allRooms = allRooms
  allRooms.forEach(room => {
    log.info(`${room}`)
  })
})

bot.start()
  .then(() => log.info('Bot Started.'))
  .catch((e) => log.error('StarterBot', e))
