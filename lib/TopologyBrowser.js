const axios = require('axios')
const https = require('https')
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')

const logAttributes = require('../util/logAttributes')
const logAttributeData = require('../util/logAttributeData')
const logDetails = require('../util/logDetails')
const logCommit = require('../util/logCommit')
const requestWrapper = require('../util/requestWrapper')
const banner = require('../util/banner')
const inputByType = require('../lib/inputValue')

const otherCommands = ['show', 'config', 'up', 'home', 'fdn', 'persistent', 'alarms', 'exit']
const configCommands = ['commit', 'check', 'end', 'persistent', 'exit']

axiosCookieJarSupport(axios)


class TopologyBrowser {
  constructor(username, password, url) {
    this.logoutUrl = '/logout'
    this.baseUrl =   '/persistentObject/'
    this.alarmUrl =  '/alarmcontroldisplayservice/alarmMonitoring/alarmoperations/'
    this.loginUrl =  `/login?IDToken1=${username}&IDToken2=${password}`

    this.currentPoId = 0
    this.nextPoId = 1
    this.childrens = null
    this.poIds = []
    this.isConfig = false
    this.attributes = null
    this.nextVariants = null
    this.attributesData = null
    this.attribute = null
    this.networkDetails = null
    this.configSet = []
    this.heartBeatInterval = null
    this.includeNonPersistent = false

    this.conn = axios.create({
      baseUrl: url,
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      }),
      withCredentials: true,
      jar: new tough.CookieJar(),
    })
    this.conn.defaults.jar = new tough.CookieJar()
  }
  
  async login(){
    axiosConfig = {
      method: 'post',
      url: this.loginUrl
    }
    const response = await requestWrapper(this.conn, axiosConfig, 'Login in...')
    if (response.status === 200) {
      console.log(response.data.message.green)
    }
    return response.data
  }

  async logout(){
    const response = await requestWrapper(async () => await this.conn.get(this.logoutUrl), 'Logout...')
    if (response.status === 200) {
      console.log(`Logout ${response.statusText}`.green)
    } else {
      console.log(`Logout ${response.statusText}`.red)
    }
    return response.data
  }

  async initialPrompt() {
    const response = await requestWrapper(async () => await this.conn.get(`${this.baseUrl}network/-1?relativeDepth=0:-2&childDepth=1`), 'Starting Topology Browser...')
    if (!response.data.treeNodes) {
      console.log('Nothing in initial promt!'.red)
      return
    }
    const { moType, moName, poId } = response.data.treeNodes[0]
    this.currentPoId = poId
    this.nextPoId = poId
    this.nextVariants = async (input) => await this.nextObjects(input)
    return `${moType}=${moName}`
  }

  async next(input) {
    return await this.nextVariants(input)
  }

  async nextObjects(input){
    const filter = input ? input : ''
    if (this.currentPoId !== this.nextPoId || !this.childrens) {
      this.currentPoId = this.nextPoId
      this.poIds.push(this.currentPoId)
      const response = await requestWrapper(async () => await this.conn.get(`${this.baseUrl}network/${this.currentPoId}`))
      if (response.data.treeNodes) {
        this.childrens = response.data.treeNodes[0].childrens
      }
    }
    let result = this.childrens
            .map(child => `${child.moType}=${child.moName}`)
            .concat(otherCommands)
            .filter(child => child.toLowerCase().includes(filter.toLowerCase()))
            .concat(filter.startsWith('show') ? [filter] : [])
            .concat(filter.startsWith('fdn') ? [filter] : [])
    if (result.includes(filter)) {
      result = result.filter(item => item !== filter)
      result.unshift(filter)
    }
    return result
  }

  async nextAttributes(input) {
    const filter = input ? input : ''
    let result = this.attributes.map(item => item.key).sort((a, b) => a > b ? 1 : -1)
                    .concat(configCommands)
                    .filter(item => item.toLowerCase().includes(filter.toLowerCase()))
                    // .concat(filter.startsWith('set') ? [filter] : [])
    if (result.includes(filter)) {
      result = result.filter(item => item !== filter)
      result.unshift(filter)
    }
    return result
  }

  setIdByCommand(command) {
    const nextChild = this.childrens.filter(child => `${child.moType}=${child.moName}` === command)[0]
    if (nextChild) {
      this.nextPoId = nextChild.poId
      return true
    }
    return false
  }
  
  async show(filter) {
    const response = await requestWrapper(async () => await this.conn.get(`${this.baseUrl}${this.currentPoId}?includeNonPersistent=${this.includeNonPersistent}&stringifyLong=true`))
    if (!response.data.fdn || !response.data.attributes) return
    logAttributes(response.data.fdn, response.data.attributes.filter(item => item.key.match(filter)))
  }
  
  up() {
    if (this.poIds.length > 1) {
      this.poIds.pop()
      this.nextPoId = this.poIds.pop()
      this.currentPoId = this.poIds[this.poIds.length - 1]
    return true
    }
    return false
  }

  async config(fdn) {
    this.isConfig = true
    const responseA = await requestWrapper(async () => await this.conn.get(`${this.baseUrl}${this.currentPoId}?includeNonPersistent=${this.includeNonPersistent}&stringifyLong=true`), 'Reading Attributes...')
    if (!responseA.data.attributes) {
      console.log('Can\'t read attributes'.red)
      return fdn
    }
    const { attributes, namespace, namespaceVersion, neType, neVersion, networkDetails, type} = responseA.data
    const responseD = await requestWrapper(async () => await this.conn.get(`${this.baseUrl}model/${neType}/${neVersion}/${namespace}/${type}/${namespaceVersion}/attributes?includeNonPersistent=${this.includeNonPersistent}`), 'Reading Attributes Data...')
    if (!responseD.data.attributes) {
      console.log('Can\'t read attributes data'.red)
      return fdn
    }
    this.networkDetails = networkDetails
    logDetails(networkDetails)
    this.attributes = attributes
    this.nextVariants = async (input) => await this.nextAttributes(input)
    this.attributesData = responseD.data.attributes
    return `${fdn}(config)`
  }

  end() {
    this.isConfig = false
    this.attribute = null
    this.configSet.length = 0
    this.nextVariants = async (input) => await this.nextObjects(input)
  }

  setAttribute(attribute) {
    if (!this.attributes) return false
    if (!this.attributes.filter(item => item.key === attribute)[0]) return false
    if (!this.attribute) {
      configCommands.push('get')
      configCommands.push('set')
      configCommands.push('description')
    }
    this.attribute = attribute
    return true
  }

  description() {
    const attributeData = this.attributesData.filter(item => item.key === this.attribute)[0]
    if (attributeData) {
      logAttributeData(attributeData)
      if (attributeData.complexRef) {
        console.log(`${attributeData.type.magenta}
    ${attributeData.complexRef.key.cyan}: ${attributeData.complexRef.description.grey}
        `)
        attributeData.complexRef.attributes.forEach(attr => logAttributeData(attr))
      }
    } else {
      console.log('Attribute Not Found!'.yellow)
    }
  }

  get(fdn) {
    const syncStatus = this.networkDetails.filter(item => item.key === 'syncStatus')[0]
    if (syncStatus && syncStatus.value === 'UNSYNCHRONIZED') {
      console.log(`
      ❗ ${syncStatus.key}: ${syncStatus.value} ❗`.yellow)
    }
    const attribute = this.attributes.filter(item => item.key === this.attribute)[0]
    const attributeData = this.attributesData.filter(item => item.key === this.attribute)[0]
    logAttributes(fdn, [attribute])
    console.log(`  ${'Type: '.green + attributeData['type']}    ${attributeData['defaultValue'] ? 'Default: '.yellow + attributeData['defaultValue'] : ''}
    `)
    if (attributeData.constraints && attributeData.constraints.orderingConstraint) banner(attributeData)
  }

  async set() {
    const attributeData = this.attributesData.filter(item => item.key === this.attribute)[0]
    if (!attributeData) return
    if (attributeData.writeBehavior === 'NOT_ALLOWED' || attributeData.immutable) {
      console.log('Attribute Is ReadOnly'.yellow)
      return
    }
    if (this.isConfig) {
      const found = this.configSet.filter(item => item.key === this.attribute)[0]
      const { value } = await inputByType(attributeData)
      if (found) {
        found.value = value
      } else {
        this.configSet.push(
          {
            key: this.attribute,
            value,
            datatype: attributeData.type,
          }
        )
      }
    }
  }

  async commit(fdn) {
    logAttributes(fdn, this.configSet)
    this.configSet.forEach(item => delete item.from)
    const data = {
      poId: this.currentPoId,
      fdn,
      attributes: this.configSet,
    }
    const config = {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      },
    }
    const response = await requestWrapper(async () => await this.conn.put(`${this.baseUrl}${this.currentPoId}`, data, config), 'Commiting Config...')
    if (response.data) {
      logCommit(response.data)
    } else {
      console.log('No data or response!'.red)
    }
    this.configSet.length = 0
    this.end()
    return fdn
  }

  check(fdn) {
    logAttributes(fdn, this.configSet)
    // console.log(JSON.stringify(this.configSet, null, 2))
  }

  home() {
    this.nextPoId = this.poIds.shift()
    this.poIds.length = 0
    this.nextVariants = async (input) => await this.nextObjects(input)
  }

  async fdn(fromFdn, targetFdn) {
    const response1 = await requestWrapper(async () => await this.conn.get(`${this.baseUrl}fdn/${targetFdn}`), 'Browsing to FDN...')
    if (!response1.data.fdn) return fromFdn
    this.poIds.length = 0
    const { fdn, poId } = response1.data
    this.currentPoId = poId
    this.nextPoId = poId
    this.nextVariants = async (input) => await this.nextObjects(input)
    const response2 = await requestWrapper(async () => await this.conn.get(`${this.baseUrl}network/${this.currentPoId}/subTrees`), 'Building FDN path...')
    if (response2.data) {
      if (response2.data.treeNodes.length > 1) {
        response2.data.treeNodes.slice(0, -1).forEach((node) => {
          this.poIds.push(node.poId)
        })
      }
      this.childrens = null
    }
    return fdn
  }

  persistent() {
    this.includeNonPersistent = !this.includeNonPersistent
    console.log(`Include Non Persistent Atrributes Set to: ${this.includeNonPersistent}`.yellow)
  }

  async alarms(fdn) {
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
    const response1 = await requestWrapper(async () => await this.conn.post(`${this.alarmUrl}eventpoids`, eventPoIdsBody, {
      withCredentials: true,
    }), 'Getting Alarms...')
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
    const response2 = await requestWrapper(async () => await this.conn.post(`${this.alarmUrl}getalarmlist/fields`, fieldsBody, {
      withCredentials: true,
    }), 'Getting Alarms Data...')
    if (!Array.isArray(response2.data)) return
    response2.data.forEach(item => {
      const { alarmingObject, presentSeverity, eventTime, specificProblem } = item
      const eventDateTime = new Date(eventTime)
      console.log(`${presentSeverity}\t${eventDateTime.toLocaleDateString()} ${eventDateTime.toLocaleTimeString()}\t${alarmingObject}\t${specificProblem}`)
    })
  }

}


module.exports = TopologyBrowser