const colors = require('colors')


function logCommit(commitResult) {
  if (commitResult.title === 'Success') {
    console.log(commitResult.title.green)
  }
}

module.exports = logCommit