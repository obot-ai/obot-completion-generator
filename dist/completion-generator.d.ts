export type LocaleDataItem = {
    text: string;
    keywords: string;
};
export type MatchedResult = {
    isMatched: boolean;
    data?: MatchedResultData;
};
export type MatchedResultData = {
    text: string;
    keywords: string;
    matchedKeywords?: MatchedKeyword[];
};
export type MatchedKeyword = {
    text: string;
    startAt: number;
    endAt: number;
};
export type CompletionGeneratorProperties = {
    keywordSeparator: string;
    minKeywordLength: number;
    strictMatchLocales: string[];
    comparator?: LocaleDataComparator;
    filter?: LocaleDateFilter;
};
export type LocaleDataComparator = (itemA: LocaleDataItem, itemB: LocaleDataItem, input: string, locale: string) => number;
export type LocaleDateFilter = (localeData: LocaleDataItem[], input: string, locale: string) => MatchedResultData[];
export interface CompletionGeneratorInter {
    /** キーワードの分割文字 */
    keywordSeparator: string;
    /** キーワードとして認定する最短長さ */
    minKeywordLength: number;
    /** _strictMatchを使う言語コード設定 */
    strictMatchLocales: string[];
    /** ソート用メソッド */
    comparator?: LocaleDataComparator;
    /** 絞り込み用メソッド */
    filter?: LocaleDateFilter;
    data: Map<string, LocaleDataItem[]>;
    loadData: (locale: string, localeData: LocaleDataItem[]) => void;
    generateCompletions: (input: string, locale: string) => MatchedResultData[];
}
export declare class Generator implements CompletionGeneratorInter {
    keywordSeparator: string;
    minKeywordLength: number;
    strictMatchLocales: string[];
    comparator?: LocaleDataComparator;
    filter?: LocaleDateFilter;
    data: Map<string, LocaleDataItem[]>;
    constructor(properties?: CompletionGeneratorProperties);
    /**
     * 候補データをインスタンスにセットする
     * @param locale 言語コード
     * @param localeData 言語データ
     */
    loadData(locale: string, localeData: LocaleDataItem[]): void;
    _validateLocaleData(localeData: LocaleDataItem[]): void;
    /**
     * 指定入力テキストと言語に対し、補完データを生成して返す
     * @param input 入力テキスト
     * @param locale 言語コード
     * @returns 補完データ
     */
    generateCompletions(input: string, locale: string): MatchedResultData[];
    _getMatchedCompletions(localeData: LocaleDataItem[], input: string, locale: string): MatchedResultData[];
    _match(dataItem: LocaleDataItem, input: string): MatchedResult;
    _strictMatch(dataItem: LocaleDataItem, input: string): MatchedResult;
}
export type CompletionFetcherProperties = {
    apiKey: string;
    apiKeyHeaderName?: string;
    getEndpoint?: GetEndpoint;
    handleResponse?: HandleResponse;
};
export type GetEndpoint = (locale: string) => string;
export type HandleResponse = (data: any) => LocaleDataItem[];
export interface CompletionFetcherInter {
    apiKey: string;
    fetch(locale: string): Promise<LocaleDataItem[]>;
}
export declare class Fetcher implements CompletionFetcherInter {
    apiKey: string;
    apiKeyHeaderName: string;
    getEndpoint: GetEndpoint;
    handleResponse: HandleResponse;
    constructor(properties?: CompletionFetcherProperties);
    /**
     * 指定エンドポイントから候補データを取得
     * @param locale 言語コード
     * @returns
     */
    fetch(locale: string): Promise<LocaleDataItem[]>;
    _fetch(endpoint: string): Promise<any>;
    isFetchAvailable(): boolean;
}
