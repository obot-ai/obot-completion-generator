var K = Object.defineProperty;
var L = (y, t, e) => t in y ? K(y, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : y[t] = e;
var l = (y, t, e) => (L(y, typeof t != "symbol" ? t + "" : t, e), e);
const k = (y, t) => Array.from(Array(y).keys()).map((e) => e + t);
class g {
  constructor(t = {}) {
    l(this, "keywordSeparator");
    l(this, "minKeywordLength");
    l(this, "strictMatchLocales");
    l(this, "comparator");
    l(this, "filter");
    l(this, "data");
    l(this, "maxResults");
    this.keywordSeparator = t.keywordSeparator || ",", this.minKeywordLength = t.minKeywordLength || 2, this.strictMatchLocales = t.strictMatchLocales || ["en"], t.maxResults && (this.maxResults = t.maxResults), typeof t.comparator == "function" && (this.comparator = t.comparator), typeof t.filter == "function" && (this.filter = t.filter), this.data = /* @__PURE__ */ new Map();
  }
  /**
   * 候補データをインスタンスにセットする
   * @param locale 言語コード
   * @param localeData 言語データ
   */
  loadData(t, e) {
    this.data.set(t, e);
  }
  // @ts-ignore
  match(t, e) {
    return [];
  }
}
class M extends g {
  match(t, e) {
    const o = this.data.get(e);
    if (!o)
      return [];
    let s = Array.from(o);
    if (this.comparator) {
      const a = this.comparator;
      s.sort((n, r) => a(n, r, t, e));
    }
    if (this.filter) {
      const a = this.filter;
      return a(s, t, e);
    }
    return this._match(s, t.toLowerCase(), e);
  }
  _match(t, e, o) {
    const s = this.strictMatchLocales.indexOf(o) !== -1, a = [];
    if (t)
      for (const n of t) {
        let r;
        if (s ? r = this._wordMatch(n, e) : r = this._charMatch(n, e), r.isMatched && r.data && a.push(r.data), this.maxResults && a.length >= this.maxResults)
          break;
      }
    return a;
  }
  _charMatch(t, e) {
    const o = t.text.toLowerCase(), s = t.keywords.toLowerCase(), a = this.minKeywordLength || 2, n = e.length, r = [];
    let i = 0;
    for (; i < n; ) {
      let f = "", w = e[i];
      if (s.indexOf(w) !== -1) {
        let m = i;
        if (f = w, m < n - 1)
          for (m += 1; m < n; ) {
            const x = f + e[m];
            if (s.indexOf(x) === -1) {
              m -= 1;
              break;
            }
            f = x, m += 1;
          }
        f.length >= a && r.push({
          text: f,
          startAt: i,
          endAt: m
        }), i = m + 1;
      } else {
        if (o.indexOf(w) === -1)
          return { isMatched: !1 };
        i += 1;
      }
    }
    const c = [];
    let d = 0, u = null, h = null;
    for (; d < r.length; ) {
      h = r[d];
      let f = (u == null ? void 0 : u.endAt) || 0, w = h.startAt;
      w > f && c.push(e.slice(f + 1, w)), u = h, d += 1;
    }
    if (d === 0)
      c.push(e);
    else if (h) {
      const f = h.endAt;
      f + 1 < n && c.push(e.slice(f + 1, n));
    }
    return {
      isMatched: c.every((f) => o.indexOf(f) !== -1),
      data: {
        text: t.text,
        keywords: t.keywords,
        matchedKeywords: r
      }
    };
  }
  _wordMatch(t, e) {
    const o = t.text.toLowerCase(), s = this.keywordSeparator || ",", a = [];
    t.keywords.toLowerCase().split(s).forEach((h) => {
      h.split(" ").forEach((p) => {
        a.push(p);
      });
    });
    const n = e.split(" "), r = n.pop();
    if (!(o.indexOf(r) !== -1 || a.some((h) => h.indexOf(r) !== -1)))
      return { isMatched: !1 };
    const c = n.filter((h) => a.indexOf(h) !== -1).map(
      (h) => {
        const p = e.indexOf(h), f = p + h.length;
        return {
          text: h,
          startAt: p,
          endAt: f
        };
      }
    );
    return {
      isMatched: n.filter((h) => a.indexOf(h) === -1).every((h) => o.indexOf(h) !== -1),
      data: {
        text: t.text,
        keywords: t.keywords,
        matchedKeywords: c
      }
    };
  }
}
class R extends g {
  constructor() {
    super(...arguments);
    l(this, "exactRegExpMap", /* @__PURE__ */ new Map());
    l(this, "partialRegExpMap", /* @__PURE__ */ new Map());
  }
  loadData(e, o) {
    super.loadData(e, o);
    const s = /* @__PURE__ */ new Set();
    o.forEach((r) => {
      r.keywords.split(this.keywordSeparator).forEach((d) => {
        d.length > 0 && s.add(d.toLowerCase());
      });
    });
    const a = Array.from(s);
    if (a.length === 0)
      return;
    a.sort((r, i) => i.length - r.length), this.exactRegExpMap.set(e, new RegExp(a.join("|"), "g"));
    const n = [];
    a.forEach((r) => {
      if (r.length > this.minKeywordLength) {
        let i = r.slice(0, this.minKeywordLength);
        const c = [i];
        k(r.length - this.minKeywordLength, this.minKeywordLength).forEach((d) => {
          i += r[d], c.push(i);
        }), c.reverse(), n.push(c.join("|"));
      } else
        r.length > 0 && n.push(r);
    }), this.partialRegExpMap.set(e, new RegExp(n.join("|"), "g"));
  }
  match(e, o) {
    const s = this.data.get(o);
    if (!s)
      return [];
    let a = Array.from(s);
    if (this.comparator) {
      const n = this.comparator;
      a.sort((r, i) => n(r, i, e, o));
    }
    return this._match(a, e, o);
  }
  _match(e, o, s) {
    const a = [];
    let n = this.exactRegExpMap.get(s);
    if (e && n) {
      let r;
      if (r = o.toLowerCase().match(n), !r) {
        const i = this.partialRegExpMap.get(s);
        i && (r = o.toLowerCase().match(i));
      }
      if (r) {
        const i = r.map((c) => {
          const d = o.indexOf(c);
          return {
            text: c,
            startAt: d,
            endAt: d + c.length
          };
        });
        for (const c of e) {
          const d = [], u = c.keywords;
          if (i.forEach((h) => {
            u.indexOf(h.text) !== -1 && d.push(h);
          }), d.length > 0 && a.push({
            text: c.text,
            keywords: c.keywords,
            matchedKeywords: d
          }), this.maxResults && a.length >= this.maxResults)
            break;
        }
      }
    }
    return a;
  }
}
class E extends g {
  constructor(e) {
    super(e);
    l(this, "matchers");
    this.matchers = [];
  }
  addMatcherByClass(e) {
    const o = new e({
      keywordSeparator: this.keywordSeparator,
      minKeywordLength: this.minKeywordLength,
      strictMatchLocales: this.strictMatchLocales,
      comparator: this.comparator
    });
    this.addMatcher(o);
  }
  addMatcher(e) {
    typeof e.loadData == "function" && typeof e.match == "function" && this.matchers.push(e);
  }
  loadData(e, o) {
    const s = JSON.stringify(o);
    this.matchers.forEach((a) => {
      a.loadData(e, JSON.parse(s));
    });
  }
  match(e, o) {
    const s = [];
    for (const a of this.matchers) {
      const n = a.match(e, o);
      for (const r of n)
        if (s.some((i) => i.text === r.text) || s.push(r), this.maxResults && s.length >= this.maxResults)
          break;
      if (this.maxResults && s.length >= this.maxResults)
        break;
    }
    return s;
  }
}
class O extends E {
  constructor(t) {
    super(t), this.addMatcher(new R(t)), this.addMatcher(new M(t));
  }
}
const A = M;
class _ {
  constructor(t = { keywordSeparator: ",", minKeywordLength: 2, strictMatchLocales: ["en"] }) {
    l(this, "matcher");
    t.matcher ? this.matcher = t.matcher : this.matcher = new A({
      keywordSeparator: t.keywordSeparator || ",",
      minKeywordLength: t.minKeywordLength || 2,
      strictMatchLocales: t.strictMatchLocales || ["en"],
      comparator: t.comparator,
      filter: t.filter
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
class D {
  constructor(t = { apiKey: "" }) {
    l(this, "apiKey");
    l(this, "apiKeyHeaderName", "X-Secret-Key");
    l(this, "getEndpoint");
    l(this, "handleResponse");
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
        const a = await this._fetch(e);
        try {
          const n = this.handleResponse(a);
          o(n);
        } catch {
          s(`Invalid data fetched. ${JSON.stringify(a)}`);
        }
        "user_says" in a && Array.isArray(a.user_says);
      } catch (a) {
        s(`Failed to fetch data from ${e}.`), console.error(a);
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
        const a = await fetch(t, s);
        if (a.ok && a.status == 200) {
          const n = await a.json();
          e(n);
        } else
          o(`Failed to fetch data. Status: ${a.status}`);
      } else {
        const s = new XMLHttpRequest();
        s.open("GET", t), this.apiKey && s.setRequestHeader(this.apiKeyHeaderName, this.apiKey), s.onload = () => {
          if (s.status === 200)
            try {
              const a = JSON.parse(s.response);
              e(a);
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
  E as ConcatMatcher,
  A as DefaultMatcher,
  D as Fetcher,
  M as ForwardMatcher,
  _ as Generator,
  O as KeywordForwardMatcher,
  R as KeywordMatcher,
  g as Matcher
};
