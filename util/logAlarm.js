const colors = require('colors')

const eventTimeToString = require('./eventTimeToString')



const timeValues = [
  'eventTime',
  'insertTime',
  'ceaseTime',
  'ackTime',
]


function logAlarm(alarmList, eventPoId) {
  const alarm = alarmList.filter(item => item.eventPoIdAsLong === eventPoId)[0]
  timeValues.forEach(value => alarm[value] = eventTimeToString(alarm[value]))
  console.log(JSON.stringify(alarm, null, 2))
}


module.exports = logAlarm