const colors = require('colors')


function logDetails(networkDetails) {
  const output = networkDetails.map(details => `    ${details.key.gray}: ${details.value === 'UNSYNCHRONIZED' ? details.value.yellow: details.value.gray}`)
  console.log(`
${output.join('\n')}
  `)
}

module.exports = logDetails