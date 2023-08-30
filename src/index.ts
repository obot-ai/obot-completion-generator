type LocaleDataItem = {
  text: string;
  keywords: string;
}

type MatchedResult = {
  isMatched: boolean;
  data?: MatchedResultData;
}

type MatchedResultData = {
  text: string;
  keywords: string;
  matchedKeywords?: MatchedKeyword[];
}

type MatchedKeyword = {
  text: string;
  startAt: number;
  endAt: number;
}

type CompletionGeneratorProperties = {
  keywordSeparator: string;
  minKeywordLength: number;
  strictMatchLocales: string[];
  comparator?: LocaleDataComparator;
  filter?: LocaleDateFilter;
}
type LocaleDataComparator = (itemA: LocaleDataItem, itemB: LocaleDataItem, input: string, locale: string) => number
type LocaleDateFilter = (localeData: LocaleDataItem[], input: string, locale: string) => MatchedResultData[]

interface CompletionGeneratorInter {
  /** キーワードの分割文字 */
  keywordSeparator: string
  /** キーワードとして認定する最短長さ */
  minKeywordLength: number
  /** _strictMatchを使う言語コード設定 */
  strictMatchLocales: string[]
  /** ソート用メソッド */
  comparator?: LocaleDataComparator
  /** 絞り込み用メソッド */
  filter?: LocaleDateFilter
  data: Map<string, LocaleDataItem[]>;

  loadData: (locale: string, localeData: LocaleDataItem[]) => void;
  generateCompletions: (input: string, locale: string) => MatchedResultData[];
}

export class Generator implements CompletionGeneratorInter{
  keywordSeparator: string
  minKeywordLength: number
  strictMatchLocales: string[]
  comparator?: LocaleDataComparator
  filter?: LocaleDateFilter
  data: Map<string, LocaleDataItem[]>

  constructor(properties: CompletionGeneratorProperties = { keywordSeparator: ",", minKeywordLength: 2, strictMatchLocales: ["en"] }) {
    this.keywordSeparator = properties.keywordSeparator || ","
    this.minKeywordLength = properties.minKeywordLength || 2
    this.data = new Map()
    this.strictMatchLocales = properties.strictMatchLocales || ["en"]

    if (typeof properties.comparator === 'function') {
      this.comparator = properties.comparator
    }

    if (typeof properties.filter === 'function') {
      this.filter = properties.filter
    }
  }

  /**
   * 候補データをインスタンスにセットする
   * @param locale 言語コード
   * @param localeData 言語データ
   */
  loadData (locale: string, localeData: LocaleDataItem[]) {
    this._validateLocaleData(localeData)
    this.data.set(locale, localeData)
  }

  _validateLocaleData(localeData: LocaleDataItem[]) {
    if (
      !(Array.isArray(localeData) &&
      localeData.every(ld => (typeof ld.text === 'string' && typeof ld.keywords === 'string'))))
    {
      throw Error("Locale data should be a list of {text: string, keywords: string}")
    }
  }

  /**
   * 指定入力テキストと言語に対し、補完データを生成して返す
   * @param input 入力テキスト
   * @param locale 言語コード
   * @returns 補完データ
   */
  generateCompletions(input: string, locale: string): MatchedResultData[] {
    if (!input || input.length <= 0) {
      return []
    }

    const localeDataOrigin = this.data.get(locale)
    if (!localeDataOrigin) {
      return []
    }

    let localeData = Array.from(localeDataOrigin)

    if (this.comparator) {
      const comparator = this.comparator
      localeData.sort((itemA, itemB) => {
        return comparator(itemA, itemB, input, locale)
      })
    }

    if (this.filter) {
      const filter = this.filter
      return filter(localeData, input, locale)
    }

    return this._getMatchedCompletions(localeData, input, locale)
  }

  _getMatchedCompletions(localeData: LocaleDataItem[], input: string, locale: string): MatchedResultData[] {
    const doStrictMatch = this.strictMatchLocales.indexOf(locale) !== -1

    const results: MatchedResultData[] = []
    localeData.forEach(item => {
      let checkResult = null
      if (doStrictMatch) {
        checkResult = this._strictMatch(item, input.toLowerCase())
      } else {
        checkResult = this._match(item, input.toLowerCase())
      }
      if (checkResult.isMatched && checkResult.data) {
        results.push(checkResult.data)
      }
    })
    return results
  }

