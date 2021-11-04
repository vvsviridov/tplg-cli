const colors = require('colors')
const requestWrapper = require('../../util/requestWrapper')


async function logout(){
  const axiosConfig = {
    method: 'get',
    url: this.logoutUrl
  }
  const response = await requestWrapper(axiosConfig, 'Logout...')
  if (response.status === 200) {
    console.log(`Logout ${response.statusText}`.green)
  } else {
    console.log(`Logout ${response.statusText}`.red)
  }
  // return response.data
}


module.exports = logout