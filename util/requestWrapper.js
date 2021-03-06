const ora = require('ora')
const logError = require('./logError')
const { getAxiosInstance } = require('./axiosInstance')


async function requestWrapper(axiosConfig, text = 'Reading Topology...') {
  const spinner = ora(text)
  let result
  try {
    spinner.start()
    result = await getAxiosInstance().request(axiosConfig)
    spinner.succeed()
  } catch (err) {
    result = err.response
    spinner.fail()
    logError(err)
  } finally {
    return result
  }
}


module.exports = requestWrapper