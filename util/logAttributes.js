const colors = require('colors')


function transformAttributes(element) {
  if (Array.isArray(element)) {
    return element.map(item => transformAttributes(item))
  }
  if (Array.isArray(element.value)) {
    return { [element.key]: transformAttributes(element.value) }
  }
  return element.key ? { [element.key]: element.value } : element
}


function colorize(attributes) {
  const sorted = attributes.sort ? attributes.sort((a, b) => a.key < b.key ? -1 : 1) : attributes
  return  JSON.stringify(transformAttributes(sorted), null, 1)
            .replace(/["(){}\[\]]/mg, '')
            .replace(/^\s*,*\n/mg, '')
            .replace(/,$/mg, '')
            .replace(/^(\s{2}\w+):/mg, '$1:'.green)
            .replace(/^(\s{4}\w+):/mg, '$1:'.yellow)
            .replace(/^(\s{5}\w+):/mg, '$1:'.cyan)
}


function logAttributes(fdn, attributes) {
  // console.log(JSON.stringify(attributes, null, 2))
  const output = `
  ${'FDN'.yellow.bold}: ${fdn.bold}

${colorize(attributes)}`
  console.log(output)
}

module.exports = logAttributes