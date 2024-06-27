import { describe, expect, test, vi } from 'vitest'

import { Generator, Fetcher, Matcher, KeywordMatcher, DefaultMatcher, KeywordForwardMatcher, ConcatMatcher, ForwardMatcher } from "../src/index"
import testSuites from "./fixtures/test-suites.json"
import jaData from "./fixtures/ja.json"
import enData from "./fixtures/en.json"

describe("Generator", () => {

  describe("Constructor", () => {
    test("Construct without properties", () => {
      const completionGenerator = new Generator()
      expect(completionGenerator.keywordSeparator).toBe(",")
    })

    test("Construct with [keywordSeparator] property", () => {
      const completionGenerator = new Generator({ keywordSeparator: "|" })
      expect(completionGenerator.keywordSeparator).toBe("|")
    })

    test("Construct with [strictMatchLocales] property", () => {
      const completionGenerator = new Generator({ strictMatchLocales: ["ja", "en"] })
      expect(completionGenerator.strictMatchLocales).toMatchObject(["ja", "en"])
    })

    test("Construct with [minKeywordLength] property", () => {
      const completionGenerator = new Generator({ minKeywordLength: 5 })
      expect(completionGenerator.minKeywordLength).toBe(5)
    })

    test("Construct with [matcher] property", () => {
      const matcher = new Matcher({
        minKeywordLength: 5
      })
      const completionGenerator = new Generator({ matcher })
      expect(completionGenerator.minKeywordLength).toBe(5)
    })
  })

  test("Able to load locale data", () => {
    const completionGenerator = new Generator()

    expect(completionGenerator.data.has("ja")).toBeFalsy()
    completionGenerator.loadData("ja", jaData.user_says)
    expect(completionGenerator.data.has("ja")).toBeTruthy()
    const instanceJaData = completionGenerator.data.get("ja")
    expect(instanceJaData.length).toBe(jaData.user_says.length)

    expect(completionGenerator.data.has("en")).toBeFalsy()
    completionGenerator.loadData("en", enData.user_says)
    expect(completionGenerator.data.has("en")).toBeTruthy()
    const instanceEnData = completionGenerator.data.get("en")
    expect(instanceEnData.length).toBe(enData.user_says.length)
  })

  test("Throw error if locale data invalid", () => {
    const completionGenerator = new Generator()
    expect(() => { completionGenerator.loadData("ja", [{ text: "a" }]) }).toThrowError()
    expect(() => { completionGenerator.loadData("ja", [{ keywords: "a" }]) }).toThrowError()
    expect(() => { completionGenerator.loadData("ja", [{ text: 1, keywords: "" }]) }).toThrowError()
    expect(() => { completionGenerator.loadData("ja", [{ text: {} }]) }).toThrowError()
  })

  test("Match unset Data", () => {
    const completionGenerator = new Generator()
    completionGenerator.loadData("ja", jaData.user_says)

    const result1 = completionGenerator.generateCompletions("test", "en")
    expect(result1).toMatchObject([])
  })

  test("Match unset Data in KeywordMatcher", () => {
    const completionGenerator = new Generator({
      matcher: new KeywordMatcher()
    })
    completionGenerator.loadData("ja", jaData.user_says)

    const result1 = completionGenerator.generateCompletions("test", "en")
    expect(result1).toMatchObject([])
  })

  test("ConcatMatcher addMatcherByClass", () => {
    const localeData = [
      { text: "天気どうですか", keywords: "天気,気候" },
      { text: "天気がいいですね", keywords: "" }
    ]
    const concatMatcher = new ConcatMatcher()
    concatMatcher.addMatcherByClass(KeywordMatcher)
    concatMatcher.addMatcherByClass(ForwardMatcher)
    const completionGenerator = new Generator({
      matcher: concatMatcher
    })
    completionGenerator.loadData("ja", localeData)

    const completions = completionGenerator.generateCompletions("天気がいい", "ja")
    expect(completions.map(cpl => cpl.text)).toEqual([
      "天気どうですか", "天気がいいですね"
    ])
  })

  test("ConcatMatcher addMatcherByClass, Case 2", () => {
    const localeData = [
      { text: "天気どうですか", keywords: "天気,気候" },
      { text: "天気がいいですね", keywords: "" }
    ]
    const concatMatcher = new ConcatMatcher()
    concatMatcher.addMatcherByClass(ForwardMatcher)
    concatMatcher.addMatcherByClass(KeywordMatcher)
    const completionGenerator = new Generator({
      matcher: concatMatcher
    })
    completionGenerator.loadData("ja", localeData)

    const completions = completionGenerator.generateCompletions("天気がいい", "ja")
    expect(completions.map(cpl => cpl.text)).toEqual([
      "天気どうですか", "天気がいいですね"
    ])
  })

  test("Base Matcher returns nothing", () => {
    const completionGenerator = new Generator({
      matcher: new Matcher()
    })
    completionGenerator.loadData("ja", jaData.user_says)

    const result1 = completionGenerator.generateCompletions("corona", "ja")
    expect(result1).toMatchObject([])
  })

  describe.each(
    testSuites
  )('Suite $suiteName', ({
    suiteName,
    locale, generatorProperties,
    matcher, matcherProperties,
    cases, dataset
  }) => {
    let matcherInstance = null
    if (matcher || matcherProperties) {
      let MatcherClass = DefaultMatcher
      if (matcher === 'keyword_forward') {
        MatcherClass = KeywordForwardMatcher
      } else if (matcher === 'keyword') {
        MatcherClass = KeywordMatcher
      }
      matcherInstance = new MatcherClass({
        ...matcherProperties
      })
    }
    let completionGenerator
    if (matcherInstance) {
      completionGenerator = new Generator({
        matcher: matcherInstance
      })
    } else {
      completionGenerator = new Generator(generatorProperties)
    }
    completionGenerator.loadData(locale, dataset)

    test.each(cases)('Case $name', ({name, input, expectedIdx}) => {
      const expectedTexts = expectedIdx.map(idx => dataset[idx].text)
      const results = completionGenerator.generateCompletions(input, locale)
      const resultTexts = results.map(result => result.text)

      expect(resultTexts.length).toBe(expectedTexts.length)
      expect(resultTexts).toEqual(expectedTexts)
    })
  })

  describe("Custom comparator", () => {
    const originData = [
      { text: "あいうえお", keywords: "" },
      { text: "いうえおか", keywords: "" },
      { text: "うえおかき", keywords: "" },
      { text: "えおかきく", keywords: "" },
      { text: "おかきくけ", keywords: "" },
      { text: "かきくけこ", keywords: "" },
      { text: "きくけこさ", keywords: "" },
      { text: "くけこさし", keywords: "" },
      { text: "けこさしす", keywords: "" },
      { text: "こさしすせ", keywords: "" },
      { text: "さしすせそ", keywords: "" }
    ]

    test("LocaleCompare asc", () => {
      const completionGenerator = new Generator({
        comparator(itemA, itemB, input, locale) {
          return itemA.text.localeCompare(itemB.text)
        }
      })
      const reversedData = Array.from(originData).reverse()
      completionGenerator.loadData("ja", reversedData)
      expect(completionGenerator.data.get("ja")).not.toEqual(originData)
  
      const completions = completionGenerator.generateCompletions("えお", "ja")
      expect(completions.map(cpl => cpl.text)).toEqual([
        "あいうえお", "いうえおか", "うえおかき", "えおかきく"
      ])
    })

    test("LocaleCompare desc", () => {
      const completionGenerator = new Generator({
        comparator(itemA, itemB, input, locale) {
          return -1 * itemA.text.localeCompare(itemB.text)
        }
      })
      completionGenerator.loadData("ja", Array.from(originData))
      expect(completionGenerator.data.get("ja")).toEqual(originData)
  
      const completions = completionGenerator.generateCompletions("えお", "ja")
      expect(completions.map(cpl => cpl.text)).toEqual([
        "えおかきく", "うえおかき", "いうえおか", "あいうえお"
      ])
    })

    const originDataWithKeywords = [
      { text: "あいうえお", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "いうえおか", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "うえおかき", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "えおかきく", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "おかきくけ", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "かきくけこ", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "きくけこさ", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "くけこさし", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "けこさしす", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "こさしすせ", keywords: "あいうえおかきくけこさしすせそ,五十音" },
      { text: "さしすせそ", keywords: "あいうえおかきくけこさしすせそ,五十音" }
    ]

    test("KeywordMatcher comparator asc", () => {
      const completionGenerator = new Generator({
        matcher: new KeywordMatcher({
          maxResults: 3,
          comparator(itemA, itemB, input, locale) {
            return itemA.text.localeCompare(itemB.text)
          }
        })
      })
      completionGenerator.loadData("ja", Array.from(originDataWithKeywords))
      const completions = completionGenerator.generateCompletions("五十音", "ja")
      expect(completions.map(cpl => cpl.text)).toEqual(["あいうえお", "いうえおか", "うえおかき"])
    })

    
    test("KeywordMatcher comparator asc", () => {
      const completionGenerator = new Generator({
        matcher: new KeywordMatcher({
          maxResults: 3,
          comparator(itemA, itemB, input, locale) {
            return -1 * itemA.text.localeCompare(itemB.text)
          }
        })
      })
      completionGenerator.loadData("ja", Array.from(originDataWithKeywords))
      const completions = completionGenerator.generateCompletions("五十音", "ja")
      expect(completions.map(cpl => cpl.text)).toEqual(["さしすせそ", "こさしすせ", "けこさしす"])
    })
  })

  test("Custom filter", () => {
    const originData = [
      { text: "あいうえお", keywords: "" },
      { text: "いうえおか", keywords: "" },
      { text: "うえおかき", keywords: "" },
      { text: "えおかきく", keywords: "" },
      { text: "おかきくけ", keywords: "" },
      { text: "かきくけこ", keywords: "" },
      { text: "きくけこさ", keywords: "" },
      { text: "くけこさし", keywords: "" },
      { text: "けこさしす", keywords: "" },
      { text: "こさしすせ", keywords: "" },
      { text: "さしすせそ", keywords: "" }
    ]
    const completionGenerator = new Generator({
      filter(localeData, input, locale) {
        return [
          { text: "あいうえお", keywords: "", matchedKeywords: [] },
          { text: "いうえおか", keywords: "", matchedKeywords: [] }
        ]
      }
    })
    completionGenerator.loadData("ja", originData)
    let completions
    completions = completionGenerator.generateCompletions("い", "ja")
    expect(completions.map(cpl => cpl.text)).toEqual([
      "あいうえお", "いうえおか"
    ])
    completions = completionGenerator.generateCompletions("せ", "ja")
    expect(completions.map(cpl => cpl.text)).not.toEqual([
      "こさしすせ", "さしすせそ"
    ])
    expect(completions.map(cpl => cpl.text)).toEqual([
      "あいうえお", "いうえおか"
    ])
  })

  const dataForCustomSorting = [
    { text: "あいうえお", keywords: "" },
    { text: "いうえおか", keywords: "あいうえお,五十音" },
  ]
  test("Custom Scorer, Case 1", () => {
    const completionGenerator = new Generator({
      scorer(data, input, locale) {
        return 100 * data.matchedKeywords.length + parseInt(data.noKeywordMatchedLength)
      }
    })
    completionGenerator.loadData("ja", Array.from(dataForCustomSorting))
    const completions = completionGenerator.generateCompletions("あいうえお", "ja")
    expect(completions.map(cpl => cpl.text)).toEqual([
      "いうえおか", "あいうえお"
    ])
  })

  test("Custom Scorer, Case 2", () => {
    const completionGenerator = new Generator({
      scorer(data, input, locale) {
        return parseInt(data.noKeywordMatchedLength)
      }
    })
    completionGenerator.loadData("ja", Array.from(dataForCustomSorting))
    const completions = completionGenerator.generateCompletions("あいうえお", "ja")
    expect(completions.map(cpl => cpl.text)).toEqual([
      "あいうえお", "いうえおか"
    ])
  })

  test("Custom sort", () => {
    const completionGenerator = new Generator({
      sort(rsA, rsB, input, locale) {
        return rsA.score - rsB.score
      }
    })
    completionGenerator.loadData("ja", Array.from(dataForCustomSorting))
    const completions = completionGenerator.generateCompletions("あいうえお", "ja")
    expect(completions.map(cpl => cpl.text)).toEqual([
      "あいうえお", "いうえおか"
    ])
  })

  test("ForwardMatcher scoring ja", () => {
    const matcher = new ForwardMatcher({})
    const generator = new Generator({
      matcher: matcher
    })
    generator.loadData("ja", [
      {
          "text": "新型コロナウイルス感染症とは何ですか？",
          "keywords": ""
      },
      {
          "text": "コロナウイルスとはどのようなウイルスですか？",
          "keywords": "コロナウイルス,Corona Virus,COVID19,COVID-19,ころなういるす,新型コロナウイルス,Covid-19,Covid19,covid19,covid-19,COVID,コロナウィルス,ころな,COVIDー19,コロナ,新型コロナウイルス感染症,新型コロナウィルス感染症,コロな,ｺﾛﾅ,ｃoｖiｄ19,新型コロナ,新型コロナウィルス"
      },
      {
          "text": "新型コロナウイルス感染症によって、事業の休止などを余儀なくされ、やむを得ず休業とする場合等にどのようなことに心がければよいのでしょうか。",
          "keywords": "コロナウイルス,Corona Virus,COVID19,COVID-19,ころなういるす,新型コロナウイルス,Covid-19,Covid19,covid19,covid-19,COVID,コロナウィルス,ころな,COVIDー19,コロナ,新型コロナウイルス感染症,新型コロナウィルス感染症,コロな,ｺﾛﾅ,ｃoｖiｄ19,新型コロナ,新型コロナウィルス,休業,一時休業"
      }
    ])

    const cases = [
      {
        input: "ですか",
        expectedScores: [3, 3]
      },
      {
        input: "コロナウイルス",
        expectedScores: [17, 17, 7]
      },
      {
        input: "新型コロナウイルス",
        expectedScores: [19, 10, 9]
      },
      {
        input: "新型コロナウイルスとは",
        expectedScores: [12]
      },
      {
        input: "cOVIDとは",
        expectedScores: [12]
      },
      {
        input: "コロナで休業になったらどうする？",
        expectedScores: []
      },
      {
        input: "こんにちは、COVIDについて教えてもらえますか？",
        expectedScores: []
      },
      {
        input: "こんにちは、新型コロナウイルスについて教えてもらえますか？",
        expectedScores: []
      }
    ]
    for (const cs of cases) {
      const results = generator.generateCompletions(cs.input, "ja")
      expect(results.map(rs => rs.score)).toEqual(cs.expectedScores)
    }
  })

  test("KeywordForwardMatcher scoring ja", () => {
    const matcher = new KeywordForwardMatcher({})
    const generator = new Generator({
      matcher: matcher
    })
    generator.loadData("ja", [
      {
          "text": "新型コロナウイルス感染症とは何ですか？",
          "keywords": ""
      },
      {
          "text": "コロナウイルスとはどのようなウイルスですか？",
          "keywords": "コロナウイルス,Corona Virus,COVID19,COVID-19,ころなういるす,新型コロナウイルス,Covid-19,Covid19,covid19,covid-19,COVID,コロナウィルス,ころな,COVIDー19,コロナ,新型コロナウイルス感染症,新型コロナウィルス感染症,コロな,ｺﾛﾅ,ｃoｖiｄ19,新型コロナ,新型コロナウィルス"
      },
      {
          "text": "新型コロナウイルス感染症によって、事業の休止などを余儀なくされ、やむを得ず休業とする場合等にどのようなことに心がければよいのでしょうか。",
          "keywords": "コロナウイルス,Corona Virus,COVID19,COVID-19,ころなういるす,新型コロナウイルス,Covid-19,Covid19,covid19,covid-19,COVID,コロナウィルス,ころな,COVIDー19,コロナ,新型コロナウイルス感染症,新型コロナウィルス感染症,コロな,ｺﾛﾅ,ｃoｖiｄ19,新型コロナ,新型コロナウィルス,休業,一時休業"
      }
    ])

    const cases = [
      {
        input: "ですか",
        expectedScores: [3, 3]
      },
      {
        input: "コロナウイルス",
        expectedScores: [17, 17, 7]
      },
      {
        input: "新型コロナウイルス",
        expectedScores: [19, 10, 9]
      },
      {
        input: "新型コロナウイルスとは",
        expectedScores: [19, 12]
      },
      {
        input: "cOVIDとは",
        expectedScores: [12, 10]
      },
      {
        input: "コロナで休業になったらどうする？",
        expectedScores: [25, 13]
      },
      {
        input: "こんにちは、COVIDについて教えてもらえますか？",
        expectedScores: [10, 10]
      },
      {
        input: "こんにちは、新型コロナウイルスについて教えてもらえますか？",
        expectedScores: [19, 10]
      }
    ]
    for (const cs of cases) {
      const results = generator.generateCompletions(cs.input, "ja")
      expect(results.map(rs => rs.score)).toEqual(cs.expectedScores)
    }
  })

  test("ForwardMatcher scoring en", () => {
    const matcher = new ForwardMatcher({})
    const generator = new Generator({
      matcher: matcher
    })
    generator.loadData("en", [
      {
          "text": "How is the weather today?",
          "keywords": ""
      },
      {
          "text": "Can you tell me what the weather is today?",
          "keywords": "today,yesterday,tomorrow,how,what"
      },
      {
          "text": "The weather is likely to be bad tomorrow.",
          "keywords": "today,yesterday,tomorrow,good,bad"
      }
    ])

    const cases = [
      {
        input: "how",
        expectedScores: [10, 3]
      },
      {
        input: "how is the weather today",
        expectedScores: [37, 20]
      },
      {
        input: "It seems to be a bad day today.",
        expectedScores: []
      }
    ]
    for (const cs of cases) {
      const results = generator.generateCompletions(cs.input, "en")
      expect(results.map(rs => rs.score)).toEqual(cs.expectedScores)
    }
  })

  test("KeywordForwardMatcher scoring en", () => {
    const matcher = new KeywordForwardMatcher({})
    const generator = new Generator({
      matcher: matcher
    })
    generator.loadData("en", [
      {
          "text": "How is the weather today?",
          "keywords": ""
      },
      {
          "text": "Can you tell me what the weather is today?",
          "keywords": "today,yesterday,tomorrow,how,what"
      },
      {
          "text": "The weather is likely to be bad tomorrow.",
          "keywords": "today,yesterday,tomorrow,good,bad"
      }
    ])

    const cases = [
      {
        input: "how",
        expectedScores: [10, 3]
      },
      {
        input: "how is the weather today",
        expectedScores: [37, 20, 10]
      },
      {
        input: "It seems to be a bad day today.",
        expectedScores: [23, 15]
      }
    ]
    for (const cs of cases) {
      const results = generator.generateCompletions(cs.input, "en")
      expect(results.map(rs => rs.score)).toEqual(cs.expectedScores)
    }
  })
})

