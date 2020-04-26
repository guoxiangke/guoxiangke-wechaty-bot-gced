import { log, Wechaty } from 'wechaty'
import { Vars as Global } from '../global-var'
const bot: Wechaty = Global.bot

async function onReady () {
    log.info(`onReady`)
    // https://wechaty.js.org/v/zh/faq#room-list-not-complete
    let allRooms = await bot.Room.findAll()
    log.verbose(`onReady`,'===bot.Room.findAll===')
    Global.allRooms = allRooms
    log.info('onReady',`Now you can use allRooms: ${allRooms}`)
    // Then we can use on ther TS file like blow:
    // let allRooms = Global.allRooms
    
    // // 4dev
    // allRooms.forEach((room:Room) => {
    //     log.verbose(`${room}:${room.id}`)
    // })
}

module.exports = onReady
  