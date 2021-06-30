const colors = require('colors')


function logConfig(configSet) {
  const output = configSet.map(config => `    ${config.key.yellow}: ${config.from}->${config.value}   ${config.datatype.grey}`)
  console.log(`
${output.join('\n')}
  `)
}

module.exports = logConfig