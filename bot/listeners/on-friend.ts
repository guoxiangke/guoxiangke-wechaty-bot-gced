import { log } from 'wechaty'

async function onFriend (contact, request) {
  /**
   * We can get the Wechaty bot instance from this:
   *   `const wechaty = this`
   * Or use `this` directly:
   *   `console.info(this.userSelf())`
   */
  if (request) {
    let name = contact.name()
    // await request.accept()

    log.info(`Contact: ${name} send request ${request.hello()}`)
  }
}

module.exports = onFriend
