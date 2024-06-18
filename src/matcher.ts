import type {
  MatchedResultData,
  LocaleDataItem, MatchedResult, MatchedKeyword, NoMatchedKeywordPart,
  LocaleDataComparator, LocaleDateFilter, MatchedResultDataScorer, MatchedResultDataSort,
  CompletionMatcherProperties
} from "./types"
import { range, isSameKeyword } from "./utils"


export interface MatcherInters {
  loadData(locale: string, localeData: LocaleDataItem[]): void;
  match(input: string, locale: string): MatchedResultData[];
}

export class Matcher {
  keywordSeparator: string;
  minKeywordLength: number;
  strictMatchLocales: string[];
  comparator?: LocaleDataComparator;
  filter?: LocaleDateFilter;
  scorer?: MatchedResultDataScorer;
  sort?: MatchedResultDataSort;
  data: Map<string, LocaleDataItem[]>;
  maxResults?: number

  constructor(
    properties: CompletionMatcherProperties = {}
  ) {
    this.keywordSeparator = properties.keywordSeparator || ","
    this.minKeywordLength = properties.minKeywordLength || 2
    this.strictMatchLocales = properties.strictMatchLocales || ["en"]
    if (properties.maxResults) {
      this.maxResults = properties.maxResults
    }
    if (typeof properties.comparator === 'function') {
      this.comparator = properties.comparator
    }
    if (typeof properties.filter === 'function') {
      this.filter = properties.filter
    }
    if (typeof properties.scorer === 'function' || properties.scorer === null) {
      this.scorer = properties.scorer
    }
    if (typeof properties.sort === 'function' || properties.sort === null) {
      this.sort = properties.sort
    }
    this.data = new Map();
  }

  /**
   * 候補データをインスタンスにセットする
   * @param locale 言語コード
   * @param localeData 言語データ
   */
  loadData (locale: string, localeData: LocaleDataItem[]) {
    this.data.set(locale, localeData)
  }

  match(input: string, locale: string): MatchedResultData[] {
    const results = this._match(input, locale)

    this._scoreResults(results, input, locale)
    this._sortResults(results, input, locale)

    if (this.maxResults && this.maxResults > 0) {
      return results.slice(0, this.maxResults)
    }
    return results
  }

  // @ts-ignore
  _match(input: string, locale: string): MatchedResultData[] {
    return []
  }

  _scoreResults(results: MatchedResultData[], input: string, locale: string): void {
    let scorer = null
    if (this.scorer) {
      scorer = this.scorer
    } else if (this.scorer !== null) {
      scorer = this._defaultScorer
    }

    if (scorer) {
      for (const data of results) {
        data.score = scorer(data, input, locale)
      }
    }
  }

  // @ts-ignore
  _defaultScorer(data: MatchedResultData, input: string, locale: string): number {
    const text = data.text
    let score = 0
    if (data.matchedKeywords) {
      score += 10 * data.matchedKeywords.length

      for (const kw of data.matchedKeywords) {
        const kwText = kw.text
        if (text.indexOf(kwText) !== -1) {
          score += kwText.length
        }
      }
    }
    if (data.noKeywordMatchedLength) {
      score += data.noKeywordMatchedLength
    }
    return score
  }

  _sortResults(results: MatchedResultData[], input: string, locale: string) {
    let sort = null
    if (this.sort) {
      sort = this.sort
    } else if (this.sort !== null) {
      sort = this._defaultSort
    }
    if (sort) {
      results.sort((rsA, rsB) => sort(rsA, rsB, input, locale))
    }
  }

  // @ts-ignore
  _defaultSort(rsA: MatchedResultData, rsB: MatchedResultData, input: string, locale: string) {
    if (rsA.score && rsB.score) {
      return rsB.score - rsA.score
    }
    return 0
  }
}

/**
 * 入力文を前方一致でマッチするMatcher
 */
export class ForwardMatcher extends Matcher {

  _match(input: string, locale: string): MatchedResultData[] {
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

    return this._forwardMatch(localeData, input.toLowerCase(), locale)
  }

  _forwardMatch(localeData: LocaleDataItem[], input: string, locale: string): MatchedResultData[] {
    // スペースで単語を区切る言語は、単語ごとにマッチ、そうでない場合は文字ごとにマッチ
    const doStrictMatch = this.strictMatchLocales.indexOf(locale) !== -1

    const results: MatchedResultData[] = []
    if (localeData) {
      for (const item of localeData) {
        let checkResult: MatchedResult
        if (doStrictMatch) {
          checkResult = this._wordMatch(item, input)
        } else {
          checkResult = this._charMatch(item, input)
        }

        if (checkResult.isMatched && checkResult.data) {
          results.push(checkResult.data)
        }
      }
    }
    return results
  }

