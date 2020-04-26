import { log, Contact, Message, Wechaty, UrlLink } from 'wechaty'
// Global.autoReply 全局控制变量
import { Vars as Global } from '../global-var'
const bot: Wechaty = Global.bot
// 关键词聊天（非群聊）默认开启，bot回复#off给filehelper关闭
Global.autoReply = true
const CONFIG_JSON_PATH = '../config'


async function onMessage (msg: Message) {
  log.info(msg.toString())
  if (msg.age() > 60) {
    log.info('Message discarded because its TOO OLD(than 1 minute)')
    return
  }
  // Handle Exception
  const sender: Contact|null = msg.from()
  const receiver: Contact|null = msg.to()
  const text     = msg.text()
  const room     = msg.room()
  const filehelper = bot.Contact.load('filehelper')

  if (!sender) return
  if (!receiver) return

  let msgSenderAlias = await sender.alias()
  // bot本身无法通过alias获取群昵称
  if (!msgSenderAlias) {
    msgSenderAlias = await sender.name()
  }

  const roomList = await bot.Room.findAll()

  // todo 指定公众号消息的第X条消息转发到指定群里

  // 处理群消息
  if (room) {
    const hostRoom = room
    const topic = await room.topic()

    // 万群群发！
    // 主人群的每条消息/bot发的消息，都群发给bot的所有群！
    const ownerGroupName: string =  '万群群发主人群0421xx'
    if (topic === ownerGroupName) {
      roomList.forEach(room => {
        if (room === hostRoom) return
        log.info('ForwardTo', room.toString())
        return msg.forward(room)
      })
    }

    // 经典转发
    // todo Redis/DB + UI config!
    const forwards  = require(`${CONFIG_JSON_PATH}/forward.json`).data

    forwards.forEach(forward => {
      const destinations = forward.destinations
      forward.sources.forEach(source => {
        if (topic === source.topic) {
          source.senders.forEach(async sender => {
            if (sender.alias === msgSenderAlias) {
              roomList.forEach(async room => {
                if (room === hostRoom) return
                const forwardRoomTopic = await room.topic()
                destinations.forEach(function (to: any): any {
                // destinations.forEach(to => {
                  if (to.topic === forwardRoomTopic) {
                    log.info('Forward To', room.id, forwardRoomTopic)
                    return msg.forward(room)
                  }
                })
              })
            }
          })
        }
      })
    })
  } else {
    // 处理个人消息

    // let autoReply = false
    // let aiReply = false
    // 自己发给filehelper
    if (receiver.id === 'filehelper') {
      // bot作为系统管理员，处理bot发出的指令处理
      const keyword = text.toLowerCase().replace('#', '')// #On #off
      switch (keyword) {
        case 'on':
        case 'off':
          Global.autoReply = !Global.autoReply
          await filehelper.say(`autoReply: ${Global.autoReply}`)
          break

        default:
          await filehelper.say('Error: Invalid instruction')
          break
      }
    }
    // 除了给filehelper和自己发之外的 所有自己发的消息，不再继续处理，到此为止
    if (msg.self()) return
    // 匹配用户发的消息开始
    // 完全匹配模式的关键词回复配置 autoReply.json
    if (Global.autoReply) {
      const autoReplyConfig  = require(`${CONFIG_JSON_PATH}/autoReply.json`).data
      autoReplyConfig.forEach(async element => {
        if (text === element.key) { // 用户回复的关键词 == 设定的关键词
          // @see import { MessageType } from 'wechaty-puppet'
          switch (element.reply.type) {
            case 'Text':
              await sender.say(element.reply.content)
              break

            case 'Contact':
              const contact = await bot.Contact.find({ name: element.reply.content })
              if (!contact) {
                log.warn(`No Contact Card to response: ${element.reply.content}`)
                return
              }
              const contactCard = bot.Contact.load(contact.id)
              await sender.say(contactCard)
              break

            case 'Audio':
            case 'Video':
            case 'Image':
            case 'Emoticon':
            case 'Attachment':
              const { FileBox }  = require('file-box')
              let fileBox: any
              if (element.reply.content.startsWith('http')) {
                fileBox = FileBox.fromUrl(`${element.reply.content}`)
              } else {
                fileBox = FileBox.fromFile(`${element.reply.content}`)
              }
              await sender.say(fileBox)
              break

            case 'Url':
              const urlLink = new UrlLink(element.reply.content)
              await sender.say(urlLink)
              break

            default:
              log.warn(`Unknow MessageType config: ${element.reply.type}`)
              break
          }

        }
      })
    }

    // 关键词入群，按群名
    const rooms  = require(`${CONFIG_JSON_PATH}/roomAutoJoin.json`).data
    rooms.forEach(async room => {
      if (text === room.topic) { // 用户回复的关键词 == 群名
        const myRoom = await bot.Room.find({ topic: room.topic })
        if (!myRoom) return
        if (await myRoom.has(sender)) {
          return sender.say('You are already in the room')
        }
        await sender.say(`Will put you in ${room.topic} room!`)
        return myRoom.add(sender)
      }
    })

  }
}

module.exports = onMessage
