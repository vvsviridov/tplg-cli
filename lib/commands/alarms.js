const colors = require('colors')
const inquirer = require('inquirer')

const requestWrapper = require('../../util/requestWrapper')

const closeAlarms = 'Close Alarms'.yellow


// npm i inquirer-search-list
inquirer.registerPrompt('search-list', require('inquirer-search-list'))


function logTotal(total) {
  if (total === 0) {
    console.log(`Total Alarms: ${total}`.green)
    return
  }
  console.log(`Total Alarms: ${total}`.yellow)
}


function parsePoIdResponse(response) {
  let total
  let eventPoIds
  response.data.forEach(item => {
    if (item.eventPoIds) {
      eventPoIds = item.eventPoIds
      return
    }
    if (typeof item.total === 'number') {
      total = item.total
      return
    }
  })
  return total, eventPoIds
}


async function getPoIds(url, nodes) {
  const axiosConfig = {
    method: 'post',
    url,
    data: {
      filters: '',
      category: 'All',
      nodes,
      recordLimit: 5000,
      tableSettings: '',
      timestamp: + new Date(),
      sortCriteria: [
        {
          attribute: 'insertTime',
          mode: 'desc'
        }
      ],
      advFilters: ''
    }
  }
  const response = await requestWrapper(axiosConfig, 'Getting Alarms...')
  if (!Array.isArray(response.data)) return
  const [total, eventPoIds] = parsePoIdResponse(response)
  logTotal(total)
  if (eventPoIds) return eventPoIds.toString()
}


async function getFields(url, eventPoIds) {
  const axiosConfig = {
    method: 'post',
    url,
    data: {
      eventPoIds,
      tableSettings: '',
      timestamp: + new Date(),
      filters: '',
      category: 'All'
    }
  }
  const response = await requestWrapper(axiosConfig, 'Getting Alarms Data...')
  return response.data
}


function alarmChoices(alarmList, input) {
  return alarmList
    .map(al => {
      const { eventPoIdAsLong, alarmingObject, presentSeverity, eventTime, specificProblem } = al
      const eventDateTime = new Date(eventTime)
      return {
        name: `${presentSeverity}\t${eventDateTime.toLocaleDateString()} ${eventDateTime.toLocaleTimeString()}\t${alarmingObject}\t${specificProblem}`,
        value: eventPoIdAsLong
      }
    })
    .filter(al => al.name.toLowerCase().includes(input.toLowerCase()))
}


async function alarmsLoop(alarmList) {
  while (true) {
    const input = await inquirer.prompt([
      {
        type: 'search-list',
        name: 'alarm',
        message: 'Select Alarm:'.bold,
        pageSize: 10,
        choices: async (answers, input) => alarmChoices(alarmList, input)
      }
    ])
    // if (input.alarm === closeAlarms) break
    console.log(`Alarm choosen: ${input}`)
  }
}


async function alarms(fdn) {
  const meContextFind = fdn.match(/MeContext=([\w-]+),?/)
  if (!meContextFind) {
    console.log('No alarming object in FDN!'.yellow)
    return
  }
  const eventPoIds = await getPoIds(`${this.alarmUrl}eventpoids`, meContextFind[1])
  if (!eventPoIds) return
  const alarmFields = await getFields(`${this.alarmUrl}getalarmlist/fields`, eventPoIds)
  const alarmList = [closeAlarms, ...alarmFields]
  await alarmsLoop(alarmList)
}


module.exports = alarms