  _charMatch(dataItem: LocaleDataItem, input: string) {
    const text = dataItem.text.toLowerCase()
    const keywords = dataItem.keywords.toLowerCase()
    const minKeywordLength = this.minKeywordLength || 2
    
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
          if (endAt === inputLength) {
            endAt -= 1
          }
        }

        if (matchedKeyword.length >= minKeywordLength) {
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

    const noMatchedKeywordParts: NoMatchedKeywordPart[] = []  // キーワード判定の部分を取り除いた部分の集合

    let keywordIdx = 0
    let prevKeyword: MatchedKeyword | null = null
    let currentKeyword: MatchedKeyword | null = null
    while (keywordIdx < matchedKeywords.length) {
      currentKeyword = matchedKeywords[keywordIdx]
      let prevEndAt = prevKeyword?.endAt || -1
      let startAt = currentKeyword.startAt

      if (startAt > prevEndAt + 1) {
        noMatchedKeywordParts.push({
          text: input.slice(prevEndAt + 1, startAt),
          startAt: prevEndAt + 1,
          endAt: startAt - 1
        })
      }

      prevKeyword = currentKeyword
      keywordIdx += 1
    }
    if (keywordIdx === 0) {
      noMatchedKeywordParts.push({
        text: input,
        startAt: 0,
        endAt: inputLength - 1
      })
    } else if (currentKeyword) {
      const lastEndAt = currentKeyword.endAt
      if (lastEndAt + 1 < inputLength) {
        noMatchedKeywordParts.push({
          text: input.slice(lastEndAt + 1, inputLength),
          startAt: lastEndAt + 1,
          endAt: inputLength - 1
        })
      }
    }

    const isMatched = noMatchedKeywordParts.every(part => text.indexOf(part.text) !== -1)

    let noKeywordMatchedLength = 0
    noMatchedKeywordParts.forEach((part) => {
      noKeywordMatchedLength += part.text.length
    })

    return {
      isMatched,
      data: {
        text: dataItem.text,
        keywords: dataItem.keywords,
        matchedKeywords, noKeywordMatchedLength
      }
    }
  }

  _wordMatch(dataItem: LocaleDataItem, input: string) {
    // 候補データの質問内容とキーワード
    const text = dataItem.text.toLowerCase()
    const keywordSeparator = this.keywordSeparator || ','
    // 英語などのスペース区切りの言語は、単語ごとにマッチする
    // NOTE: なるべくマッチしやすいよう、複数の単語でできたキーワードも分割して、一単語でもマッチ成功と見なす
    const keywords: string[] = []
    dataItem.keywords.toLowerCase().split(keywordSeparator).forEach(kparts => {
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
        const endAt = startAt + kw.length - 1
        return {
          text: kw,
          startAt: startAt,
          endAt
        }
      }
    )

    const unmatchedParts = inputs.filter(ipt => keywords.indexOf(ipt) === -1)
    const isMatched = unmatchedParts.every(word => text.indexOf(word) !== -1)

    let noKeywordMatchedLength = 0
    unmatchedParts.forEach((part) => {
      noKeywordMatchedLength += part.length
    })

    return {
      isMatched, data: {
        text: dataItem.text,
        keywords: dataItem.keywords,
        matchedKeywords,
        noKeywordMatchedLength
      }
    }
  }
}

export class KeywordMatcher extends Matcher {

  exactRegExpMap: Map<string, RegExp> = new Map()
  partialRegExpMap: Map<string, RegExp> = new Map()

  loadData(locale: string, localeData: LocaleDataItem[]): void {
    super.loadData(locale, localeData)

    const keywordSet: Set<string> = new Set()
    localeData.forEach(item => {
      const itemKeywords = item.keywords
      const splits = itemKeywords.split(this.keywordSeparator)
      splits.forEach(kw => {
        if (kw.length > 0) {
          keywordSet.add(kw.toLowerCase())
        }
      })
    })

    const allKeywords = Array.from(keywordSet)
    if (allKeywords.length === 0) {
      return
    }

    allKeywords.sort((kwA, kwB) => {
      return kwB.length - kwA.length
    })
    this.exactRegExpMap.set(locale, new RegExp(allKeywords.join("|"), "g"))

    const partialPatterns: string[] = []
    allKeywords.forEach(kw => {
      if (kw.length > this.minKeywordLength) {
        let partStr = kw.slice(0, this.minKeywordLength)
        const parts = [partStr]
        range(kw.length - this.minKeywordLength, this.minKeywordLength).forEach(num => {
          partStr += kw[num]
          parts.push(partStr)
        })
        parts.reverse()
        partialPatterns.push(parts.join("|"))
      } else if (kw.length > 0) {
        partialPatterns.push(kw)
      }
    })
    this.partialRegExpMap.set(locale, new RegExp(partialPatterns.join("|"), "g"))
  }

