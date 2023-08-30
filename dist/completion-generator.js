var g = Object.defineProperty;
var x = (l, t, e) => t in l ? g(l, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[t] = e;
var h = (l, t, e) => (x(l, typeof t != "symbol" ? t + "" : t, e), e);
class L {
  constructor(t = { keywordSeparator: ",", minKeywordLength: 2, strictMatchLocales: ["en"] }) {
    h(this, "keywordSeparator");
    h(this, "minKeywordLength");
    h(this, "strictMatchLocales");
    h(this, "comparator");
    h(this, "filter");
    h(this, "data");
    this.keywordSeparator = t.keywordSeparator || ",", this.minKeywordLength = t.minKeywordLength || 2, this.data = /* @__PURE__ */ new Map(), this.strictMatchLocales = t.strictMatchLocales || ["en"], typeof t.comparator == "function" && (this.comparator = t.comparator), typeof t.filter == "function" && (this.filter = t.filter);
  }
  /**
   * 候補データをインスタンスにセットする
   * @param locale 言語コード
   * @param localeData 言語データ
   */
  loadData(t, e) {
    this._validateLocaleData(e), this.data.set(t, e);
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
    if (!t || t.length <= 0)
      return [];
    const n = this.data.get(e);
    if (!n)
      return [];
    let a = Array.from(n);
    if (this.comparator) {
      const s = this.comparator;
      a.sort((r, i) => s(r, i, t, e));
    }
    if (this.filter) {
      const s = this.filter;
      return s(a, t, e);
    }
    return this._getMatchedCompletions(a, t, e);
  }
  _getMatchedCompletions(t, e, n) {
    const a = this.strictMatchLocales.indexOf(n) !== -1, s = [];
    return t.forEach((r) => {
      let i = null;
      a ? i = this._strictMatch(r, e.toLowerCase()) : i = this._match(r, e.toLowerCase()), i.isMatched && i.data && s.push(i.data);
    }), s;
  }
  _match(t, e) {
    const n = t.text.toLowerCase(), a = t.keywords.toLowerCase(), s = e.length, r = [];
    let i = 0;
    for (; i < s; ) {
      let c = "", y = e[i];
      if (a.indexOf(y) !== -1) {
        let d = i;
        if (c = y, d < s - 1)
          for (d += 1; d < s; ) {
            const m = c + e[d];
            if (a.indexOf(m) === -1) {
              d -= 1;
              break;
            }
            c = m, d += 1;
          }
        c.length >= this.minKeywordLength && r.push({
          text: c,
          startAt: i,
          endAt: d
        }), i = d + 1;
      } else {
        if (n.indexOf(y) === -1)
          return { isMatched: !1 };
        i += 1;
      }
    }
    const f = [];
    let u = 0, w = null, o = null;
    for (; u < r.length; ) {
      o = r[u];
      let c = (w == null ? void 0 : w.endAt) || 0, y = o.startAt;
      y > c && f.push(e.slice(c + 1, y)), w = o, u += 1;
    }
    if (u === 0)
      f.push(e);
    else if (o) {
      const c = o.endAt;
      c + 1 < s && f.push(e.slice(c + 1, s));
    }
    return {
      isMatched: f.every((c) => n.indexOf(c) !== -1),
      data: {
        text: t.text,
        keywords: t.keywords,
        matchedKeywords: r
      }
    };
  }
  _strictMatch(t, e) {
    const n = t.text.toLowerCase(), a = [];
    t.keywords.toLowerCase().split(this.keywordSeparator).forEach((o) => {
      o.split(" ").forEach((p) => {
        a.push(p);
      });
    });
    const s = e.split(" "), r = s.pop();
    if (!(n.indexOf(r) !== -1 || a.some((o) => o.indexOf(r) !== -1)))
      return { isMatched: !1 };
    const f = s.filter((o) => a.indexOf(o) !== -1).map(
      (o) => {
        const p = e.indexOf(o), c = p + o.length;
        return {
          text: o,
          startAt: p,
          endAt: c
        };
      }
    );
    return {
      isMatched: s.filter((o) => a.indexOf(o) === -1).every((o) => n.indexOf(o) !== -1),
      data: {
        text: t.text,
        keywords: t.keywords,
        matchedKeywords: f
      }
    };
  }
}
class M {
  constructor(t = { apiKey: "" }) {
    h(this, "apiKey");
    h(this, "apiKeyHeaderName", "X-Secret-Key");
    h(this, "getEndpoint");
    h(this, "handleResponse");
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
    return new Promise(async (n, a) => {
      try {
        const s = await this._fetch(e);
        try {
          const r = this.handleResponse(s);
          n(r);
        } catch {
          a(`Invalid data fetched. ${JSON.stringify(s)}`);
        }
        "user_says" in s && Array.isArray(s.user_says);
      } catch (s) {
        a(`Failed to fetch data from ${e}.`), console.error(s);
      }
    });
  }
  _fetch(t) {
    return new Promise(async (e, n) => {
      if (this.isFetchAvailable()) {
        const a = {};
        if (this.apiKey) {
          const r = {};
          r[this.apiKeyHeaderName] = this.apiKey, a.headers = r;
        }
        const s = await fetch(t, a);
        if (s.ok && s.status == 200) {
          const r = await s.json();
          e(r);
        } else
          n(`Failed to fetch data. Status: ${s.status}`);
      } else {
        const a = new XMLHttpRequest();
        a.open("GET", t), this.apiKey && a.setRequestHeader(this.apiKeyHeaderName, this.apiKey), a.onload = () => {
          if (a.status === 200)
            try {
              const s = JSON.parse(a.response);
              e(s);
            } catch {
              n("Invalid response data format.");
            }
          else
            n(`Failed to fetch data. Status: ${a.status}`);
        }, a.onerror = () => {
          n("Unknown error occurred while fetching completion data.");
        }, a.send();
      }
    });
  }
  isFetchAvailable() {
    return typeof window.fetch == "function";
  }
}
export {
  M as Fetcher,
  L as Generator
};
