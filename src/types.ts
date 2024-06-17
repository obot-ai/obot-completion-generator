import type { Matcher } from "./matcher";


export type MatchedResult = {
  isMatched: boolean;
  data?: MatchedResultData;
}

export type MatchedResultData = {
  idx?: number;
  text: string;
  keywords: string;
  matchedKeywords?: MatchedKeyword[];
  noKeywordMatchedLength?: number;  // ForwardMatcherに通した場合のみ付与される、キーワードと判定されていないが、比較対象のテキストに含まれる部分の総長さ
  score?: number;
}

export type MatchedKeyword = {
  text: string;
  startAt: number;
  endAt: number;
}

export type NoMatchedKeywordPart = {
  text: string;
  startAt: number;
  endAt: number;
}

export type LocaleDataItem = {
  idx?: number;
  text: string;
  keywords: string;
}

export type LocaleDataComparator = (itemA: LocaleDataItem, itemB: LocaleDataItem, input: string, locale: string) => number
export type LocaleDateFilter = (localeData: LocaleDataItem[], input: string, locale: string) => MatchedResultData[]
export type MatchedResultDataScorer = ((data: MatchedResultData, input: string, locale: string) => number) | null
export type MatchedResultDataSort = ((rsA: MatchedResultData, rsB: MatchedResultData, input: string, locale: string) => number) | null

export type CompletionMatcherProperties = {
  keywordSeparator?: string;
  minKeywordLength?: number;
  strictMatchLocales?: string[];
  maxResults?: number;
  comparator?: LocaleDataComparator;
  filter?: LocaleDateFilter;
  scorer?: MatchedResultDataScorer;
  sort?: MatchedResultDataSort;
}
export type CompletionGeneratorProperties = {
  keywordSeparator?: string;
  minKeywordLength?: number;
  strictMatchLocales?: string[];
  maxResults?: number;
  comparator?: LocaleDataComparator;
  filter?: LocaleDateFilter;
  scorer?: MatchedResultDataScorer;
  sort?: MatchedResultDataSort;
  matcher?: Matcher;
}

export type CompletionFetcherProperties = {
  apiKey: string;
  apiKeyHeaderName?: string;
  getEndpoint?: GetEndpoint;
  handleResponse?: HandleResponse
}
export type GetEndpoint = (locale: string) => string
export type HandleResponse = (data: any) => LocaleDataItem[]
