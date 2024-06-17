<h1 align="center">
  Obot-Completion-Generator
</h1>

<p align="center">
  ObotAI入力補完サーバーデータを基づき、渡される入力テキストに対し、補完候補を生成するためのパッケージ
</p>

<div align="center">

[![CI](https://github.com/obot-ai/obot-completion-generator/actions/workflows/CI.yaml/badge.svg)](https://github.com/obot-ai/obot-completion-generator/actions/workflows/CI.yaml)

</div>

# 利用方法

Obot-Completion-Generatorに `Generator` と `Fetcher` の二つのクラスがあり、 `Fetcher` は ObotAI InputCompletion サーバーなどから候補データ集を取得するクラスで、 `Generator` は予めデータを設定し、入力テキストを渡して補完データを取得するクラスです。

```Javascript
import { Generator, Fetcher, KeywordForwardMatcher } from '@obot-ai/completion-generator'

(async () => {
  const API_KEY = "your-api-key"

  /* Fetcher Constructor

    Args:
      - properties: object
        - apiKey: string: ObotAIが発行したAPIキーなど
        - apiKeyHeaderName?: string: キーをヘッダーに設定する際に使うキー名
        - getEndpoint?: (locale: string) => string: データ取得先を上書きするためのメソッド
          - Args: locale: 言語コード
          - Return: 有効なURL
        - handleResponse?: (data: any) => LocaleDataItem[]: 取得したJSONデータの処理を上書きするためのメソッド
          - Args: data: 任意のJSONレスポンス
          - Return: 有効な言語候補データ集
  */
  const fetcher = new Fetcher({
    apiKey: API_KEY,
    apiKeyHeaderName: "X-Secret-Key",
    getEndpoint: (locale) => {
      return `https://example.com/input_completion/${locale}/`
    },
    handleResponse: (data) => {
      return data.completions
    }
  })

  /* Generator Constructor

    Matchers:
      - ForwardMatcher:
        - 入力文全文を前方一致でマッチする
        - キーワードで判定された部分以外も比較対象テキストに含まれる必要がある
      - KeywordMatcher:
        - キーワードベースの正規表現を用いてマッチする
        - キーワードの全文マッチが優先、マッチがなければ部分マッチを行う
      - ConcatMatcher:
        - 複数のMatcherのマッチ結果を結合して出力する
        - addMatcherByClass, addMatcherで結合対象のMatcherを追加しないとマッチ成功結果が得られない
      - KeywordForwardMatcher:
        - KeywordMatcher, ForwardMatcherをConcatMatcherで結合したクラス
      - DefaultMatcher: ForwardMatcher
    Args:
      - properties: object
        - matcher?: Matcher?:
          - 指定すると他のオプション設定は無視される、していなければ他のオプション設定でDefaultMatcherを構成して使う
        - keywordSeparator?: string: キーワードの分割文字
        - minKeywordLength?: number: キーワードとして認定する最短長さ
        - strictMatchLocales?: string[]: 単語ごとにキーワードをマッチする言語（指定していない言語コードは文字ごとにマッチを行う）
        - comparator?: (itemA: LocaleDataItem, itemB: LocaleDataItem, input: string, locale: string) => number: ソート用メソッド
          - Args:
            - itemA, itemB: LocaleDataItem({text: string, keywords: string}): object: 比較対象
            - input: string: 入力テキスト
            - locale: string: 言語コード
          - Return: 数字で示した比較結果。0: = , >0: >, <0: <
        - filter?: (localeData: LocaleDataItem[], input: string, locale: string) => MatchedResultData[]: 既存のマッチルールを上書きするメソッド
          - KeywordMatcherでのみ有効。廃止予定、カスタマイズしたMatcherの指定を推奨
          - Args:
            - localeData: LocaleDataItem({text: string, keywords: string})[]: 該当言語の候補データ集
            - input: string: 入力テキスト
            - locale: string: 言語コード
          - Return: MachtedResultData[]
            - MatchedResultData: object
              - text: string: 補完テキスト本文
              - keywords: string: キーワード
              - machtedKeywords?: object[]: 比較テキストにあるキーワードとして認定された部分
                - text: string: キーワード本文
                - startAt: int: 位置情報
                - endAt: int: 位置情報
        - scorer?: (data: MatchedResultData, input: string, locale: string) => number: マッチ結果に含まれる情報を用いて点数を付けるメソッド
          - 含まれる情報
            - ForwardMatcherに通した場合、
              - machedKeywords: (text: string, startAt: number, endAt: number)[]: キーワードと判定された部分の情報
              - noKeywordMatchedLength: number: キーワードと判定されていないが、比較対象質問に含まれる部分の総長さ
            - KeywordMatcherに通した場合、
              - machedKeywords: (text: string, startAt: number, endAt: number)[]: キーワードと判定された部分の情報
          - デフォルト: 
            - machedKeywords.length * 10 + noKeywordMatchedLength
        - sort: (rsA: MatchedResultData, rsB: MatchedResultData, input: string, locale: string) => number: マッチ結果をソートするメソッド
          - デフォルト:
            - マッチ結果に付与されているスコアでソートする

  */

  const matcher = new KeywordForwardMatcher({
    keywordSeparator: ",",
    minKeywordLength: 2,
    strictMatchLocales: ["en"],
    comparator: (itemA, itemB, input, locale) => {
      return itemA.text.localeCompare(itemB.text)
    },
    scorer: (data, input, locale) => {
      let score = 0
      if (Array.isArray(data.matchedKeywords)) {
        for (const kw of data.matchedKeywords) {
          score += 10 * kw.text.length
        }
      }
      if (data.noKeywordMatchedLength) {
        score += 0.1 * data.noKeywordMatchedLength
      }
      return score
    },
    sort: (rsA, rsB, input, locale) => {
      return 0
    }
  })

  const generator = new Generator({
    matcher: matcher
  })

  /* Fetcher.fetch(locale)
  
    Args:
      - locale: string: 言語コード
    
    Return: Promise<LocaleDataItem[]>
      - LocaleDataItem
        - text: 補完テキスト本文
        - keywords: キーワード
  */
  const jaData = await fetcher.fetch("ja")
  
  /* Generator.loadData(locale, localeData)

    Args: 
      - locale: string: 言語コード
      - localeData: {text: string, keywords: string}[]: 言語データ
  */
  generator.loadData("ja", jaData)
  
  /* Generator.generateCompletions(input, locale)

    Args:
      - input: string: 比較テキスト
      - locale: string: 言語コード

    Return: MachtedResultData[]
      - MatchedResultData: object
        - text: string: 補完テキスト本文
        - keywords: string: キーワード
        - machtedKeywords?: object[]: 比較テキストにあるキーワードとして認定された部分
          - text: string: キーワード本文
          - startAt: int: 位置情報
          - endAt: int: 位置情報
  */
  const completions = generator.generateCompletions("Test", "ja")
  console.log(completions)
})()
```

## IE11サポート

completion-generatorはデフォルトではIE11にサポートしておりません。IE11で利用したい場合は、 `completion-generator.es5.js` を指定してインポートする必要があります。

```Javascript
import { Generator, Fetcher } from '@obot-ai/completion-generator/dist/completion-generator.es5'

(以下略)
```