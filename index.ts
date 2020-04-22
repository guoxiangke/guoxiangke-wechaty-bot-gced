import { PuppetPadplus } from 'wechaty-puppet-padplus'
import QrcodeTerminal from 'qrcode-terminal'

import {
  Contact,
  Message,
  ScanStatus,
  Wechaty,
  log,
}               from 'wechaty'

const { FileBox }  = require('file-box')

const dotenv = require('dotenv');
dotenv.config();

// const token = process.env.WECHATY_PUPPET_PADPLUS_TOKEN || ""
const puppet = new PuppetPadplus()
const name  = process.env.WECHATY_NAME || "grace365"
const bot = new Wechaty({
  puppet,
  name, // generate xxxx.memory-card.json and save login data for the next login
})

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    QrcodeTerminal.generate(qrcode, { small: true })  // show qrcode on console

    const qrcodeImageUrl = [
      'https://api.qrserver.com/v1/create-qr-code/?data=',
      encodeURIComponent(qrcode),
    ].join('')

    log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
  } else {
    log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user: Contact) {
  log.info('StarterBot', '%s login', user)
  //todo Contacts.get()
}

function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

async function onMessage (msg: Message) {
  if (msg.age() > 60) {
    console.log('Message discarded because its TOO OLD(than 1 minute)')
    return
  }
  const contact = msg.from()
  // Handle Exception
  if(!contact) return;

  const room = msg.room()
  // 处理群消息
  if (room) {
    const hostRoon = room
    const topic = await room.topic()

    //万群群发！
    //主人群的每条消息/bot发的消息，都群发给bot的所有群！
    const ownerGroupName: string =  '主人群0421xx'
    if(topic == ownerGroupName) {
      let roomList = await bot.Room.findAll()
      roomList.forEach(room => {
        // except for room.self
        if(room == hostRoon) return;
        msg.forward(room);
        log.info('ForwardToAllRoom', room)
      });
    }

    // 经典转发
    // todo Redis/DB + UI config!
    const forwards  = require('./forward.json').data

    forwards.forEach(forward=> {
      const tos = forward.to;
      forward.from.forEach(async from => {
        if(topic == from.topic) {
          const contactFindByName = await bot.Contact.find({ alias: from.contact })
          if(contactFindByName == contact){
            const roomList = await bot.Room.findAll()
            roomList.forEach(async room => {
              // except for room.self
              if(room == hostRoon) return;
              const forwardRoomTopic = await room.topic()

              tos.forEach(to => {
                if( to.topic == forwardRoomTopic){
                  msg.forward(room);
                  log.info('ForwardToRoom', room.id, room)
                }
              });
            });
          }
        }
      })
    });


  } else {
    // 处理个人消息 todo
    const text = msg.text()

    log.info(`Contact: ${contact.name()} Text: ${text}`)
  }
}

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))