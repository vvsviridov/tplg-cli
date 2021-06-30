#!/usr/bin/env node

const program = require('commander')
const pkg = require('../package.json')

const TopologyBrowser = require('../lib/TopologyBrowser')
const inputHandler = require('../lib/inputHandler')
const logError = require('../util/logError')

program
  .version(pkg.version)
  .requiredOption('-l, --login <letters>', 'ENM User Login')
  .requiredOption('-p, --password <letters>', 'ENM User Password')
  .requiredOption('-u, --url <letters>', 'ENM Url')
  .parse(process.argv)


const options = program.opts()


async function main() {
  try {
    const tplg = new TopologyBrowser(options.login, options.password, options.url)
    const result = await tplg.login()
    const { code } = result
    if (code === 'SUCCESS') {
      await inputHandler(tplg)      
      await tplg.logout()
    }
  } catch (err) {
    logError(err)
  }
}

;(async () => main())()
