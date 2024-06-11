export declare type CompletionFetcherProperties = {
    apiKey: string;
    apiKeyHeaderName?: string;
    getEndpoint?: GetEndpoint;
    handleResponse?: HandleResponse;
};

export declare type CompletionGeneratorProperties = {
    keywordSeparator?: string;
    minKeywordLength?: number;
    strictMatchLocales?: string[];
    maxResults?: number;
    comparator?: LocaleDataComparator;
    filter?: LocaleDateFilter;
    matcher?: Matcher;
};

export declare type CompletionMatcherProperties = {
    keywordSeparator?: string;
    minKeywordLength?: number;
    strictMatchLocales?: string[];
    maxResults?: number;
    comparator?: LocaleDataComparator;
    filter?: LocaleDateFilter;
};

export declare class ConcatMatcher extends Matcher {
    matchers: Matcher[];
    constructor(properties: CompletionMatcherProperties);
    addMatcherByClass(matcherClass: typeof Matcher): void;
    addMatcher(matcher: Matcher): void;
    loadData(locale: string, localeData: LocaleDataItem[]): void;
    match(input: string, locale: string): MatchedResultData[];
}

export declare const DefaultMatcher: typeof ForwardMatcher;

export declare class Fetcher {
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

/**
 * 入力文を前方一致でマッチするMatcher
 */
export declare class ForwardMatcher extends Matcher {
    match(input: string, locale: string): MatchedResultData[];
    _match(localeData: LocaleDataItem[], input: string, locale: string): MatchedResultData[];
    _charMatch(dataItem: LocaleDataItem, input: string): {
        isMatched: boolean;
        data?: undefined;
    } | {
        isMatched: boolean;
        data: {
            text: string;
            keywords: string;
            matchedKeywords: MatchedKeyword[];
        };
    };
    _wordMatch(dataItem: LocaleDataItem, input: string): {
        isMatched: boolean;
        data?: undefined;
    } | {
        isMatched: boolean;
        data: {
            text: string;
            keywords: string;
            matchedKeywords: MatchedKeyword[];
        };
    };
}

declare class Generator_2 {
    matcher: Matcher;
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
    get keywordSeparator(): string;
    get minKeywordLength(): number;
    get strictMatchLocales(): string[];
    get data(): Map<string, LocaleDataItem[]>;
}
export { Generator_2 as Generator }

export declare type GetEndpoint = (locale: string) => string;

export declare type HandleResponse = (data: any) => LocaleDataItem[];

export declare class KeywordForwardMatcher extends ConcatMatcher {
    constructor(properties: CompletionMatcherProperties);
}

export declare class KeywordMatcher extends Matcher {
    exactRegExpMap: Map<string, RegExp>;
    partialRegExpMap: Map<string, RegExp>;
    loadData(locale: string, localeData: LocaleDataItem[]): void;
    match(input: string, locale: string): MatchedResultData[];
    _match(localeData: LocaleDataItem[], input: string, locale: string): MatchedResultData[];
}

export declare type LocaleDataComparator = (itemA: LocaleDataItem, itemB: LocaleDataItem, input: string, locale: string) => number;

export declare type LocaleDataItem = {
    idx?: number;
    text: string;
    keywords: string;
};

export declare type LocaleDateFilter = (localeData: LocaleDataItem[], input: string, locale: string) => MatchedResultData[];

export declare type MatchedKeyword = {
    text: string;
    startAt: number;
    endAt: number;
};

export declare type MatchedResult = {
    isMatched: boolean;
    data?: MatchedResultData;
};

export declare type MatchedResultData = {
    idx?: number;
    text: string;
    keywords: string;
    matchedKeywords?: MatchedKeyword[];
};

export declare class Matcher {
    keywordSeparator: string;
    minKeywordLength: number;
    strictMatchLocales: string[];
    comparator?: LocaleDataComparator;
    filter?: LocaleDateFilter;
    data: Map<string, LocaleDataItem[]>;
    maxResults?: number;
    constructor(properties?: CompletionMatcherProperties);
    /**
     * 候補データをインスタンスにセットする
     * @param locale 言語コード
     * @param localeData 言語データ
     */
    loadData(locale: string, localeData: LocaleDataItem[]): void;
    match(input: string, locale: string): MatchedResultData[];
}

export { }
