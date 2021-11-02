

function eventTimeToString(eventTime) {
  const eventDateTime = new Date(eventTime)
  return `${eventDateTime.toLocaleDateString()} ${eventDateTime.toLocaleTimeString()}`
}


module.exports = eventTimeToString