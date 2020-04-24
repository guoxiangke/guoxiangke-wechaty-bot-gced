import { log, Contact, Wechaty, Room } from 'wechaty'
const { FileBox }  = require('file-box')
const moment = require('moment')

async function onLogin (user: Contact, bot: Wechaty) {
  log.info(`${user} login`)
  // todo Contacts.get()

  // 2.13 我的群好多，我等不了ready事件就想要操作bot的群
  // https://wechaty.js.org/v/zh/faq#too-many-rooms-to-wait
  // const room = bot.Room.load(roomId)
  // await room.sync()
  const cron = require('node-schedule')

  const tasks  = require('../schedule.json').data
  tasks.forEach(task => {
    cron.scheduleJob(task.cron, () => initTask(task, bot))
  });
}

async function initTask (task: any, bot: Wechaty) {
  log.warn(JSON.stringify(task))
  const startDate = moment(task.from, 'YYYY-M-DD')
  const daysDiff = moment().diff(startDate, 'days')
  const current = String(daysDiff % task.count).padStart(3, '0')
  const fileBox = FileBox.fromFile(`${task.path}${current}${task.type}`)

  task.to.forEach(async el => {
    let receiver: Room | Contact | null = null
    if(el.type === 'room'){
      // get the room by topic
      receiver = await bot.Room.find({ topic: `${el.value}` })
    }else if(el.type === 'name'){
      receiver = await bot.Contact.find({name:`${el.value}`})
    }else if(el.type === 'alias'){
      receiver = await bot.Contact.find({alias:`${el.value}`})
    }
    if (!receiver) return
      
    log.error(`scheduleJob: receiver:${receiver} Current:${current}`)
    return receiver.say(fileBox)
  });
}

module.exports = onLogin
