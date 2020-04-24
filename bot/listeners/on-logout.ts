import { log, Contact } from 'wechaty'

async function onLogout (user: Contact) {
  log.info('StarterBot', '%s logout', user)
}

module.exports = onLogout
