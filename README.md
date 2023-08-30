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
import { Generator, Fetcher } from '@obot-ai/completion-generator'

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

    Args:
      - properties: object
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
  */
  const generator = new Generator({
    keywordSeparator: ",",
    minKeywordLength: 2,
    strictMatchLocales: ["en"],
    comparator: (itemA, itemB, input, locale) => {
      return itemA.text.localeCompare(itemB.text)
    }
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