var e=function(t,r){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])},e(t,r)};function t(t,r){if("function"!=typeof r&&null!==r)throw new TypeError("Class extends value "+String(r)+" is not a constructor or null");function n(){this.constructor=t}e(t,r),t.prototype=null===r?Object.create(r):(n.prototype=r.prototype,new n)}var r=function(){return r=Object.assign||function(e){for(var t,r=1,n=arguments.length;r<n;r++)for(var a in t=arguments[r])Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a]);return e},r.apply(this,arguments)};function n(e,t,r,n){return new(r||(r=Promise))((function(a,o){function i(e){try{u(n.next(e))}catch(e){o(e)}}function c(e){try{u(n.throw(e))}catch(e){o(e)}}function u(e){var t;e.done?a(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(i,c)}u((n=n.apply(e,t||[])).next())}))}function a(e,t){var r,n,a,o,i={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]};return o={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function c(c){return function(u){return function(c){if(r)throw new TypeError("Generator is already executing.");for(;o&&(o=0,c[0]&&(i=0)),i;)try{if(r=1,n&&(a=2&c[0]?n.return:c[0]?n.throw||((a=n.return)&&a.call(n),0):n.next)&&!(a=a.call(n,c[1])).done)return a;switch(n=0,a&&(c=[2&c[0],a.value]),c[0]){case 0:case 1:a=c;break;case 4:return i.label++,{value:c[1],done:!1};case 5:i.label++,n=c[1],c=[0];continue;case 7:c=i.ops.pop(),i.trys.pop();continue;default:if(!(a=i.trys,(a=a.length>0&&a[a.length-1])||6!==c[0]&&2!==c[0])){i=0;continue}if(3===c[0]&&(!a||c[1]>a[0]&&c[1]<a[3])){i.label=c[1];break}if(6===c[0]&&i.label<a[1]){i.label=a[1],a=c;break}if(a&&i.label<a[2]){i.label=a[2],i.ops.push(c);break}a[2]&&i.ops.pop(),i.trys.pop();continue}c=t.call(e,i)}catch(e){c=[6,e],n=0}finally{r=a=0}if(5&c[0])throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}([c,u])}}}"function"==typeof SuppressedError&&SuppressedError;var o=function(e,t){return e.text===t.text&&e.startAt===t.startAt&&e.endAt===t.endAt},i=function(){function e(e){void 0===e&&(e={}),Object.defineProperty(this,"keywordSeparator",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"minKeywordLength",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"strictMatchLocales",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"comparator",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"filter",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"scorer",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"sort",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"data",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"maxResults",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.keywordSeparator=e.keywordSeparator||",",this.minKeywordLength=e.minKeywordLength||2,this.strictMatchLocales=e.strictMatchLocales||["en"],e.maxResults&&(this.maxResults=e.maxResults),"function"==typeof e.comparator&&(this.comparator=e.comparator),"function"==typeof e.filter&&(this.filter=e.filter),"function"!=typeof e.scorer&&null!==e.scorer||(this.scorer=e.scorer),"function"!=typeof e.sort&&null!==e.sort||(this.sort=e.sort),this.data=new Map}return Object.defineProperty(e.prototype,"loadData",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){this.data.set(e,t)}}),Object.defineProperty(e.prototype,"match",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){var r=this._match(e,t);return this._scoreResults(r,e,t),this._sortResults(r,e,t),this.maxResults&&this.maxResults>0?r.slice(0,this.maxResults):r}}),Object.defineProperty(e.prototype,"_match",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){return[]}}),Object.defineProperty(e.prototype,"_scoreResults",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t,r){var n=null;if(this.scorer?n=this.scorer:null!==this.scorer&&(n=this._defaultScorer),n)for(var a=0,o=e;a<o.length;a++){var i=o[a];i.score=n(i,t,r)}}}),Object.defineProperty(e.prototype,"_defaultScorer",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t,r){var n=e.text,a=0;if(e.matchedKeywords){a+=10*e.matchedKeywords.length;for(var o=0,i=e.matchedKeywords;o<i.length;o++){var c=i[o].text;-1!==n.indexOf(c)&&(a+=c.length)}}return e.noKeywordMatchedLength&&(a+=e.noKeywordMatchedLength),a}}),Object.defineProperty(e.prototype,"_sortResults",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t,r){var n=null;this.sort?n=this.sort:null!==this.sort&&(n=this._defaultSort),n&&e.sort((function(e,a){return n(e,a,t,r)}))}}),Object.defineProperty(e.prototype,"_defaultSort",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t,r,n){return e.score&&t.score?t.score-e.score:0}}),e}(),c=function(e){function r(){return null!==e&&e.apply(this,arguments)||this}return t(r,e),Object.defineProperty(r.prototype,"_match",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){var r=this.data.get(t);if(!r)return[];var n=Array.from(r);if(this.comparator){var a=this.comparator;n.sort((function(r,n){return a(r,n,e,t)}))}return this.filter?(0,this.filter)(n,e,t):this._forwardMatch(n,e.toLowerCase(),t)}}),Object.defineProperty(r.prototype,"_forwardMatch",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t,r){var n=-1!==this.strictMatchLocales.indexOf(r),a=[];if(e)for(var o=0,i=e;o<i.length;o++){var c=i[o],u=void 0;(u=n?this._wordMatch(c,t):this._charMatch(c,t)).isMatched&&u.data&&a.push(u.data)}return a}}),Object.defineProperty(r.prototype,"_charMatch",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){for(var r=e.text.toLowerCase(),n=e.keywords.toLowerCase(),a=this.minKeywordLength||2,o=t.length,i=[],c=0;c<o;){var u="",s=t[c];if(-1!==n.indexOf(s)){var l=c;if(u=s,l<o-1){for(l+=1;l<o;){var f=u+t[l];if(-1===n.indexOf(f)){l-=1;break}u=f,l+=1}l===o&&(l-=1)}u.length>=a&&i.push({text:u,startAt:c,endAt:l}),c=l+1}else{if(-1===r.indexOf(s))return{isMatched:!1};c+=1}}for(var h=[],p=0,d=null,y=null;p<i.length;){y=i[p];var b=(null==d?void 0:d.endAt)||-1,v=y.startAt;v>b+1&&h.push({text:t.slice(b+1,v),startAt:b+1,endAt:v-1}),d=y,p+=1}if(0===p)h.push({text:t,startAt:0,endAt:o-1});else if(y){var w=y.endAt;w+1<o&&h.push({text:t.slice(w+1,o),startAt:w+1,endAt:o-1})}var m=h.every((function(e){return-1!==r.indexOf(e.text)})),g=0;return h.forEach((function(e){g+=e.text.length})),{isMatched:m,data:{text:e.text,keywords:e.keywords,matchedKeywords:i,noKeywordMatchedLength:g}}}}),Object.defineProperty(r.prototype,"_wordMatch",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){var r=e.text.toLowerCase(),n=this.keywordSeparator||",",a=[];e.keywords.toLowerCase().split(n).forEach((function(e){e.split(" ").forEach((function(e){a.push(e)}))}));var o=t.split(" "),i=o.pop();if(!(-1!==r.indexOf(i)||a.some((function(e){return-1!==e.indexOf(i)}))))return{isMatched:!1};var c=o.filter((function(e){return-1!==a.indexOf(e)})).map((function(e){var r=t.indexOf(e);return{text:e,startAt:r,endAt:r+e.length-1}})),u=o.filter((function(e){return-1===a.indexOf(e)})),s=u.every((function(e){return-1!==r.indexOf(e)})),l=0;return u.forEach((function(e){l+=e.length})),{isMatched:s,data:{text:e.text,keywords:e.keywords,matchedKeywords:c,noKeywordMatchedLength:l}}}}),r}(i),u=function(e){function r(){var t=null!==e&&e.apply(this,arguments)||this;return Object.defineProperty(t,"exactRegExpMap",{enumerable:!0,configurable:!0,writable:!0,value:new Map}),Object.defineProperty(t,"partialRegExpMap",{enumerable:!0,configurable:!0,writable:!0,value:new Map}),t}return t(r,e),Object.defineProperty(r.prototype,"loadData",{enumerable:!1,configurable:!0,writable:!0,value:function(t,r){var n=this;e.prototype.loadData.call(this,t,r);var a=new Set;r.forEach((function(e){e.keywords.split(n.keywordSeparator).forEach((function(e){e.length>0&&a.add(e.toLowerCase())}))}));var o=Array.from(a);if(0!==o.length){o.sort((function(e,t){return t.length-e.length})),this.exactRegExpMap.set(t,new RegExp(o.join("|"),"g"));var i=[];o.forEach((function(e){if(e.length>n.minKeywordLength){var t=e.slice(0,n.minKeywordLength),r=[t];(a=e.length-n.minKeywordLength,o=n.minKeywordLength,Array.from(Array(a).keys()).map((function(e){return e+o}))).forEach((function(n){t+=e[n],r.push(t)})),r.reverse(),i.push(r.join("|"))}else e.length>0&&i.push(e);var a,o})),this.partialRegExpMap.set(t,new RegExp(i.join("|"),"g"))}}}),Object.defineProperty(r.prototype,"_match",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){var r=this.data.get(t);if(!r)return[];var n=Array.from(r);if(this.comparator){var a=this.comparator;n.sort((function(r,n){return a(r,n,e,t)}))}return this._keywordMatch(n,e,t)}}),Object.defineProperty(r.prototype,"_keywordMatch",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t,r){var n=[],a=this.exactRegExpMap.get(r);if(e&&a){var o=void 0;if(!(o=t.toLowerCase().match(a))){var i=this.partialRegExpMap.get(r);i&&(o=t.toLowerCase().match(i))}if(o){for(var c=0,u=[],s=0,l=o;s<l.length;s++){var f=l[s],h=t.indexOf(f,c),p=h+f.length-1;u.push({text:f,startAt:h,endAt:p}),c=p}for(var d=function(e){var t=[],r=e.keywords;u.forEach((function(e){-1!==r.indexOf(e.text)&&t.push(e)})),t.length>0&&n.push({text:e.text,keywords:e.keywords,matchedKeywords:t})},y=0,b=e;y<b.length;y++){d(b[y])}}}return n}}),r}(i),s=function(e){function r(t){var r=e.call(this,t)||this;return Object.defineProperty(r,"matchers",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),r.matchers=[],r}return t(r,e),Object.defineProperty(r.prototype,"addMatcherByClass",{enumerable:!1,configurable:!0,writable:!0,value:function(e){var t=new e({keywordSeparator:this.keywordSeparator,minKeywordLength:this.minKeywordLength,strictMatchLocales:this.strictMatchLocales,comparator:this.comparator});this.addMatcher(t)}}),Object.defineProperty(r.prototype,"addMatcher",{enumerable:!1,configurable:!0,writable:!0,value:function(e){"function"==typeof e.loadData&&"function"==typeof e.match&&this.matchers.push(e)}}),Object.defineProperty(r.prototype,"loadData",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){var r=JSON.stringify(t);this.matchers.forEach((function(t){t.loadData(e,JSON.parse(r))}))}}),Object.defineProperty(r.prototype,"_match",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){for(var r=[],n=0,a=this.matchers;n<a.length;n++)for(var i=function(e){var t=r.find((function(t){return t.text===e.text}));if(t){var n=t.matchedKeywords,a=e.matchedKeywords,i=[];n&&n.forEach((function(e){i.some((function(t){return o(e,t)}))||i.push(e)})),a&&a.forEach((function(e){i.some((function(t){return o(e,t)}))||i.push(e)})),i=Array.from(new Set(i)),Object.assign(t,e,{matchedKeywords:i})}else r.push(e)},c=0,u=a[n].match(e,t);c<u.length;c++){i(u[c])}return r}}),r}(i),l=function(e){function n(t){var n=e.call(this,t)||this;return n.addMatcher(new u(r(r({},t),{scorer:null,sort:null}))),n.addMatcher(new c(r(r({},t),{scorer:null,sort:null}))),n}return t(n,e),n}(s),f=c,h=function(){function e(e){void 0===e&&(e={keywordSeparator:",",minKeywordLength:2,strictMatchLocales:["en"]}),Object.defineProperty(this,"matcher",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),e.matcher?this.matcher=e.matcher:this.matcher=new f({keywordSeparator:e.keywordSeparator||",",minKeywordLength:e.minKeywordLength||2,strictMatchLocales:e.strictMatchLocales||["en"],comparator:e.comparator,filter:e.filter,scorer:e.scorer,sort:e.sort})}return Object.defineProperty(e.prototype,"loadData",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){this._validateLocaleData(t),this.matcher.loadData(e,t)}}),Object.defineProperty(e.prototype,"_validateLocaleData",{enumerable:!1,configurable:!0,writable:!0,value:function(e){if(!Array.isArray(e)||!e.every((function(e){return"string"==typeof e.text&&"string"==typeof e.keywords})))throw Error("Locale data should be a list of {text: string, keywords: string}")}}),Object.defineProperty(e.prototype,"generateCompletions",{enumerable:!1,configurable:!0,writable:!0,value:function(e,t){return!e||e.length<=0?[]:this.matcher.match(e,t)}}),Object.defineProperty(e.prototype,"keywordSeparator",{get:function(){return this.matcher.keywordSeparator},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"minKeywordLength",{get:function(){return this.matcher.minKeywordLength},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"strictMatchLocales",{get:function(){return this.matcher.strictMatchLocales},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"data",{get:function(){return this.matcher.data},enumerable:!1,configurable:!0}),e}(),p=function(){function e(e){void 0===e&&(e={apiKey:""}),Object.defineProperty(this,"apiKey",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"apiKeyHeaderName",{enumerable:!0,configurable:!0,writable:!0,value:"X-Secret-Key"}),Object.defineProperty(this,"getEndpoint",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"handleResponse",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.apiKey=e.apiKey,e.apiKeyHeaderName&&(this.apiKeyHeaderName=e.apiKeyHeaderName),"function"==typeof e.getEndpoint?this.getEndpoint=e.getEndpoint:this.getEndpoint=function(e){return"/input_completion/".concat(e,"/")},"function"==typeof e.handleResponse?this.handleResponse=e.handleResponse:this.handleResponse=function(e){if("user_says"in e&&Array.isArray(e.user_says))return e.user_says;throw Error("Data should have [user_says](Array<text,keywords>)")}}return Object.defineProperty(e.prototype,"fetch",{enumerable:!1,configurable:!0,writable:!0,value:function(e){var t=this,r=this.getEndpoint(e);return new Promise((function(e,o){return n(t,void 0,void 0,(function(){var t,n,i;return a(this,(function(a){switch(a.label){case 0:return a.trys.push([0,2,,3]),[4,this._fetch(r)];case 1:t=a.sent();try{n=this.handleResponse(t),e(n)}catch(e){o("Invalid data fetched. ".concat(JSON.stringify(t)))}return"user_says"in t&&Array.isArray(t.user_says),[3,3];case 2:return i=a.sent(),o("Failed to fetch data from ".concat(r,".")),console.error(i),[3,3];case 3:return[2]}}))}))}))}}),Object.defineProperty(e.prototype,"_fetch",{enumerable:!1,configurable:!0,writable:!0,value:function(e){var t=this;return new Promise((function(r,o){return n(t,void 0,void 0,(function(){var t,n,i,c,u;return a(this,(function(a){switch(a.label){case 0:return this.isFetchAvailable()?(t={},this.apiKey&&((n={})[this.apiKeyHeaderName]=this.apiKey,t.headers=n),[4,fetch(e,t)]):[3,5];case 1:return(i=a.sent()).ok&&200==i.status?[4,i.json()]:[3,3];case 2:return c=a.sent(),r(c),[3,4];case 3:o("Failed to fetch data. Status: ".concat(i.status)),a.label=4;case 4:return[3,6];case 5:(u=new XMLHttpRequest).open("GET",e),this.apiKey&&u.setRequestHeader(this.apiKeyHeaderName,this.apiKey),u.onload=function(){if(200===u.status)try{var e=JSON.parse(u.response);r(e)}catch(e){o("Invalid response data format.")}else o("Failed to fetch data. Status: ".concat(u.status))},u.onerror=function(){o("Unknown error occurred while fetching completion data.")},u.send(),a.label=6;case 6:return[2]}}))}))}))}}),Object.defineProperty(e.prototype,"isFetchAvailable",{enumerable:!1,configurable:!0,writable:!0,value:function(){return"function"==typeof window.fetch}}),e}();export{s as ConcatMatcher,f as DefaultMatcher,p as Fetcher,c as ForwardMatcher,h as Generator,l as KeywordForwardMatcher,u as KeywordMatcher,i as Matcher};
