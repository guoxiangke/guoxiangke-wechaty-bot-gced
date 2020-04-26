import { log, Contact} from 'wechaty'


async function onLogin (user: Contact) {
  log.info(`${user} login`)
  // todo Contacts.get()

  // 2.13 我的群好多，我等不了ready事件就想要操作bot的群
  // https://wechaty.js.org/v/zh/faq#too-many-rooms-to-wait
  // const room = bot.Room.load(roomId)
  // await room.sync()
  // const cron = require('node-schedule')

  // // todo 每天发一个链接
  // const tasks  = require(`${CONFIG_JSON_PATH}/schedule.json`).data
  // tasks.forEach(task => {
  //   cron.scheduleJob(task.cron, () => initTask(task, bot))
  // });
}

module.exports = onLogin
