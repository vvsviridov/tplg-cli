const inquirer = require('inquirer')
const colors = require('colors')

const logError = require('../util/logError')
const { isEmpty } = require('../util/validation')


inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))


function buildPrompt(fdn) {
  if (fdn.length >= 67) {
    return { prefix: '...', prompt: fdn.slice(-65) }
  }
  return { prefix: '', prompt: fdn }
}


function commndUp(tplg, fdn) {
  if (tplg.up()) {
    fdn = fdn.split(',').slice(0,-1).join(',')
  } else {
    console.log('There\'s no way up!'.yellow)
  }
  return fdn
}


function commandOther(tplg, fdn, command) {
  if (tplg.setIdByCommand(command)) {
    fdn = `${fdn},${command}`
  } else if (tplg.setAttribute(command)) {
    fdn = fdn.replace(/\((\w+)\)/g, `(${command})`)
  } else {
    console.log('Command Unrecognized❗'.red)
  }
  return fdn
}


async function handleCommand(tplg, fdn, command) {
  if (command === 'exit') return
  if (command.startsWith('show')) {
    const splitted = command.split(/\s(.+)/)
    await tplg.show(splitted[1] ? splitted[1].trim() : '')
  } else if (command === 'config') {
    fdn = await tplg.config(fdn)
  } else if (command === 'set') {
    await tplg.set()
  } else if (command === 'commit') {
    fdn = await tplg.commit(fdn.replace(/\((\w+)\)/g, ''))
  } else if (command === 'up') {
    fdn = commndUp(tplg, fdn)  
  } else if (command === 'get') {
    tplg.get(fdn)
  } else if (command === 'check') {
    tplg.check(fdn.replace(/\((\w+)\)/g, ''))
  } else if (command === 'end') {
    tplg.end()
    fdn = fdn.replace(/\((\w+)\)/g, '')
  } else if (command === 'home') {
    tplg.home()
    fdn = fdn.split(',', 1)[0]
  } else if (command === 'description') {
    tplg.description()
  } else if (command.startsWith('fdn')) {
    const splitted = command.split(/\s(.+)/)
    await tplg.fdn(splitted[1] ? splitted[1].trim() : '')
  } else {
    fdn = commandOther(tplg, fdn, command)
  }
  return fdn
}


async function inputHandlerLoop(tplg) {
  let prompt = await tplg.initialPrompt()
  let fdn = prompt
  let prefix = ''
  while (true) {
    try {
      const input = await inquirer.prompt([
        {
          type: 'autocomplete',
          name: 'command',
          message: tplg.isConfig ? prompt.blue.underline : prompt.blue,
          pageSize: 10,
          prefix: prefix.gray,
          suffix: tplg.isConfig ? '#'.blue : '>'.blue,
          validate: isEmpty,
          source: async (answers, input) => tplg.next(input)
        }
      ])
      fdn = await handleCommand(tplg, fdn, input.command)
      if (!fdn) break
      ({ prefix, prompt } = buildPrompt(fdn))
    } catch (err) {
      logError(err)
    }
  }
}


async function inputHandler(tplg) {
  try {
    await inputHandlerLoop(tplg)
  } catch (err) {
    logError(err)
  }
}


module.exports = inputHandler