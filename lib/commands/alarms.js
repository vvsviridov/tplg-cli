const colors = require('colors')
const inquirer = require('inquirer')

const requestWrapper = require('../../util/requestWrapper')


// inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))


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
  if (total === 0) {
    console.log(`Total Alarms: ${total}`.green)
    return
  }
  console.log(`Total Alarms: ${total}`.yellow)
  return eventPoIds.toString()
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
  // if (!Array.isArray(response.data)) return
  // response.data.forEach(item => {
  //   const { alarmingObject, presentSeverity, eventTime, specificProblem } = item
  //   const eventDateTime = new Date(eventTime)
  //   console.log(`${presentSeverity}\t${eventDateTime.toLocaleDateString()} ${eventDateTime.toLocaleTimeString()}\t${alarmingObject}\t${specificProblem}`)
  // })
}


async function alarmsLoop(alarmList) {
  while (true) {
    const input = await inquirer.prompt([
      {
        type: 'autocomplete',
        name: 'alarm',
        message: 'Select Alarm:'.bold,
        pageSize: 10,
        source: async (answers, input) => alarmList
                                            .map(al => {
                                              const { alarmingObject, presentSeverity, eventTime, specificProblem } = al
                                              const eventDateTime = new Date(eventTime)
                                              return `${presentSeverity}\t${eventDateTime.toLocaleDateString()} ${eventDateTime.toLocaleTimeString()}\t${alarmingObject}\t${specificProblem}`
                                            })
                                            .filter(al => al.toLowerCase().includes(input.toLowerCase()))
      }
    ])
    if (input.alarm === 'close') break
    console.log(`Alarm choosen: ${input.alarm}`)
  }
}


async function alarms(fdn) {
  const meContextFind = fdn.match(/MeContext=([\w-]+),?/)
  if (!meContextFind) {
    console.log('No alarming object in FDN!'.yellow)
    return
  }
  const eventPoIds = await getPoIds(`${this.alarmUrl}eventpoids`, meContextFind[1])
  const alarmFields = await getFields(`${this.alarmUrl}getalarmlist/fields`, eventPoIds)
  const alarmList = ['close', ...alarmFields]
  alarmsLoop(alarmList)
}


module.exports = alarms