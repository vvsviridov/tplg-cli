const ora = require('ora')
const logError = require('./logError')


// async function requestWrapper(func, text = 'Reading Topology...') {
//   const spinner = ora(text)
//   let result
//   try {
//     spinner.start()
//     result = await func()
//     spinner.succeed()
//   } catch (err) {
//     result = err.response
//     spinner.fail()
//     logError(err)
//   } finally {
//     return result
//   }
// }

async function requestWrapper(axiosInstance, axiosConfig, text = 'Reading Topology...') {
  const spinner = ora(text)
  let result
  try {
    spinner.start()
    result = await axiosInstance.request(axiosConfig)
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