describe("Fetcher", () => {
  describe("Constructor", () => {
    test("Construct without properties", () => {
      const fetcher = new Fetcher()
      expect(fetcher.apiKey).toBe("")
      expect(fetcher.getEndpoint('ja')).toBe("/input_completion/ja/")
    })
  })

  test("Fetch from json data", async () => {
    const spy = vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        "ok": true,
        "status": 200,
        async json() {
          return jaData
        }
      }
    })

    const fetcher = new Fetcher({
      apiKey: "test-api-key"
    })
    const fetched = await fetcher.fetch("ja")
    expect(fetched.length).toBe(jaData.user_says.length)
    expect(spy).toBeCalled()
  })

  test("Fetch error from json data", async () => {
    const spy = vi.spyOn(global, "fetch").mockImplementation(async () => {
      return {
        "ok": false,
        "status": 503,
        async json() {
          return jaData
        }
      }
    })

    const fetcher = new Fetcher({
      apiKey: "test-api-key"
    })
    expect(fetcher.fetch("ja")).rejects.toMatch(/^Failed to fetch data from .*/)
    expect(spy).toBeCalled()
  })

  test("Fetch from json data with XMLHttpRequest", async () => {
    const spy = vi.spyOn(Fetcher.prototype, "isFetchAvailable").mockReturnValue(false)
    const xhrMock = {
      open: vi.fn(),
      setRequestHeader: vi.fn(),
      onload: vi.fn(),
      send: vi.fn(),
      response: JSON.stringify(jaData),
      status: 200
    }
    const xhrSpy = vi.spyOn(global, "XMLHttpRequest").mockImplementation(() => xhrMock)

    const fetcher = new Fetcher({
      apiKey: "test-api-key"
    })
    fetcher.fetch("ja").then((fetched) => {
      expect(fetched.length).toBe(jaData.user_says.length)
    })
    xhrMock.onload()
  })

  test("Fetch invalid response format with XMLHttpRequest", async () => {
    const spy = vi.spyOn(Fetcher.prototype, "isFetchAvailable").mockReturnValue(false)
    const xhrMock = {
      open: vi.fn(),
      setRequestHeader: vi.fn(),
      onload: vi.fn(),
      send: vi.fn(),
      response: 'Invalid response format',
      status: 200
    }
    const xhrSpy = vi.spyOn(global, "XMLHttpRequest").mockImplementation(() => xhrMock)

    const fetcher = new Fetcher({
      apiKey: "test-api-key"
    })
    fetcher.fetch("ja").catch(e => {
      expect(e).toMatch(/^Failed to fetch data from .*/)
    })
    xhrMock.onload()
  })

  test("Fetch server error with XMLHttpRequest", async () => {
    const spy = vi.spyOn(Fetcher.prototype, "isFetchAvailable").mockReturnValue(false)
    const xhrMock = {
      open: vi.fn(),
      setRequestHeader: vi.fn(),
      onload: vi.fn(),
      send: vi.fn(),
      response: undefined,
      status: 500
    }
    const xhrSpy = vi.spyOn(global, "XMLHttpRequest").mockImplementation(() => xhrMock)

    const fetcher = new Fetcher({
      apiKey: "test-api-key"
    })
    fetcher.fetch("ja").catch(e => {
      expect(e).toMatch(/^Failed to fetch data from .*/)
    })
    xhrMock.onload()
  })

  test("Fetch error with XMLHttpRequest", async () => {
    const spy = vi.spyOn(Fetcher.prototype, "isFetchAvailable").mockReturnValue(false)
    const xhrMock = {
      open: vi.fn(),
      setRequestHeader: vi.fn(),
      onload: vi.fn(),
      onerror: vi.fn(),
      send: vi.fn(),
      response: undefined,
      status: 0
    }
    const xhrSpy = vi.spyOn(global, "XMLHttpRequest").mockImplementation(() => xhrMock)

    const fetcher = new Fetcher({
      apiKey: "test-api-key"
    })
    fetcher.fetch("ja").catch(e => {
      expect(e).toMatch(/^Failed to fetch data from .*/)
    })
    xhrMock.onerror()
  })

  test("Fetch successfully", async () => {
    const spy = vi.spyOn(Fetcher.prototype, "_fetch").mockImplementation(async () => {
      return {
        "user_says": [
          {"text": "a", "keywords": "b"},
          {"text": "aa", "keywords": ""}
        ]
      }
    })
    const fetcher = new Fetcher({ apiKey: "test-api-key" })
    const fetched = await fetcher.fetch("ja")
    expect(fetched.length).toBe(2)
    expect(spy).toBeCalled()
  })

  test("Fetch invalid", async () => {
    const spy = vi.spyOn(Fetcher.prototype, "_fetch").mockImplementation(async () => {
      return {
        async json() {
          return {}
        }
      }
    })
    const fetcher = new Fetcher({ apiKey: "test-api-key" })
    expect(fetcher.fetch("ja")).rejects.toMatch(/^Invalid data fetched*/)
    expect(spy).toBeCalled()
  })

  test("Fetch error", async () => {
    const spy = vi.spyOn(Fetcher.prototype, "_fetch").mockImplementation(async () => {
      throw Error("Mocked Error")
    })
    const fetcher = new Fetcher({ apiKey: "test-api-key" })
    expect(fetcher.fetch("ja")).rejects.toMatch(/^Failed to fetch data from .*/)
    expect(spy).toBeCalled()
  })

  test("Fetch custom endpoint", async () => {
    const mockedEndpoint = "https://example.com"

    const fetcher = new Fetcher({
      apiKey: "test-api-key",
      getEndpoint(locale) {
        return mockedEndpoint
      }
    })
    const fetchingEndpoint = await fetcher.getEndpoint("ja")
    expect(fetchingEndpoint).toBe(mockedEndpoint)
  })

  test("Fetch custom api key name", async () => {
    const spy = vi.spyOn(Fetcher.prototype, "_fetch").mockImplementation(async (locale, options) => {
      expect(options).toBe({ headers: { "X-Mocked-Key": "test-api-key" } })
    })
    const fetcher = new Fetcher({ apiKey: "test-api-key", apiKeyHeaderName: "X-Mocked-Key" })
    try {
      await fetcher.fetch("ja")
    } catch (e) {}
  })
  
  test("Fetch with custom handler", async () => {
    const spy = vi.spyOn(Fetcher.prototype, "_fetch").mockImplementation(async () => {
      return {
        "completions": [
          {"text": "a", "keywords": "b"},
          {"text": "aa", "keywords": ""}
        ]
      }
    })
    const fetcher = new Fetcher({
      apiKey: "test-api-key",
      handleResponse(data) {
        return data.completions
      }
    })
    fetcher.fetch("ja").then(data => {
      expect(data.length).toBe(2)
      expect(spy).toBeCalled()
    })
  })
})
