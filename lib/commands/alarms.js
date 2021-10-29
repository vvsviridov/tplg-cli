

async function alarms(fdn) {
  const meContextFind = fdn.match(/MeContext=([\w-]+),?/)
  if (!meContextFind) {
    console.log('No alarming object in FDN!'.yellow)
    return
  }
  const eventPoIdsBody = {
    "filters": "",
    "category": "All",
    "nodes": meContextFind[1],
    "recordLimit": 5000,
    "tableSettings": "fdn#true#false,alarmingObject#true#false,presentSeverity#true#false,eventTime#true#false,insertTime#true#false,specificProblem#true#false,probableCause#true#false,eventType#true#false,recordType#true#false,problemText#false#false,problemDetail#false#false,objectOfReference#false#false,commentText#true#false,ackOperator#false#false,ackTime#true#false,ceaseOperator#false#false,ceaseTime#true#false,repeatCount#true#false,oscillationCount#false#false,trendIndication#false#false,previousSeverity#false#false,alarmState#true#false,alarmNumber#false#false,backupStatus#false#false,backupObjectInstance#false#false,proposedRepairAction#false#false,fmxGenerated#false#false,processingType#false#false,root#false#false",
    "timestamp": + new Date(),
    "sortCriteria": [
      {
        "attribute": "insertTime",
        "mode": "desc"
      }
    ],
    "advFilters": ""
  }
  const axiosConfig = {
    method: 'post',
    url: `${this.alarmUrl}eventpoids`,
    data: eventPoIdsBody
  }
  const response1 = await requestWrapper(axiosConfig, 'Getting Alarms...')
  if (!Array.isArray(response1.data)) return
  let total
  let eventPoIds
  response1.data.forEach(item => {
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
  const fieldsBody = {
    "eventPoIds": eventPoIds.toString(),
    "tableSettings": "fdn,alarmingObject,presentSeverity,eventTime,insertTime,specificProblem,probableCause,eventType,recordType,commentText,ackTime,ceaseTime,repeatCount,alarmState,previousSeverity,root,lastUpdated,insertTime,ciFirstGroup,ciSecondGroup",
    "timestamp": + new Date(),
    "filters": "",
    "category": "All"
  }
  axiosConfig.url = `${this.alarmUrl}getalarmlist/fields`
  axiosConfig.data = fieldsBody
  const response2 = await requestWrapper(axiosConfig, 'Getting Alarms Data...')
  if (!Array.isArray(response2.data)) return
  response2.data.forEach(item => {
    const { alarmingObject, presentSeverity, eventTime, specificProblem } = item
    const eventDateTime = new Date(eventTime)
    console.log(`${presentSeverity}\t${eventDateTime.toLocaleDateString()} ${eventDateTime.toLocaleTimeString()}\t${alarmingObject}\t${specificProblem}`)
  })
}


module.exports = alarms