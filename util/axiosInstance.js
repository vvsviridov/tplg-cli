const axios = require('axios')
const https = require('https')
const axiosCookieJarSupport = require('axios-cookiejar-support').default
const tough = require('tough-cookie')

let axiosInstance

axiosCookieJarSupport(axios)

function createAxiosInstance(url) {
  axiosInstance = axios.create({
    baseURL: url,
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    }),
    withCredentials: true,
    jar: new tough.CookieJar(),
  })
}


function getAxiosInstance() {
  return axiosInstance
}


module.exports = { getAxiosInstance, createAxiosInstance }