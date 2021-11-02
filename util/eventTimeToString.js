

function eventTimeToString(eventTime) {
  if (!eventTime) return ''
  const eventDateTime = new Date(eventTime)
  return `${eventDateTime.toLocaleDateString()} ${eventDateTime.toLocaleTimeString()}`
}


module.exports = eventTimeToString