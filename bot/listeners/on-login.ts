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

  // todo 每天发一个链接
  const tasks  = require('../schedule.json').data
  tasks.forEach(task => {
    cron.scheduleJob(task.cron, () => initTask(task, bot))
  });
}

async function initTask (task: any, bot: Wechaty) {
  log.warn(JSON.stringify(task))
  const rule = task.current

  let current: String = ''
  if(task.by === 'count'){
    const startDate = moment(rule.from, 'YYYY-M-DD')
    const daysDiff = moment().diff(startDate, 'days')
    current = String(daysDiff % rule.count)
    if(rule.hasOwnProperty('pad')){
      current = current.padStart(rule.pad.maxLength, rule.pad.fillString)
    }
  }
  if(task.by === 'date'){
    current = moment().format('MMDD') //0101.mp4
  }
  const path = task.uri.replace('${current}', current)
  log.error(path)

  // todo answer = Text 每日一句
  let answer: any
  if (task.uri.startsWith('http')) {
    answer = FileBox.fromUrl(encodeURI(path))
  } else {
    answer = FileBox.fromFile(path)
  }
  

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
    if (!receiver) {
      log.error('onLoginscheduleJob',`Can not find ${el.type}:${el.value} to send!`)
      return
    }
      
    log.error('onLoginscheduleJob', `receiver:${receiver} Current:${current}`)
    return receiver.say(answer)
  });
}

module.exports = onLogin
