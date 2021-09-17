const colors = require('colors')


function logError(err) {
  if (err.response && err.response.data && err.response.data.message){
    console.error(`${err.response.status}: ${err.response.statusText}, ${err.response.data.message}`.red)
  } else if (err.response && err.response.data && err.response.data.title) {
    console.log(`${err.response.data.title.red.bold}: ${err.response.data.body.yellow}`)
    console.log(`Error Code ${err.response.data.errorCode.toString().yellow}: ${err.response.data.detail.gray}`)
  } else {
    console.error(err)
  }  
}


module.exports = logError