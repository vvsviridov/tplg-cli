const axios = require('axios')
const https = require('https')
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')

const logAttributes = require('../util/logAttributes')
const logAttributeData = require('../util/logAttributeData')
const logDetails = require('../util/logDetails')
const logCommit = require('../util/logCommit')
// const logConfig = require('../util/logConfig')
const requestWrapper = require('../util/requestWrapper')
const banner = require('../util/banner')
const inputByType = require('../lib/inputValue')

const otherCommands = ['show', 'config', 'up', 'home', 'exit']
const configCommands = ['commit', 'check', 'end', 'exit']

axiosCookieJarSupport(axios)


class TopologyBrowser {
  constructor(username, password, url) {
    this.logoutUrl = `${url}/logout`
    this.baseUrl =   `${url}/persistentObject/`
    this.loginUrl =  `${url}/login?IDToken1=${username}&IDToken2=${password}`

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

    this.conn = axios.create({
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      }),
      withCredentials: true,
      jar: new tough.CookieJar(),
    })
    this.conn.defaults.jar = new tough.CookieJar()
  }
  
  async login(){
    const response = await requestWrapper(async () => this.conn.post(this.loginUrl), 'Login in...')
    console.log(response.data.message.green)
    return response.data
  }

  async logout(){
    const response = await requestWrapper(async () => this.conn.get(this.logoutUrl), 'Logout...')
    if (response.status === 200) {
      console.log(`Logout ${response.statusText}`.green)
    } else {
      console.log(`Logout ${response.statusText}`.red)
    }
    return response.data
  }

  async initialPrompt() {
    const response = await requestWrapper(async () => this.conn.get(`${this.baseUrl}network/-1?relativeDepth=0:-2&childDepth=1`, {
      withCredentials: true
    }), 'Starting Topology Browser...')
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
      const response = await requestWrapper(async () => this.conn.get(`${this.baseUrl}network/${this.currentPoId}`, {
        withCredentials: true
      }))
      if (response.data) {
        this.childrens = response.data.treeNodes[0].childrens
      }
    }
    let result = this.childrens
            .map(child => `${child.moType}=${child.moName}`)
            .concat(otherCommands)
            .filter(child => child.toLowerCase().includes(filter.toLowerCase()))
            .concat(filter.startsWith('show') ? [filter] : [])
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
                    .concat(filter.startsWith('set') ? [filter] : [])
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
    const response = await requestWrapper(async () => this.conn.get(`${this.baseUrl}${this.currentPoId}?includeNonPersistent=false&stringifyLong=true`, {
      withCredentials: true
    }))
    logAttributes(response.data.fdn, response.data.attributes.filter(item => item.key.toLowerCase().includes(filter.toLowerCase())))
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
    const responseA = await requestWrapper(async () => this.conn.get(`${this.baseUrl}${this.currentPoId}?includeNonPersistent=false&stringifyLong=true`, {
      withCredentials: true
    }), 'Reading Attributes...')
    const { attributes, namespace, namespaceVersion, neType, neVersion, networkDetails, type} = responseA.data
    const responseD = await requestWrapper(async () => this.conn.get(`${this.baseUrl}model/${neType}/${neVersion}/${namespace}/${type}/${namespaceVersion}/attributes?includeNonPersistent=false`, {
      withCredentials: true
    }), 'Reading Attributes Data...')
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
    if (response && response.data) {
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

}


module.exports = TopologyBrowser