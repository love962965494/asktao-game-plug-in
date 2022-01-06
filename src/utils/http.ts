import axios, { AxiosPromise, AxiosRequestConfig } from 'axios'

const service = axios.create({
  baseURL: '/api',
})

function sponsorRequest(method: 'get' | 'post', requestConfig?: AxiosRequestConfig) {
  return function (url: string, params?: any) {
    const paramsType = method === 'get' ? 'params' : 'data'
    const config = {
      method,
      url,
      [paramsType]: params,
      ...requestConfig,
    }

    return service(config)
  }
}

async function requestByGet(url: string) {
  const sponsorRequestByGet = sponsorRequest('get')

  try {
    const data = await sponsorRequestByGet(url)

    return data
  } catch (error) {
    console.log('requestByGet error: ', error)
  }
}

async function requestByPost(url: string, params: any) {
  const sponsorRequestByPost = sponsorRequest('post')

  try {
    const { data } = await sponsorRequestByPost(url, params)

    return data
  } catch (error) {
    console.log('requestByPost error: ', error)
  }
}

export { requestByGet, requestByPost }
