const colors = require('colors')

function logDefaultValue(value) {
  return value ? ` default: ${value}` : ''
}


function logAttribute(key, attribute, output) {
  let attrName = key.replace(/([A-Z])/g, ' $1')
  if (attribute !== undefined && attribute !== '') {
    output.push(`${attrName.toLocaleUpperCase().blue}
      ${attribute}
    `)
  }
}


function logConstraints(constraints, output) {
  output.push(`${Object.keys({constraints}).pop().toLocaleUpperCase().blue}`)
  if (constraints.valueRangeConstraints) {
    if (constraints.valueRangeConstraints.minValue !== undefined && constraints.valueRangeConstraints.maxValue !== undefined) {
      output.push(`    Range: ${constraints.valueRangeConstraints.minValue}..${constraints.valueRangeConstraints.maxValue}`)
    }
  }
  ['nullable', 'validContentRegex', 'valueResolution'].forEach(key => {
    if (Object.keys(constraints).includes(key)) {
      output.push(`    ${key.replace(/([A-Z])/g, ' $1').replace(/^([a-z])/g, (l) => l.toUpperCase()).yellow}: ${constraints[key]}`)
    }
  })
}


function logEnumeration(enumeration, output) {
  output.push(`${Object.keys({enumeration}).pop().toLocaleUpperCase().blue}
    ${enumeration.key.cyan}
      ${enumeration.description}`)
  enumeration.enumMembers.forEach(item => output.push(`        ${item.key.yellow} (${item.value}): -- ${item.description.gray}`))
}


function logList(listReference, output) {
  output.push(`${Object.keys({listReference}).pop().toLocaleUpperCase().blue}
    ${listReference.type}`)
  if (listReference.constraints){
    logConstraints(listReference.constraints, output)
  }
}


function logAttributeData(attributeData) {
  const attributeDataKeys = [ 
    'key',
    'type',
    'defaultValue',
    'description',
    'trafficDisturbances',
    'unit',
    'multiplicationFactor',
    'immutable',
    'precondition',
    'dependencies',
    'sideEffects',
    'activeChoiceCase',
  ]

  const output = [`
${attributeData['key'].yellow.bold}: ${attributeData['type'].green} ${logDefaultValue(attributeData['defaultValue'])}
  `]
  attributeDataKeys.slice(3).forEach((key) => logAttribute(key, attributeData[key], output))
  if (attributeData.constraints) {
    logConstraints(attributeData.constraints, output)
  }
  if (attributeData.enumeration) {
    logEnumeration(attributeData.enumeration, output)
  }
  if (attributeData.listReference) {
    logList(attributeData.listReference, output)
  }
  console.log(output.join('\n') + '\n')
}


module.exports = logAttributeData