  _match(dataItem: LocaleDataItem, input: string): MatchedResult {
    // 候補データの質問内容とキーワード
    const text = dataItem.text.toLowerCase()
    const keywords = dataItem.keywords.toLowerCase()
    
    const inputLength = input.length
    const matchedKeywords: MatchedKeyword[] = []

    let startAt = 0  // マッチキーワードの開始位置
    while(startAt < inputLength) {
      let matchedKeyword = ''
      let word = input[startAt]

      if (keywords.indexOf(word) !== -1) {
        let endAt = startAt
        matchedKeyword = word
        if (endAt < inputLength - 1) {
          // 次にまだ文字がある場合

          endAt += 1
          // 最長のマッチできるキーワードを探し出す
          while (endAt < inputLength) {
            const checkWord = matchedKeyword + input[endAt]
            if (keywords.indexOf(checkWord) === -1) {
              endAt -= 1
              break
            }
            matchedKeyword = checkWord
            endAt += 1
          }
        }

        if (matchedKeyword.length >= this.minKeywordLength) {
          // マッチしたキーワードの長さは指定値以上の場合のみ、キーワードとして受け入れる
          matchedKeywords.push({
            text: matchedKeyword,
            startAt: startAt,
            endAt: endAt
          })
        }

        startAt = endAt + 1
      } else if (text.indexOf(word) === -1) {
        // 質問にもキーワードにも存在しない文字があれば、そのinputのマッチが外れとする
        return { isMatched: false }
      } else {
        startAt += 1
      }
    }

    const unmatchedParts: string[] = []

    let keywordIdx = 0
    let prevKeyword: MatchedKeyword | null = null
    let currentKeyword: MatchedKeyword | null = null
    while (keywordIdx < matchedKeywords.length) {
      currentKeyword = matchedKeywords[keywordIdx]
      let prevEndAt = prevKeyword?.endAt || 0
      let startAt = currentKeyword.startAt

      if (startAt > prevEndAt) {
        unmatchedParts.push(input.slice(prevEndAt + 1, startAt))
      }

      prevKeyword = currentKeyword
      keywordIdx += 1
    }
    if (keywordIdx === 0) {
      unmatchedParts.push(input)
    } else if (currentKeyword) {
      const lastEndAt = currentKeyword.endAt
      if (lastEndAt + 1 < inputLength) {
        unmatchedParts.push(input.slice(lastEndAt + 1, inputLength))
      }
    }

    const isMatched = unmatchedParts.every(word => text.indexOf(word) !== -1)

    return {
      isMatched,
      data: {
        text: dataItem.text,
        keywords: dataItem.keywords,
        matchedKeywords
      }
    }
  }

  _strictMatch(dataItem: LocaleDataItem, input: string): MatchedResult {
    // 候補データの質問内容とキーワード
    const text = dataItem.text.toLowerCase()
    // 英語などのスペース区切りの言語は、単語ごとにマッチする
    // NOTE: なるべくマッチしやすいよう、複数の単語でできたキーワードも分割して、一単語でもマッチ成功と見なす
    const keywords: string[] = []
    dataItem.keywords.toLowerCase().split(this.keywordSeparator).forEach(kparts => {
      kparts.split(" ").forEach(kp => {
        keywords.push(kp)
      })
    })

    const inputs = input.split(" ")
    // NOTE: inputがないパターンは既に除外済みで、必ず string になるので、 `as string` を使う
    const lastInputPart = inputs.pop() as string

    // 最後の単語だけは入力途中なので、部分一致でマッチ
    const lastInputMatched = text.indexOf(lastInputPart) !== -1 || keywords.some(kw => kw.indexOf(lastInputPart) !== -1)
    if (!lastInputMatched) {
      return { isMatched: false }
    }

    const matchedKeywords: MatchedKeyword[] = inputs.filter(ipt => keywords.indexOf(ipt) !== -1).map(
      kw => {
        const startAt = input.indexOf(kw)
        const endAt = startAt + kw.length
        return {
          text: kw,
          startAt: startAt,
          endAt
        }
      }
    )

    const unmatchedParts = inputs.filter(ipt => keywords.indexOf(ipt) === -1)
    const isMatched = unmatchedParts.every(word => text.indexOf(word) !== -1)
    
    return {
      isMatched, data: {
        text: dataItem.text,
        keywords: dataItem.keywords,
        matchedKeywords
      }
    }
  }
}


type CompletionFetcherProperties = {
  apiKey: string;
  apiKeyHeaderName?: string;
  getEndpoint?: GetEndpoint;
  handleResponse?: HandleResponse
}
type GetEndpoint = (locale: string) => string
type HandleResponse = (data: any) => LocaleDataItem[]

interface CompletionFetcherInter {
  apiKey: string;

  fetch(locale: string): Promise<LocaleDataItem[]>
}

export class Fetcher implements CompletionFetcherInter {
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
