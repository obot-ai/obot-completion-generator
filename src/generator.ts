import type {
  MatchedResultData,
  LocaleDataItem,
  CompletionGeneratorProperties
} from './types'

import { Matcher, DefaultMatcher } from './matcher'


export class Generator {
  matcher: Matcher

  constructor(properties: CompletionGeneratorProperties = { keywordSeparator: ",", minKeywordLength: 2, strictMatchLocales: ["en"] }) {
    if (properties.matcher) {
      this.matcher = properties.matcher
    } else {
      this.matcher = new DefaultMatcher({
        keywordSeparator: properties.keywordSeparator || ",",
        minKeywordLength: properties.minKeywordLength || 2,
        strictMatchLocales: properties.strictMatchLocales || ["en"],
        comparator: properties.comparator,
        filter: properties.filter,
        scorer: properties.scorer,
        sort: properties.sort
      })
    }
  }

  /**
   * 候補データをインスタンスにセットする
   * @param locale 言語コード
   * @param localeData 言語データ
   */
  loadData (locale: string, localeData: LocaleDataItem[]) {
    this._validateLocaleData(localeData)
    this.matcher.loadData(locale, localeData)
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
    return this.matcher.match(input, locale)
  }

  get keywordSeparator() {
    return this.matcher.keywordSeparator
  }

  get minKeywordLength() {
    return this.matcher.minKeywordLength
  }

  get strictMatchLocales() {
    return this.matcher.strictMatchLocales
  }

  get data() {
    return this.matcher.data
  }
}
