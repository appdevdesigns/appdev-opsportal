!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="/codebase/",n(n.s=5)}([function(t,e,n){"use strict";function r(t){return Array.isArray?Array.isArray(t):"[object Array]"===Object.prototype.toString.call(t)}function o(t){return void 0===t}function i(t,e,n){for(var r in e)t[r]&&!n||(t[r]=e[r]);return t}var a;function u(){return a||(a=(new Date).valueOf()),++a}n.d(e,"b",function(){return r}),n.d(e,"c",function(){return o}),n.d(e,"a",function(){return i}),n.d(e,"d",function(){return u})},function(t,e,n){"use strict";n.d(e,"c",function(){return u}),n.d(e,"b",function(){return s}),n.d(e,"a",function(){return f});var r=n(0),o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};function i(t,e,n){if("object"==(void 0===t?"undefined":o(t))){for(var r=0;r<t.length;r++)if(t[r]=parseFloat(t[r]),isNaN(t[r]))return!0}else if(t=parseFloat(t),isNaN(t))return!0;return!isNaN(e)&&n(t,e)}var a={contains:function(t,e){return e.toLowerCase().indexOf(t.toString().toLowerCase())>=0},equal:function(t,e){return i(t,e,function(t,e){return t==e})},not_equal:function(t,e){return i(t,e,function(t,e){return t!=e})},less:function(t,e){return i(t,e,function(t,e){return e<t})},less_equal:function(t,e){return i(t,e,function(t,e){return e<=t})},more:function(t,e){return i(t,e,function(t,e){return e>t})},more_equal:function(t,e){return i(t,e,function(t,e){return e>=t})},multi:function(t,e){"string"==typeof t&&(t=t.split(","));for(var n=0;n<t.length;n++)if(e==t[n])return!0;return!1},range:function(t,e){return i(t,e,function(t,e){return e<t[1]&&e>=t[0]})},range_inc:function(t,e){return i(t,e,function(t,e){return e<=t[1]&&e>=t[0]})}};function u(t){t=t||[];for(var e=0;e<t.length;e++){var n=t[e],r=n.fvalue;"function"==typeof r?n.func=r:"select"==n.type||"richselect"==n.type?(n.func=function(t,e){return t==e},r=r||""):n.type.indexOf("multi")>-1?n.func=a.multi:"object"===(void 0===r?"undefined":o(r))?n.func=a.range:"="==r.substr(0,1)?(n.func=a.equal,r=r.substr(1)):"<>"==r.substr(0,2)?(n.func=a.not_equal,r=r.substr(2)):">="==r.substr(0,2)?(n.func=a.more_equal,r=r.substr(2)):">"==r.substr(0,1)?(n.func=a.more,r=r.substr(1)):"<="==r.substr(0,2)?(n.func=a.less_equal,r=r.substr(2)):"<"==r.substr(0,1)?(n.func=a.less,r=r.substr(1)):r.indexOf("...")>0?(n.func=a.range,r=r.split("...")):r.indexOf("..")>0?(n.func=a.range_inc,r=r.split("..")):"datepicker"==n.type?n.func=function(t,e){return t==e}:n.func=a.contains,n.fvalue=r}}function s(t){var e,n;for(t=t||[],e=0;e<t.length;e++)"string"==typeof(n=t[e].fvalue||t[e].value||"")&&n.trim&&(n=n.trim()),t[e].fvalue=n}function f(t,e,n){if(t){var o=void 0,i=void 0;for(o=0;o<t.length;o++)if((i=t[o]).fvalue){var a=n&&n[i.name]?n[i.name]:i.name;if(r.c(e[a]))return!1;var u=e[a];if(0!==!u&&!u)return!1;var s=u.toString();if(!i.func(i.fvalue,s))return!1}}return!0}},function(t,e,n){"use strict";var r=n(0);function o(t,e){return"$webixtotal"+t.$divider+e}function i(t,e){var n,r,o=[];for(n=0;n<e.length;n++)r=t[e[n]],isNaN(parseFloat(r))||o.push(r);return o}var a={dir:1,as:function(t,e){return f(t)&&f(e)?u.int(t,e):u.string(t,e)}},u={date:function(t,e){return(t-=0)>(e-=0)?1:t<e?-1:0},int:function(t,e){return(t*=1)>(e*=1)?1:t<e?-1:0},string:function(t,e){return e?t?(t=t.toString().toLowerCase())>(e=e.toString().toLowerCase())?1:t<e?-1:0:-1:1}};function s(t,e){var n,i,u,s,f=t.config.structure.values;for(e=function t(e,n){var r,o,i,a,u,s=[];for(o=0;o<n.length;o++)if((i=n[o]).data.length){var f=t(e,i.data);for(r=!1,a=0;a<f.length;a++)(u=f[a]).splice(0,0,{name:i.key}),r||(u[0].colspan=f.length,r=!0),s.push(u)}else{var l=n[o].key.split(e.$divider);s.push([{name:n[o].key,operation:l[0],text:l[1]}])}return s}(t,e=function t(e,n,o){var i,u,s,f,l,c=[];if(Object.keys&&!1!==e.columnSort)for(o=o||0,i=e.columns[o],l=function(t,e){var n=a;t&&(t[e]?n=t[e]:t.$default&&(n=t.$default),n.dir&&(n._dir="desc"==n.dir?-1:1),r.a(n,a));return n}(e.columnSort,i),f=Object.keys(n),o<e.columns.length&&(f=f.sort(function(t,e){return l.as(t,e)*l._dir})),o++,u=0;u<f.length;u++)s=f[u],c.push({key:s,data:t(e,n[s],o)});else for(s in n)c.push({key:s,data:t(e,n[s])});return c}(t.config.structure,e)),n=0;n<e.length;n++){var l=[];for(i=0;i<e[n].length;i++)l.push(e[n][i].name);s=null;var c=l[l.length-1].split(t.$divider);for(i=0;i<f.length&&!s;i++)if(f[i].operation)for(u=0;u<f[i].operation.length;u++)f[i].name==c[1]&&f[i].operation[u]==c[0]&&(s=f[i]);e[n]={id:l.join(t.$divider),header:e[n]},e[n].format=s&&s.format?s.format:"count"!=c[0]?t.config.format:null}return e.length&&t.view&&t.view.callEvent&&t.view.callEvent("onHeaderInit",[e]),t.config.totalColumn&&e.length&&(e=function(t,e){var n,r,i,a,u,s,f,l=[];if((s=e[0].header.length)<2)return e;for(i in r=function(t,e){var n,r,o,i,a,u={},s=0;for(r=0;r<e.length;r++)a=e[r].id.split(t.$divider),o=a.pop(),"sum"!=(i=a.pop())&&"sumOnly"==t.config.totalColumn||(n=i+t.$divider+o,u[n]||(s++,u[n]={operation:i,ids:[],format:e.format}),u[n].ids.push(e[r].id));return{groups:u,count:s}}(t,e),n=r.groups,t._pivotColumnGroups=n,n){for(a={id:o(t,i),header:[],sort:"int",width:t.config.columnWidth,format:t.config.format},u=0;u<s-1;u++)u||l.length?a.header.push(""):a.header.push({name:"total",rowspan:s-1,colspan:r.count});f=i.split(t.$divider),a.header.push({name:i,operation:f[0],text:f[1]}),l.push(a)}return e.concat(l)}(t,e)),e.splice(0,0,{id:"name",template:"{common.treetable()} #name#",header:{text:void 0}}),e}function f(t){return!isNaN(1*t)}var l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};function c(t,e,n,r){var o,i,a=[],u=[];for(t=function t(e,n,r){r||(r=[]);for(var o=0;o<e.length;o++)n&&e[o].data?t(e[o].data,n,r):r.push(e[o]);return r}(t,r),o=0;o<t.length;o++)i=t[o][e],isNaN(parseFloat(i))||(u.push(1*i),a.push(t[o]));return n(u,e,a)}var p="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};function h(t,e,n){var r;for(r=0;r<t.length;r++)t[r].data?h(t[r].data,e,n):n.push(t[r][e])}var d=n(1),v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},g=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}();var y=function(){function t(e,n){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.master=e,this.config=n,this.count=0}return t.prototype.process=function(t,e){var n,a,u,f,p;this.watch=new Date;var h=this.structure;for(h._header=[],h._header_hash={},d.b(h.filters),d.c(h.filters),f=0;f<h.values.length;f++)h.values[f].operation=h.values[f].operation||["sum"],r.b(h.values[f].operation)||(h.values[f].operation=[h.values[f].operation]);for(n=[],f=0;f<h.columns.length;f++)n[f]="object"==v(h.columns[f])?h.columns[f].id||f:h.columns[f];return a=h.rows.concat(n),p=this.group(t,e,a),u={},h.rows.length>0?p=this.processRows(p,h.rows,h,u,""):(this.processColumns(p,n,h,u),p=[]),u=s(this.master,u),p=function t(e,n){var r=e._pivotColumnGroups;if(r){var a=void 0,u=void 0,s=void 0;for(s in r)for(u=r[s].ids,a=0;a<n.length;a++){var f=void 0,l=o(e,s),c="",p=i(n[a],u);p.length&&(f=e._pivotOperations.getTotal(s.split(e.$divider)[0]))&&(c=f.call(e,p,l,n[a])),n[a][l]=c,n[a].data&&(n[a].data=t(e,n[a].data))}}return n}(this.master,p),this.config.footer&&function(t,e,n){var o,i,a,u;for(i=1;i<e.length;i++){o=null,u=(a=e[i].id.split(t.$divider))[a.length-2],"sumOnly"==t.config.footer&&"sum"!=u&&(o=" ");var s=t._pivotOperations.getTotal(u);if(!o&&s){var f=t._pivotOperations.getTotalOptions(u);o={$pivotValue:c(n,e[i].id,s,f&&f.leavesOnly),$pivotOperation:u}}else o=" ";e[i].footer=o,"object"==l(t.config.footer)&&r.a(e[i].footer,t.config.footer,!0)}}(this.master,u,p),delete h._header,delete h._header_hash,{header:u,data:p}},t.prototype.processColumns=function(t,e,n,o,i,a){var u;if(i=i||{$source:[]},e.length>0)for(var s in a=a||"",t)o[s]||(o[s]={}),t[s]=this.processColumns(t[s],e.slice(1),n,o[s],i,(a.length>0?a+this.divider:"")+s);else{var f=n.values;for(var l in t){i.$source.push(l);for(var c=0;c<f.length;c++)for(var p=0;p<f[c].operation.length;p++)u=void 0!==a?a+this.divider+f[c].operation[p]+this.divider+f[c].name:f[c].operation[p]+this.divider+f[c].name,n._header_hash[u]||(n._header.push(u),n._header_hash[u]=!0),r.c(i[u])&&(i[u]=[],o[f[c].operation[p]+this.divider+f[c].name]={}),i[u].push({value:t[l][f[c].name],id:l})}}return i},t.prototype.processRows=function(t,e,n,o,i){var a,u,s,f,l,c=[];if(e.length>1){for(a in t)t[a]=this.processRows(t[a],e.slice(1),n,o,i+"_"+a);var p=n._header;for(a in t){for(u={data:t[a]},s=0;s<u.data.length;s++)for(f=0;f<p.length;f++)l=p[f],r.c(u[l])&&(u[l]=[]),u[l].push(u.data[s][l]);this.setItemValues(u),this.master.config.stableRowId&&(u.id=i+"_"+a),u.name=a,u.open=!0,c.push(u)}}else for(a in t)(u=this.processColumns(t[a],n.columns,n,o)).name=a,this.master.config.stableRowId&&(u.id=i+"_"+a),this.setItemValues(u),c.push(u);return c},t.prototype.setItemValues=function(t){return t=function(t,e){var n,r,o,i,a,u,s,f,l=e.header,c=e.max,p=e.min,h=e.values;if(!p&&!c)return t;for(t.$cellCss||(t.$cellCss={}),n=0;n<h.length;n++){for(f=h[n],i=[],a=-99999999,u=[],s=99999999,r=0;r<l.length;r++)o=l[r],isNaN(t[o])||-1!==o.indexOf(f.name)&&(c&&t[o]>a?(i=[o],a=t[o]):t[o]==a&&i.push(o),p&&t[o]<s?(u=[o],s=t[o]):t[o]==s&&u.push(o));for(r=0;r<u.length;r++)t.$cellCss[u[r]]="webix_min";for(r=0;r<i.length;r++)t.$cellCss[i[r]]="webix_max"}return t}(t=function(t,e,n){var r,o,i,a,u,s,f,l=e.header;for(r=0;r<l.length;r++){if(u=(s=(i=l[r]).split(e.divider))[s.length-2],f=t[i],a=e.operations.getOption(u,"leavesOnly"),o=e.operations.getOption(u,"ids"),a&&t.data&&(f=[],h(t.data,i,f)),f){for(var c=[],d=[],v=0;v<f.length;v++){var g=f[v],y=null;"object"==(void 0===g?"undefined":p(g))&&(g=g.value,y=f[v].id),(g||"0"==g)&&(c.push(g),y&&d.push(y))}c.length?t[i]=e.operations.get(u)(c,i,t,o?d:null):t[i]=""}else t[i]="";n.count++}return t}(t,{header:this.structure._header,divider:this.divider,operations:this.operations},this),{header:this.structure._header,max:this.config.max,min:this.config.min,values:this.structure.values}),this.count>5e4&&(this.count=0,this.config.ping&&this.config.ping.call(this,this.watch)),t},t.prototype.group=function(t,e,n){var r,o,i={};for(r=0;r<e.length;r++)(o=t[e[r]])&&d.a(this.structure.filters,o,this.config.filterMap)&&this.groupItem(i,o,n);return i},t.prototype.groupItem=function(t,e,n){if(n.length){var o=e[n[0]];if(void 0===o)return null;r.c(t[o])&&(t[o]={}),this.groupItem(t[o],e,n.slice(1))}else t[e.id]=e},t.prototype.filterItem=function(t){for(var e=this.structure.filters||[],n=0;n<e.length;n++){var o=e[n];if(o.fvalue){if(r.c(t[o.name]))return!1;var i=t[o.name].toString().toLowerCase();if(!o.func(o.fvalue,i))return!1}}return!0},g(t,[{key:"operations",get:function(){return this.master._pivotOperations}},{key:"divider",get:function(){return this.master.$divider}},{key:"structure",get:function(){return this.config.structure}}]),t}(),m=n(3);n.d(e,"b",function(){return w}),n.d(e,"a",function(){return S});var _="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};function b(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var O="_'_",w=function(){function t(e,n){b(this,t),this.$divider=O,this._initOperations(),this.config=e,this.view=n,e.webWorker&&"undefined"!==!("undefined"==typeof Worker||_(Worker))&&n?this._initWorker(e,n):this._pivotData=new y(this,this.config),this.config.structure||(this.config.structure={}),r.a(this.config.structure,{rows:[],columns:[],values:[],filters:[]})}return t.prototype._initWorker=function(t,e){this._result=null,this._pivotWorker=new Worker(t.webWorker),this._pivotWorker.onmessage=function(t){"ping"===t.data.type?e._runPing(t.data.watch,e):e._result&&!e.$destructed&&(e.callEvent("onWebWorkerEnd",[]),t.data.id&&t.data.id!==e._result_id||(e._result(t.data.data),e._result=null))}},t.prototype._runPing=function(t,e){try{this.config.ping(t)}catch(t){this._pivotWorker.terminate(),this._initWorker(this.config,e),e.callEvent("onWebWorkerEnd",[])}},t.prototype._getPivotData=function(t,e,n){if(!this._pivotWorker){var r=this._pivotData.process(t,e);return n&&n(r),r}var o=this._result_id=webix.uid();this._result=n;var i=[],a=this.config.structure,u=this.config.footer,s=this._pivotOperations.serialize();if(a&&(a.rows.length||a.columns.length))for(var f=e.length-1;f>=0;f--)i[f]=t[e[f]];this.callEvent("onWebWorkerStart",[]);var l=this.config.format;if("function"==typeof l){var c="x"+webix.uid();webix.i18n[c]=l,l=c}var p=!!this.config.ping;this._pivotWorker.postMessage({footer:u,structure:a,data:i,id:o,operations:s,ping:p,format:l})},t.prototype._initOperations=function(){var t=this._pivotOperations=new m.a;this.operations=t.pull},t.prototype.addOperation=function(t,e,n){this._pivotOperations.add(t,e,n)},t.prototype.addTotalOperation=function(t,e,n){this._pivotOperations.addTotal(t,e,n)},t}(),S=function(t){function e(){return b(this,e),function(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}(this,t.apply(this,arguments))}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}(e,t),e.prototype.getData=function(t){var e,n,o,i,a=[],u={},s=this.config.structure.filters,f={},l={},c={},p=this.operations,h=[],d={};for(e=0;e<s.length;e++)-1!=s[e].type.indexOf("select")&&(l[s[e].name]=[],c[s[e].name]={});for(e=0;e<t.length;e++){if(f[n=t[e].id=t[e].id||r.d()]=t[e],h.push(n),e<5)for(i in t[e])u[i]||(a.push(i),u[i]=r.d());for(o in l){var v=t[e][o];r.c(v)||c[o][v]||(c[o][v]=1,l[o].push(v))}}for(n in d.options=l,d.fields=a,d.data=this._getPivotData(f,h),d.operations=[],p)d.operations.push(n);return d},e}(w)},function(module,__webpack_exports__,__webpack_require__){"use strict";__webpack_require__.d(__webpack_exports__,"a",function(){return Operations});var _helpers_js__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(0);function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var operations={sum:function(t){for(var e=0,n=0;n<t.length;n++){var r=t[n];r=parseFloat(r,10),isNaN(r)||(e+=r)}return e},count:function(t,e,n){var r=0;if(n.data)for(var o=0;o<n.data.length;o++)r+=n.data[o][e]||0;else r=t.length;return r},max:function(t){return 1==t.length?t[0]:Math.max.apply(this,t)},min:function(t){return 1==t.length?t[0]:Math.min.apply(this,t)}},totalOperations={sum:function(t){var e,n=0;for(e=0;e<t.length;e++)n+=t[e];return n},min:function(t){return 1==t.length?t[0]:Math.min.apply(null,t)},max:function(t){return 1==t.length?t[0]:Math.max.apply(null,t)},count:function(t){var e=totalOperations.sum.call(this,t);return e?parseInt(e,10):""}},Operations=function(){function Operations(){_classCallCheck(this,Operations),this.pull=_helpers_js__WEBPACK_IMPORTED_MODULE_0__.a({},operations),this.options={},this.pullTotal=_helpers_js__WEBPACK_IMPORTED_MODULE_0__.a({},totalOperations),this.totalOptions={}}return Operations.prototype.serialize=function(){var t={};for(var e in this.pull)t[e]=this.pull[e].toString();return t},Operations.prototype.parse=function parse(str){for(var key in str)eval("this.temp = "+str[key]),this.pull[key]=this.temp},Operations.prototype.add=function(t,e,n){this.pull[t]=e,n&&(this.options[t]=n)},Operations.prototype.addTotal=function(t,e,n){this.pullTotal[t]=e,n&&(this.totalOptions[t]=n)},Operations.prototype.get=function(t){return this.pull[t]||null},Operations.prototype.getOptions=function(t){return this.options[t]||null},Operations.prototype.getOption=function(t,e){return this.options[t]?this.options[t][e]:null},Operations.prototype.getTotal=function(t){return this.pullTotal[t]||this.pull[t]||null},Operations.prototype.getTotalOptions=function(t){return this.pullTotal[t]?this.totalOptions[t]||null:this.options[t]||null},Operations.prototype.getTotalOption=function(t,e){var n=this.getTotalOptions(t);return n?n[t][e]:null},Operations}()},,function(t,e,n){"use strict";n.r(e);var r,o=n(2);onmessage=function(t){if(r||(r=new o.a(t.data.structure)),"error"===t.type)throw t;r.config.format=t.data.format,r.config.footer=t.data.footer,r.config.structure=t.data.structure,t.data.ping&&(r.config.ping=function(t){postMessage({type:"ping",watch:t})}),r._pivotOperations.parse(t.data.operations);var e=r.getData(t.data.data);postMessage({type:"data",data:e.data,id:t.data.id})}}]);