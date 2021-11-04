function setAttribute(attribute) {
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


module.exports = setAttribute