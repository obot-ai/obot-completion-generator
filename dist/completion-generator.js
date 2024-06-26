var A = Object.defineProperty;
var E = (y, t, e) => t in y ? A(y, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : y[t] = e;
var u = (y, t, e) => (E(y, typeof t != "symbol" ? t + "" : t, e), e);
const S = (y, t) => Array.from(Array(y).keys()).map((e) => e + t), M = (y, t) => !(y.text !== t.text || y.startAt !== t.startAt || y.endAt !== t.endAt);
class x {
  constructor(t = {}) {
    u(this, "keywordSeparator");
    u(this, "minKeywordLength");
    u(this, "strictMatchLocales");
    u(this, "comparator");
    u(this, "filter");
    u(this, "scorer");
    u(this, "sort");
    u(this, "data");
    u(this, "maxResults");
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
    const o = this._match(t, e);
    return this._scoreResults(o, t, e), this._sortResults(o, t, e), this.maxResults && this.maxResults > 0 ? o.slice(0, this.maxResults) : o;
  }
  // @ts-ignore
  _match(t, e) {
    return [];
  }
  _scoreResults(t, e, o) {
    let s = null;
    if (this.scorer ? s = this.scorer.bind(this) : this.scorer !== null && (s = this._defaultScorer.bind(this)), s)
      for (const r of t)
        r.score = s(r, e, o);
  }
  // @ts-ignore
  _defaultScorer(t, e, o) {
    const s = t.text.toLowerCase();
    let r = 0;
    if (t.matchedKeywords) {
      r += 10 * t.matchedKeywords.length;
      for (const n of t.matchedKeywords) {
        const a = n.text.toLowerCase();
        let h = 0;
        s.indexOf(a) !== -1 && (h = a.length), r += h;
      }
    }
    return t.noKeywordMatchedLength && (r += t.noKeywordMatchedLength), r;
  }
  _sortResults(t, e, o) {
    let s = null;
    this.sort ? s = this.sort.bind(this) : this.sort !== null && (s = this._defaultSort.bind(this)), s && t.sort((r, n) => s(r, n, e, o));
  }
  // @ts-ignore
  _defaultSort(t, e, o, s) {
    return t.score && e.score ? e.score - t.score : 0;
  }
}
class L extends x {
  _match(t, e) {
    const o = this.data.get(e);
    if (!o)
      return [];
    let s = Array.from(o);
    if (this.comparator) {
      const r = this.comparator;
      s.sort((n, a) => r(n, a, t, e));
    }
    if (this.filter) {
      const r = this.filter;
      return r(s, t, e);
    }
    return this._forwardMatch(s, t.toLowerCase(), e);
  }
  _forwardMatch(t, e, o) {
    const s = this.strictMatchLocales.indexOf(o) !== -1, r = [];
    if (t)
      for (const n of t) {
        let a;
        s ? a = this._wordMatch(n, e) : a = this._charMatch(n, e), a.isMatched && a.data && r.push(a.data);
      }
    return r;
  }
  _charMatch(t, e) {
    const o = t.text.toLowerCase(), s = t.keywords.toLowerCase(), r = this.minKeywordLength || 2, n = e.length, a = [];
    let h = 0;
    for (; h < n; ) {
      let c = "", w = e[h];
      if (s.indexOf(w) !== -1) {
        let m = h;
        if (c = w, m < n - 1) {
          for (m += 1; m < n; ) {
            const K = c + e[m];
            if (s.indexOf(K) === -1) {
              m -= 1;
              break;
            }
            c = K, m += 1;
          }
          m === n && (m -= 1);
        }
        c.length >= r && a.push({
          text: c,
          startAt: h,
          endAt: m
        }), h = m + 1;
      } else {
        if (o.indexOf(w) === -1)
          return { isMatched: !1 };
        h += 1;
      }
    }
    const l = [];
    let i = 0, d = null, f = null;
    for (; i < a.length; ) {
      f = a[i];
      let c = (d == null ? void 0 : d.endAt) || -1, w = f.startAt;
      w > c + 1 && l.push({
        text: e.slice(c + 1, w),
        startAt: c + 1,
        endAt: w - 1
      }), d = f, i += 1;
    }
    if (i === 0)
      l.push({
        text: e,
        startAt: 0,
        endAt: n - 1
      });
    else if (f) {
      const c = f.endAt;
      c + 1 < n && l.push({
        text: e.slice(c + 1, n),
        startAt: c + 1,
        endAt: n - 1
      });
    }
    const g = l.every((c) => o.indexOf(c.text) !== -1);
    let p = 0;
    return l.forEach((c) => {
      p += c.text.length;
    }), {
      isMatched: g,
      data: {
        text: t.text,
        keywords: t.keywords,
        matchedKeywords: a,
        noKeywordMatchedLength: p
      }
    };
  }
  _wordMatch(t, e) {
    const o = t.text.toLowerCase(), s = this.keywordSeparator || ",", r = [];
    t.keywords.toLowerCase().split(s).forEach((c) => {
      c.split(" ").forEach((w) => {
        r.push(w);
      });
    });
    const n = e.split(" "), a = n.pop(), h = r.some((c) => c.indexOf(a) !== -1);
    if (!(h || o.indexOf(a) !== -1))
      return { isMatched: !1 };
    const i = [];
    let d = 0;
    for (const c of n.filter((w) => r.indexOf(w) !== -1)) {
      const w = e.indexOf(c, d), m = w + c.length - 1;
      i.push({
        text: c,
        startAt: w,
        endAt: m
      }), d = m;
    }
    if (h) {
      const c = e.indexOf(a, d);
      i.push({
        text: a,
        startAt: c,
        endAt: c + a.length - 1
      });
    }
    const f = n.filter((c) => r.indexOf(c) === -1), g = f.every((c) => o.indexOf(c) !== -1);
    let p = h ? 0 : a.length;
    return f.forEach((c) => {
      p += c.length;
    }), {
      isMatched: g,
      data: {
        text: t.text,
        keywords: t.keywords,
        matchedKeywords: i,
        noKeywordMatchedLength: p
      }
    };
  }
}
class k extends x {
  constructor() {
    super(...arguments);
    u(this, "exactRegExpMap", /* @__PURE__ */ new Map());
    u(this, "partialRegExpMap", /* @__PURE__ */ new Map());
  }
  loadData(e, o) {
    super.loadData(e, o);
    const s = /* @__PURE__ */ new Set();
    o.forEach((a) => {
      a.keywords.split(this.keywordSeparator).forEach((i) => {
        i.length > 0 && s.add(i.toLowerCase());
      });
    });
    const r = Array.from(s);
    if (r.length === 0)
      return;
    r.sort((a, h) => h.length - a.length), this.exactRegExpMap.set(e, new RegExp(r.join("|"), "g"));
    const n = [];
    r.forEach((a) => {
      if (a.length > this.minKeywordLength) {
        let h = a.slice(0, this.minKeywordLength);
        const l = [h];
        S(a.length - this.minKeywordLength, this.minKeywordLength).forEach((i) => {
          h += a[i], l.push(h);
        }), l.reverse(), n.push(l.join("|"));
      } else
        a.length > 0 && n.push(a);
    }), this.partialRegExpMap.set(e, new RegExp(n.join("|"), "g"));
  }
  _match(e, o) {
    const s = this.data.get(o);
    if (!s)
      return [];
    let r = Array.from(s);
    if (this.comparator) {
      const n = this.comparator;
      r.sort((a, h) => n(a, h, e, o));
    }
    return this._keywordMatch(r, e.toLowerCase(), o);
  }
  _keywordMatch(e, o, s) {
    const r = [];
    let n = this.exactRegExpMap.get(s);
    if (e && n) {
      let a;
      if (a = o.match(n), !a) {
        const h = this.partialRegExpMap.get(s);
        h && (a = o.match(h));
      }
      if (a) {
        let h = 0;
        const l = [];
        for (const i of a) {
          const d = o.indexOf(i, h), f = d + i.length - 1;
          l.push({
            text: i,
            startAt: d,
            endAt: f
          }), h = f;
        }
        for (const i of e) {
          const d = [], f = i.keywords.toLowerCase();
          l.forEach((g) => {
            f.indexOf(g.text) !== -1 && d.push(g);
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
class _ extends x {
  constructor(e) {
    super(e);
    u(this, "matchers");
    this.matchers = [];
  }
  addMatcherByClass(e) {
    const o = new e({
      keywordSeparator: this.keywordSeparator,
      minKeywordLength: this.minKeywordLength,
      strictMatchLocales: this.strictMatchLocales,
      comparator: this.comparator,
      scorer: null,
      sort: null
    });
    this.addMatcher(o);
  }
  addMatcher(e) {
    typeof e.loadData == "function" && typeof e.match == "function" && this.matchers.push(e);
  }
  loadData(e, o) {
    const s = JSON.stringify(o);
    this.matchers.forEach((r) => {
      r.loadData(e, JSON.parse(s));
    });
  }
  _match(e, o) {
    const s = [];
    for (const r of this.matchers) {
      const n = r.match(e, o);
      for (const a of n) {
        const h = s.find((l) => l.text === a.text);
        if (h) {
          const l = h.matchedKeywords, i = a.matchedKeywords;
          let d = [];
          l && l.forEach((f) => {
            d.some((g) => M(f, g)) || d.push(f);
          }), i && i.forEach((f) => {
            d.some((g) => M(f, g)) || d.push(f);
          }), d = Array.from(new Set(d)), Object.assign(h, a, {
            matchedKeywords: d
          });
        } else
          s.push(a);
      }
    }
    return s;
  }
}
class D extends _ {
  constructor(t) {
    super(t), this.addMatcher(new k({
      keywordSeparator: this.keywordSeparator,
      minKeywordLength: this.minKeywordLength,
      strictMatchLocales: this.strictMatchLocales,
      comparator: this.comparator
    })), this.addMatcher(new L({
      keywordSeparator: this.keywordSeparator,
      minKeywordLength: this.minKeywordLength,
      strictMatchLocales: this.strictMatchLocales,
      comparator: this.comparator
    }));
  }
}
const R = L;
class C {
  constructor(t = { keywordSeparator: ",", minKeywordLength: 2, strictMatchLocales: ["en"] }) {
    u(this, "matcher");
    t.matcher ? this.matcher = t.matcher : this.matcher = new R({
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
    u(this, "apiKey");
    u(this, "apiKeyHeaderName", "X-Secret-Key");
    u(this, "getEndpoint");
    u(this, "handleResponse");
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
    return new Promise(async (o, s) => {
      try {
        const r = await this._fetch(e);
        try {
          const n = this.handleResponse(r);
          o(n);
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
    return new Promise(async (e, o) => {
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
          o(`Failed to fetch data. Status: ${r.status}`);
      } else {
        const s = new XMLHttpRequest();
        s.open("GET", t), this.apiKey && s.setRequestHeader(this.apiKeyHeaderName, this.apiKey), s.onload = () => {
          if (s.status === 200)
            try {
              const r = JSON.parse(s.response);
              e(r);
            } catch {
              o("Invalid response data format.");
            }
          else
            o(`Failed to fetch data. Status: ${s.status}`);
        }, s.onerror = () => {
          o("Unknown error occurred while fetching completion data.");
        }, s.send();
      }
    });
  }
  isFetchAvailable() {
    return typeof window.fetch == "function";
  }
}
export {
  _ as ConcatMatcher,
  R as DefaultMatcher,
  v as Fetcher,
  L as ForwardMatcher,
  C as Generator,
  D as KeywordForwardMatcher,
  k as KeywordMatcher,
  x as Matcher
};
