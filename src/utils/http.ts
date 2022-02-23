import axios, { AxiosPromise, AxiosRequestConfig } from 'axios'
import { HttpCodes } from 'server'

const service = axios.create({
  baseURL: '/api',
})

function sponsorRequest<T>(method: 'get' | 'post', requestConfig?: AxiosRequestConfig) {
  return function (url: string, params?: any) {
    const paramsType = method === 'get' ? 'params' : 'data'
    const config = {
      method,
      url,
      [paramsType]: params,
      ...requestConfig,
    }

    return service(config) as AxiosPromise<{ code: HttpCodes; msg: string; data?: T; error?: Error }>
  }
}

async function requestByGet<T>(url: string) {
  const sponsorRequestByGet = sponsorRequest<T>('get')
  const {
    data: { code, data, error },
  } = await sponsorRequestByGet(url)

  if (code === 500) {
    throw error
  }

  return data as T
}

async function requestByPost(url: string, params: any) {
  const sponsorRequestByPost = sponsorRequest('post')
  const {
    data: { code, data, error },
  } = await sponsorRequestByPost(url, params)

  if (code === 500) {
    throw error
  }
  return data
}

export { requestByGet, requestByPost }
