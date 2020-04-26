import { log, Contact, Wechaty, Room } from 'wechaty'
const { FileBox }  = require('file-box')
const moment = require('moment')
const CONFIG_JSON_PATH = '../config'

import { Vars as Global } from '../global-var'
const bot: Wechaty = Global.bot

function initSchedule () {
  const cron = require('node-schedule')

  // todo 每天发一个链接
  const tasks  = require(`${CONFIG_JSON_PATH}/schedule.json`).data
  tasks.forEach(task => {
    cron.scheduleJob(task.cron, () => runTask(task))
  });
  log.info(`Schedule`, 'tasks inited.')
}

function runTask (task: any) {
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
      log.error('Schedule',`Can not find ${el.type}:${el.value} to send!`)
      return
    }
      
    log.info('Schedule', `receiver:${receiver} Current:${current} Resource:${path}`)

    return receiver.say(answer)
  });
}

module.exports = initSchedule
