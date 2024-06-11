import type {
  LocaleDataItem, 
  GetEndpoint, HandleResponse,CompletionFetcherProperties
} from './types'


export class Fetcher {
  apiKey: string
  apiKeyHeaderName: string = "X-Secret-Key"
  getEndpoint: GetEndpoint
  handleResponse: HandleResponse

  constructor(properties: CompletionFetcherProperties = { apiKey: "" }) {
    this.apiKey = properties.apiKey
    if (properties.apiKeyHeaderName) {
      this.apiKeyHeaderName = properties.apiKeyHeaderName
    }
    if (typeof properties.getEndpoint === 'function') {
      this.getEndpoint = properties.getEndpoint
    } else {
      this.getEndpoint = (locale: string) => {
        return `/input_completion/${locale}/`
      }
    }
    if (typeof properties.handleResponse === 'function') {
      this.handleResponse = properties.handleResponse
    } else {
      this.handleResponse = (data) => {
        if ('user_says' in data && Array.isArray(data.user_says)) {
          return data.user_says as LocaleDataItem[]
        }
        throw Error("Data should have [user_says](Array<text,keywords>)")
      }
    }
  }

  /**
   * 指定エンドポイントから候補データを取得
   * @param locale 言語コード
   * @returns 
   */
  fetch(locale: string): Promise<LocaleDataItem[]> {
    const endpoint = this.getEndpoint(locale)

    return new Promise(async (resolve, reject) => {
      try {
        const resData = await this._fetch(endpoint)
        try {
          const handled = this.handleResponse(resData)
          resolve(handled)
        } catch (e) {
          reject(`Invalid data fetched. ${JSON.stringify(resData)}`)
        }
        if ('user_says' in resData && Array.isArray(resData.user_says)) {
          
        }
      } catch (e) {
        reject(`Failed to fetch data from ${endpoint}.`)
        console.error(e)
      }
    })
  }

  _fetch(endpoint: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (this.isFetchAvailable()) {
        const fetchOptions: RequestInit = {}
        if (this.apiKey) {
          const headers: HeadersInit = {}
          headers[this.apiKeyHeaderName] = this.apiKey
          fetchOptions.headers = headers
        }
        const res = await fetch(endpoint, fetchOptions)
        if (res.ok && res.status == 200) {
          const resData = await res.json()
          resolve(resData)
        } else {
          reject(`Failed to fetch data. Status: ${res.status}`)
        }
      } else {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', endpoint)
        if (this.apiKey) {
          xhr.setRequestHeader(this.apiKeyHeaderName, this.apiKey)
        }
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const resData = JSON.parse(xhr.response)
              resolve(resData)
            } catch(e) {
              reject("Invalid response data format.")
            }
          } else {
            reject(`Failed to fetch data. Status: ${xhr.status}`)
          }
        }
        xhr.onerror = () => {
          reject("Unknown error occurred while fetching completion data.")
        }
        xhr.send()
      }
    })
  }

  isFetchAvailable() {
    return typeof window.fetch === 'function'
  }
}