  _match(input: string, locale: string): MatchedResultData[] {
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

    return this._keywordMatch(localeData, input, locale)
  }

  _keywordMatch(localeData: LocaleDataItem[], input: string, locale: string): MatchedResultData[] {
    const results: MatchedResultData[] = []
    let exactRegExp = this.exactRegExpMap.get(locale)
    if (localeData && exactRegExp) {
      let matches: RegExpMatchArray | null
      matches = input.toLowerCase().match(exactRegExp)
      if (!matches) {
        const partialRegExp = this.partialRegExpMap.get(locale)
        if (partialRegExp) {
          matches = input.toLowerCase().match(partialRegExp)
        }
      }
      if (matches) {
        let lastEndAt = 0
        const matchedKeywords: MatchedKeyword[] = []
        for (const match of matches) {
          const startAt = input.indexOf(match, lastEndAt)
          const endAt = startAt + match.length - 1
          matchedKeywords.push({
            text: match,
            startAt: startAt,
            endAt: endAt
          })
          lastEndAt = endAt
        }
        for (const item of localeData) {
          const matched: MatchedKeyword[] = []
          const itemKeywords = item.keywords
          matchedKeywords.forEach(kwItem => {
            if (itemKeywords.indexOf(kwItem.text) !== -1) {
              matched.push(kwItem)
            }
          })
          if (matched.length > 0) {
            results.push({
              text: item.text,
              keywords: item.keywords,
              matchedKeywords: matched
            })
          }
        }
      }
    }

    return results
  }
}

export class ConcatMatcher extends Matcher {
  matchers: Matcher[];

  constructor(properties: CompletionMatcherProperties) {
    super(properties)

    this.matchers = []
  }

  addMatcherByClass(matcherClass: typeof Matcher) {
    const matcher = new matcherClass({
      keywordSeparator: this.keywordSeparator,
      minKeywordLength: this.minKeywordLength,
      strictMatchLocales: this.strictMatchLocales,
      comparator: this.comparator
    })

    this.addMatcher(matcher)
  }

  addMatcher(matcher: Matcher) {
    if (typeof matcher.loadData === 'function' && typeof matcher.match === 'function') {
      this.matchers.push(matcher)
    }
  }

  loadData(locale: string, localeData: LocaleDataItem[]): void {
    const stringifiedData = JSON.stringify(localeData)

    this.matchers.forEach(matcher => {
      matcher.loadData(locale, JSON.parse(stringifiedData))
    })
  }

  _match(input: string, locale: string): MatchedResultData[] {
    const results: MatchedResultData[] = []
    for (const matcher of this.matchers) {
      const matched = matcher.match(input, locale)
      for (const result of matched) {
        const exists = results.find(rt => rt.text === result.text)
        if (exists) {
          const existsMatchedKeywords = exists.matchedKeywords
          const resultMatchedKeywords = result.matchedKeywords
          let mergedMatchedKeywords: MatchedKeyword[] = []
          if (existsMatchedKeywords) {
            existsMatchedKeywords.forEach(kw => {
              if (!mergedMatchedKeywords.some(mkw => isSameKeyword(kw, mkw))) {
                mergedMatchedKeywords.push(kw)
              }
            })
          }
          if (resultMatchedKeywords) {
            resultMatchedKeywords.forEach(kw => {
              if (!mergedMatchedKeywords.some(mkw => isSameKeyword(kw, mkw))) {
                mergedMatchedKeywords.push(kw)
              }
            })
          }
          mergedMatchedKeywords = Array.from(new Set(mergedMatchedKeywords))
          Object.assign(exists, result, {
            matchedKeywords: mergedMatchedKeywords
          })
        } else {
          results.push(result)
        }
      }
    }

    return results
  }
}

export class KeywordForwardMatcher extends ConcatMatcher {
  constructor(properties: CompletionMatcherProperties) {
    super(properties)

    this.addMatcher(new KeywordMatcher({
      ...properties,
      scorer: null,
      sort: null
    }))
    this.addMatcher(new ForwardMatcher({
      ...properties,
      scorer: null,
      sort: null
    }))
  }
}

export const DefaultMatcher = ForwardMatcher