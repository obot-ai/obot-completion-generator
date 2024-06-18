var A = Object.defineProperty;
var E = (u, t, e) => t in u ? A(u, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : u[t] = e;
var m = (u, t, e) => (E(u, typeof t != "symbol" ? t + "" : t, e), e);
const _ = (u, t) => Array.from(Array(u).keys()).map((e) => e + t), M = (u, t) => !(u.text !== t.text || u.startAt !== t.startAt || u.endAt !== t.endAt);
class p {
  constructor(t = {}) {
    m(this, "keywordSeparator");
    m(this, "minKeywordLength");
    m(this, "strictMatchLocales");
    m(this, "comparator");
    m(this, "filter");
    m(this, "scorer");
    m(this, "sort");
    m(this, "data");
    m(this, "maxResults");
    this.keywordSeparator = t.keywordSeparator || ",", this.minKeywordLength = t.minKeywordLength || 2, this.strictMatchLocales = t.strictMatchLocales || ["en"], t.maxResults && (this.maxResults = t.maxResults), typeof t.comparator == "function" && (this.comparator = t.comparator), typeof t.filter == "function" && (this.filter = t.filter), (typeof t.scorer == "function" || t.scorer === null) && (this.scorer = t.scorer), (typeof t.sort == "function" || t.sort === null) && (this.sort = t.sort), this.data = /* @__PURE__ */ new Map();
  }
  /**
   * 候補データをインスタンスにセットする
   * @param locale 言語コード
   * @param localeData 言語データ
   */
  loadData(t, e) {
    this.data.set(t, e);
  }
  match(t, e) {
    const a = this._match(t, e);
    return this._scoreResults(a, t, e), this._sortResults(a, t, e), this.maxResults && this.maxResults > 0 ? a.slice(0, this.maxResults) : a;
  }
  // @ts-ignore
  _match(t, e) {
    return [];
  }
  _scoreResults(t, e, a) {
    let s = null;
    if (this.scorer ? s = this.scorer : this.scorer !== null && (s = this._defaultScorer), s)
      for (const r of t)
        r.score = s(r, e, a);
  }
  // @ts-ignore
  _defaultScorer(t, e, a) {
    const s = t.text;
    let r = 0;
    if (t.matchedKeywords) {
      r += 10 * t.matchedKeywords.length;
      for (const n of t.matchedKeywords) {
        const o = n.text;
        s.indexOf(o) !== -1 && (r += o.length);
      }
    }
    return t.noKeywordMatchedLength && (r += t.noKeywordMatchedLength), r;
  }
  _sortResults(t, e, a) {
    let s = null;
    this.sort ? s = this.sort : this.sort !== null && (s = this._defaultSort), s && t.sort((r, n) => s(r, n, e, a));
  }
  // @ts-ignore
  _defaultSort(t, e, a, s) {
    return t.score && e.score ? e.score - t.score : 0;
  }
}
class L extends p {
  _match(t, e) {
    const a = this.data.get(e);
    if (!a)
      return [];
    let s = Array.from(a);
    if (this.comparator) {
      const r = this.comparator;
      s.sort((n, o) => r(n, o, t, e));
    }
    if (this.filter) {
      const r = this.filter;
      return r(s, t, e);
    }
    return this._forwardMatch(s, t.toLowerCase(), e);
  }
  _forwardMatch(t, e, a) {
    const s = this.strictMatchLocales.indexOf(a) !== -1, r = [];
    if (t)
      for (const n of t) {
        let o;
        s ? o = this._wordMatch(n, e) : o = this._charMatch(n, e), o.isMatched && o.data && r.push(o.data);
      }
    return r;
  }
  _charMatch(t, e) {
    const a = t.text.toLowerCase(), s = t.keywords.toLowerCase(), r = this.minKeywordLength || 2, n = e.length, o = [];
    let c = 0;
    for (; c < n; ) {
      let y = "", x = e[c];
      if (s.indexOf(x) !== -1) {
        let w = c;
        if (y = x, w < n - 1) {
          for (w += 1; w < n; ) {
            const K = y + e[w];
            if (s.indexOf(K) === -1) {
              w -= 1;
              break;
            }
            y = K, w += 1;
          }
          w === n && (w -= 1);
        }
        y.length >= r && o.push({
          text: y,
          startAt: c,
          endAt: w
        }), c = w + 1;
      } else {
        if (a.indexOf(x) === -1)
          return { isMatched: !1 };
        c += 1;
      }
    }
    const l = [];
    let i = 0, d = null, f = null;
    for (; i < o.length; ) {
      f = o[i];
      let y = (d == null ? void 0 : d.endAt) || -1, x = f.startAt;
      x > y + 1 && l.push({
        text: e.slice(y + 1, x),
        startAt: y + 1,
        endAt: x - 1
      }), d = f, i += 1;
    }
    if (i === 0)
      l.push({
        text: e,
        startAt: 0,
        endAt: n - 1
      });
    else if (f) {
      const y = f.endAt;
      y + 1 < n && l.push({
        text: e.slice(y + 1, n),
        startAt: y + 1,
        endAt: n - 1
      });
    }
    const h = l.every((y) => a.indexOf(y.text) !== -1);
    let g = 0;
    return l.forEach((y) => {
      g += y.text.length;
    }), {
      isMatched: h,
      data: {
        text: t.text,
        keywords: t.keywords,
        matchedKeywords: o,
        noKeywordMatchedLength: g
      }
    };
  }
  _wordMatch(t, e) {
    const a = t.text.toLowerCase(), s = this.keywordSeparator || ",", r = [];
    t.keywords.toLowerCase().split(s).forEach((h) => {
      h.split(" ").forEach((g) => {
        r.push(g);
      });
    });
    const n = e.split(" "), o = n.pop();
    if (!(a.indexOf(o) !== -1 || r.some((h) => h.indexOf(o) !== -1)))
      return { isMatched: !1 };
    const l = n.filter((h) => r.indexOf(h) !== -1).map(
      (h) => {
        const g = e.indexOf(h), y = g + h.length - 1;
        return {
          text: h,
          startAt: g,
          endAt: y
        };
      }
    ), i = n.filter((h) => r.indexOf(h) === -1), d = i.every((h) => a.indexOf(h) !== -1);
    let f = 0;
    return i.forEach((h) => {
      f += h.length;
    }), {
      isMatched: d,
      data: {
        text: t.text,
        keywords: t.keywords,
        matchedKeywords: l,
        noKeywordMatchedLength: f
      }
    };
  }
}
class R extends p {
  constructor() {
    super(...arguments);
    m(this, "exactRegExpMap", /* @__PURE__ */ new Map());
    m(this, "partialRegExpMap", /* @__PURE__ */ new Map());
  }
  loadData(e, a) {
    super.loadData(e, a);
    const s = /* @__PURE__ */ new Set();
    a.forEach((o) => {
      o.keywords.split(this.keywordSeparator).forEach((i) => {
        i.length > 0 && s.add(i.toLowerCase());
      });
    });
    const r = Array.from(s);
    if (r.length === 0)
      return;
    r.sort((o, c) => c.length - o.length), this.exactRegExpMap.set(e, new RegExp(r.join("|"), "g"));
    const n = [];
    r.forEach((o) => {
      if (o.length > this.minKeywordLength) {
        let c = o.slice(0, this.minKeywordLength);
        const l = [c];
        _(o.length - this.minKeywordLength, this.minKeywordLength).forEach((i) => {
          c += o[i], l.push(c);
        }), l.reverse(), n.push(l.join("|"));
      } else
        o.length > 0 && n.push(o);
    }), this.partialRegExpMap.set(e, new RegExp(n.join("|"), "g"));
  }
  _match(e, a) {
    const s = this.data.get(a);
    if (!s)
      return [];
    let r = Array.from(s);
    if (this.comparator) {
      const n = this.comparator;
      r.sort((o, c) => n(o, c, e, a));
    }
    return this._keywordMatch(r, e, a);
  }
  _keywordMatch(e, a, s) {
    const r = [];
    let n = this.exactRegExpMap.get(s);
    if (e && n) {
      let o;
      if (o = a.toLowerCase().match(n), !o) {
        const c = this.partialRegExpMap.get(s);
        c && (o = a.toLowerCase().match(c));
      }
      if (o) {
        let c = 0;
        const l = [];
        for (const i of o) {
          const d = a.indexOf(i, c), f = d + i.length - 1;
          l.push({
            text: i,
            startAt: d,
            endAt: f
          }), c = f;
        }
        for (const i of e) {
          const d = [], f = i.keywords;
          l.forEach((h) => {
            f.indexOf(h.text) !== -1 && d.push(h);
          }), d.length > 0 && r.push({
            text: i.text,
            keywords: i.keywords,
            matchedKeywords: d
          });
        }
      }
    }
    return r;
  }
}
class S extends p {
  constructor(e) {
    super(e);
    m(this, "matchers");
    this.matchers = [];
  }
  addMatcherByClass(e) {
    const a = new e({
      keywordSeparator: this.keywordSeparator,
      minKeywordLength: this.minKeywordLength,
      strictMatchLocales: this.strictMatchLocales,
      comparator: this.comparator
    });
    this.addMatcher(a);
  }
  addMatcher(e) {
    typeof e.loadData == "function" && typeof e.match == "function" && this.matchers.push(e);
  }
  loadData(e, a) {
    const s = JSON.stringify(a);
    this.matchers.forEach((r) => {
      r.loadData(e, JSON.parse(s));
    });
  }
  _match(e, a) {
    const s = [];
    for (const r of this.matchers) {
      const n = r.match(e, a);
      for (const o of n) {
        const c = s.find((l) => l.text === o.text);
        if (c) {
          const l = c.matchedKeywords, i = o.matchedKeywords;
          let d = [];
          l && l.forEach((f) => {
            d.some((h) => M(f, h)) || d.push(f);
          }), i && i.forEach((f) => {
            d.some((h) => M(f, h)) || d.push(f);
          }), d = Array.from(new Set(d)), Object.assign(c, o, {
            matchedKeywords: d
          });
        } else
          s.push(o);
      }
    }
    return s;
  }
}
class D extends S {
  constructor(t) {
    super(t), this.addMatcher(new R({
      ...t,
      scorer: null,
      sort: null
    })), this.addMatcher(new L({
      ...t,
      scorer: null,
      sort: null
    }));
  }
}
const k = L;
class C {
  constructor(t = { keywordSeparator: ",", minKeywordLength: 2, strictMatchLocales: ["en"] }) {
    m(this, "matcher");
    t.matcher ? this.matcher = t.matcher : this.matcher = new k({
      keywordSeparator: t.keywordSeparator || ",",
      minKeywordLength: t.minKeywordLength || 2,
      strictMatchLocales: t.strictMatchLocales || ["en"],
      comparator: t.comparator,
      filter: t.filter,
      scorer: t.scorer,
      sort: t.sort
    });
  }
  /**
   * 候補データをインスタンスにセットする
   * @param locale 言語コード
   * @param localeData 言語データ
   */
  loadData(t, e) {
    this._validateLocaleData(e), this.matcher.loadData(t, e);
  }
  _validateLocaleData(t) {
    if (!(Array.isArray(t) && t.every((e) => typeof e.text == "string" && typeof e.keywords == "string")))
      throw Error("Locale data should be a list of {text: string, keywords: string}");
  }
  /**
   * 指定入力テキストと言語に対し、補完データを生成して返す
   * @param input 入力テキスト
   * @param locale 言語コード
   * @returns 補完データ
   */
  generateCompletions(t, e) {
    return !t || t.length <= 0 ? [] : this.matcher.match(t, e);
  }
  get keywordSeparator() {
    return this.matcher.keywordSeparator;
  }
  get minKeywordLength() {
    return this.matcher.minKeywordLength;
  }
  get strictMatchLocales() {
    return this.matcher.strictMatchLocales;
  }
  get data() {
    return this.matcher.data;
  }
}
class v {
  constructor(t = { apiKey: "" }) {
    m(this, "apiKey");
    m(this, "apiKeyHeaderName", "X-Secret-Key");
    m(this, "getEndpoint");
    m(this, "handleResponse");
    this.apiKey = t.apiKey, t.apiKeyHeaderName && (this.apiKeyHeaderName = t.apiKeyHeaderName), typeof t.getEndpoint == "function" ? this.getEndpoint = t.getEndpoint : this.getEndpoint = (e) => `/input_completion/${e}/`, typeof t.handleResponse == "function" ? this.handleResponse = t.handleResponse : this.handleResponse = (e) => {
      if ("user_says" in e && Array.isArray(e.user_says))
        return e.user_says;
      throw Error("Data should have [user_says](Array<text,keywords>)");
    };
  }
  /**
   * 指定エンドポイントから候補データを取得
   * @param locale 言語コード
   * @returns 
   */
  fetch(t) {
    const e = this.getEndpoint(t);
    return new Promise(async (a, s) => {
      try {
        const r = await this._fetch(e);
        try {
          const n = this.handleResponse(r);
          a(n);
        } catch {
          s(`Invalid data fetched. ${JSON.stringify(r)}`);
        }
        "user_says" in r && Array.isArray(r.user_says);
      } catch (r) {
        s(`Failed to fetch data from ${e}.`), console.error(r);
      }
    });
  }
  _fetch(t) {
    return new Promise(async (e, a) => {
      if (this.isFetchAvailable()) {
        const s = {};
        if (this.apiKey) {
          const n = {};
          n[this.apiKeyHeaderName] = this.apiKey, s.headers = n;
        }
        const r = await fetch(t, s);
        if (r.ok && r.status == 200) {
          const n = await r.json();
          e(n);
        } else
          a(`Failed to fetch data. Status: ${r.status}`);
      } else {
        const s = new XMLHttpRequest();
        s.open("GET", t), this.apiKey && s.setRequestHeader(this.apiKeyHeaderName, this.apiKey), s.onload = () => {
          if (s.status === 200)
            try {
              const r = JSON.parse(s.response);
              e(r);
            } catch {
              a("Invalid response data format.");
            }
          else
            a(`Failed to fetch data. Status: ${s.status}`);
        }, s.onerror = () => {
          a("Unknown error occurred while fetching completion data.");
        }, s.send();
      }
    });
  }
  isFetchAvailable() {
    return typeof window.fetch == "function";
  }
}
export {
  S as ConcatMatcher,
  k as DefaultMatcher,
  v as Fetcher,
  L as ForwardMatcher,
  C as Generator,
  D as KeywordForwardMatcher,
  R as KeywordMatcher,
  p as Matcher
};
