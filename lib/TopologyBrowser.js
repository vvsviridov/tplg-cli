const logAttributes = require('../util/logAttributes')
const { createAxiosInstance } = require('../util/axiosInstance')

const alarms = require('../lib/commands/alarms')
const login = require('../lib/commands/login')
const logout = require('../lib/commands/logout')
const initialPrompt = require('../lib/commands/initialPrompt')
const nextObjects = require('../lib/commands/nextObjects')
const nextAttributes = require('../lib/commands/nextAttributes')
const setIdByCommand = require('../lib/commands/setIdByCommand')
const show = require('../lib/commands/show')
const up = require('../lib/commands/up')
const config = require('../lib/commands/config')
const end = require('../lib/commands/end')
const setAttribute = require('../lib/commands/setAttribute')
const description = require('../lib/commands/description')
const get = require('../lib/commands/get')
const set = require('../lib/commands/set')
const commit = require('../lib/commands/commit')
const home = require('../lib/commands/home')
const fdn = require('../lib/commands/fdn')


class TopologyBrowser {
  constructor(username, password, url) {
    this.logoutUrl = '/logout'
    this.objectUrl = '/persistentObject/'
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
    this.includeNonPersistent = false

    createAxiosInstance(url)
  }
  
  async login(){
    return await login.call(this)
  }

  async logout(){
    await logout.call(this)
  }

  async initialPrompt() {
    return await initialPrompt.call(this)
  }

  async next(input) {
    return await this.nextVariants(input)
  }

  async nextObjects(input){
    return await nextObjects.call(this, input)
  }

  async nextAttributes(input) {
    return await nextAttributes.call(this, input)
  }

  setIdByCommand(command) {
    return setIdByCommand.call(this, command)
  }
  
  async show(filter) {
    await show.call(this, filter)
  }
  
  up() {
    return up.call(this)
  }

  async config(fdn) {
    return await config.call(this, fdn)
  }

  end() {
    end.call(this)
  }

  setAttribute(attribute) {
    return setAttribute.call(this, attribute)
  }

  description() {
    description.call(this)
  }

  get(fdn) {
    get.call(this, fdn)
  }

  async set() {
    await set.call(this)
  }

  async commit(fdn) {
    return await commit.call(this, fdn)
  }

  check(fdn) {
    logAttributes(fdn, this.configSet)
  }

  home() {
    home.call(this)
  }

  async fdn(fromFdn, targetFdn) {
    return await fdn.call(this, fromFdn, targetFdn)
  }

  persistent() {
    this.includeNonPersistent = !this.includeNonPersistent
    console.log(`Include Non Persistent Atrributes Set to: ${this.includeNonPersistent}`.yellow)
  }

  async alarms(fdn) {
    await alarms.call(this, fdn)
  }

}


module.exports = TopologyBrowser