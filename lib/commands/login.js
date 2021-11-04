const colors = require('colors')
const requestWrapper = require('../../util/requestWrapper')


async function login(){
  const axiosConfig = {
    method: 'post',
    url: this.loginUrl
  }
  const response = await requestWrapper(axiosConfig, 'Login in...')
  if (response.status === 200) {
    console.log(response.data.message.green)
  }
  return response.data
}


module.exports = login