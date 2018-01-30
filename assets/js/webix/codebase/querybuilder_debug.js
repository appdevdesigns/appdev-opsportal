/*
@license
Webix Query Builder v.5.1.3
This software is covered by Webix Commercial License.
Usage without proper license is prohibited.
(c) XB Software Ltd.
*/
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/codebase/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.locale = {
    or: "or",
    and: "and",
    delete_rule: "Delete rule",
    add_rule: "Add rule",
    add_group: "Add group",
    less: "less",
    less_or_equal: "less or equal",
    greater: "greater",
    greater_or_equal: "greater or equal",
    between: "between",
    not_between: "not between",
    begins_with: "begins with",
    not_begins_with: "not begins with",
    contains: "contains",
    not_contains: "not contains",
    ends_with: "ends with",
    not_ends_with: "not ends with",
    is_empty: "is empty",
    is_not_empty: "is not empty",
    equal: "equal",
    not_equal: "not equal",
    is_null: "is null",
    is_not_null: "is not null",
    default_option: "---",
    cancel: "Cancel",
    filter: "Filter",
    sort: "Sort"
};


/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(1);
var locales_1 = __webpack_require__(0);
__webpack_require__(3);
var qbsorting_1 = __webpack_require__(4);
var qbsql_1 = __webpack_require__(5);
__webpack_require__(6);
webix.i18n.querybuilder = locales_1.locale;
var querybuilder = {
    name: "querybuilder",
    defaults: {
        type: "space",
        fields: [],
        sorting: false,
        filtering: true,
        columnMode: false,
        maxLevel: 999,
        inputMaxWidth: 210,
        inputWidth: false,
        borderless: true
    },
    $init: function () {
        this.$view.className += " webix_querybuilder_wrap";
        var confValue = {
            glue: "and",
            rules: []
        };
        this.config.value = confValue;
        this.config.glue = "and";
        this.$ready.unshift(this._setLayout);
    },
    _filters: [
        { id: "less", name: locales_1.locale.less, fn: function (a, b) { return a < b; }, type: "number" },
        { id: "less_or_equal", name: locales_1.locale.less_or_equal, fn: function (a, b) { return a <= b; }, type: "number" },
        { id: "greater", name: locales_1.locale.greater, fn: function (a, b) { return a > b; }, type: "number" },
        { id: "greater_or_equal", name: locales_1.locale.greater_or_equal, fn: function (a, b) { return a >= b; }, type: "number" },
        { id: "between", name: locales_1.locale.between, fn: function (a, b, c) { return (!b || a > b) && (!c || a < c); }, type: "number" },
        { id: "not_between", name: locales_1.locale.not_between, fn: function (a, b, c) { return (!b || a <= b) || (!c || a >= c); }, type: "number" },
        { id: "begins_with", name: locales_1.locale.begins_with, fn: function (a, b) { return a.lastIndexOf(b, 0) === 0; }, type: "string" },
        { id: "not_begins_with", name: locales_1.locale.not_begins_with, fn: function (a, b) { return a.lastIndexOf(b, 0) !== 0; }, type: "string" },
        { id: "contains", name: locales_1.locale.contains, fn: function (a, b) { return a.indexOf(b) !== -1; }, type: "string" },
        { id: "not_contains", name: locales_1.locale.not_contains, fn: function (a, b) { return b.indexOf(a) === -1; }, type: "string" },
        { id: "ends_with", name: locales_1.locale.ends_with, fn: function (a, b) { return a.indexOf(b, a.length - b.length) !== -1; }, type: "string" },
        { id: "not_ends_with", name: locales_1.locale.not_ends_with, fn: function (a, b) { return a.indexOf(b, a.length - b.length) === -1; }, type: "string" },
        { id: "is_empty", name: locales_1.locale.is_empty, fn: function (a) { return a.length === 0; }, type: "string" },
        { id: "is_not_empty", name: locales_1.locale.is_not_empty, fn: function (a) { return a.length > 0; }, type: "string" },
        { id: "equal", name: locales_1.locale.equal, fn: function (a, b) { return a === b; }, type: "any" },
        { id: "not_equal", name: locales_1.locale.not_equal, fn: function (a, b) { return a !== b; }, type: "any" },
        { id: "is_null", name: locales_1.locale.is_null, fn: function (a) { return a === null; }, type: "any" },
        { id: "is_not_null", name: locales_1.locale.is_not_null, fn: function (a) { return a !== null; }, type: "any" }
    ],
    _deleteRow: function (el) {
        var layout = this.queryView({ css: "webix_qb_section" });
        layout.removeView(el);
        this._callChangeMethod();
        if (layout.getChildViews().length <= 1) {
            var parentEl = this._masterQuery;
            if (parentEl) {
                parentEl._deleteRow(this.config.id);
            }
        }
    },
    _addRow: function (ui) {
        var layout = this.queryView({ css: "webix_qb_section" });
        return layout.addView(ui, layout.getChildViews().length - 1);
    },
    _addRule: function () {
        var line = this._addRow({
            view: "querybuilderline",
            inputWidth: this.config.inputWidth, inputMaxWidth: this.config.inputMaxWidth,
            fields: this.config.fields,
            filters: this._filters,
            columnMode: this.config.columnMode
        });
        webix.$$(line)._masterQuery = this;
        return line;
    },
    _addGroup: function (withRow) {
        var newView = this._addRow({
            view: "querybuilder",
            inputWidth: this.config.inputWidth,
            inputMaxWidth: this.config.inputMaxWidth,
            maxLevel: this.config.maxLevel - 1,
            fields: this.config.fields,
            columnMode: this.config.columnMode
        });
        webix.$$(newView)._masterQuery = this;
        if (withRow) {
            webix.$$(newView)._addRule();
        }
        return newView;
    },
    _getTopQuery: function () {
        var parent = this.getParentView();
        if (this._masterQuery && this._masterQuery._getTopQuery) {
            parent = parent.getParentView();
            return parent._getTopQuery ? parent._getTopQuery() : parent;
        }
        else {
            return this;
        }
    },
    _callChangeMethod: function () {
        this._getTopQuery().callEvent("onChange", []);
    },
    _setLayout: function () {
        var _this = this;
        var levelIndicator = this.config.maxLevel > 1 ? true : false;
        var cols = [
            {
                template: "<div class=\"webix_querybuilder_ifbuttons\">\n\t\t\t\t<button class=\"webix_querybuilder_and webix_active\">" + locales_1.locale.and + "</button>\n\t\t\t\t<button class=\"webix_querybuilder_or\">" + locales_1.locale.or + "</button>\n\t\t\t</div>",
                onClick: {
                    webix_querybuilder_or: function (e) {
                        _this.config.glue = "or";
                        _this._setActiveButtons(_this.$view);
                    },
                    webix_querybuilder_and: function (e) {
                        _this.config.glue = "and";
                        _this._setActiveButtons(_this.$view, "and");
                    }
                },
                height: 34,
                width: 87
            },
            {
                css: "webix_qb_section",
                rows: [
                    {
                        template: "<div class=\"webix_querybuilder_buttons\">\n\t\t\t\t\t" + (levelIndicator ? "<button class=\"webixbutton webix_querybuilder_group\">+ " + locales_1.locale.add_group + "</button>" : "") + "\n\t\t\t\t\t<button class=\"webixbutton webix_querybuilder_rule\">+ " + locales_1.locale.add_rule + "</button>\n\t\t\t\t</div>",
                        onClick: {
                            webix_querybuilder_rule: function (e) { return _this._addRule(); },
                            webix_querybuilder_group: function (e) { return _this._addGroup(true); }
                        },
                        height: 14,
                        minWidth: 220
                    }
                ],
                margin: 5
            }
        ];
        if (this.config.sorting) {
            this.$view.innerHTML = "<div class='webix_querybuilder_sorting'></div>";
            webix.ui(this._sortMultiselect = {
                view: "multiselect",
                label: "Sort by",
                container: this.$view.childNodes[0],
                suggest: {
                    body: {
                        data: this.config.fields
                    }
                },
                align: "right",
                width: 300,
                inputHeight: 38,
                labelWidth: 57,
                on: {
                    onChange: function () {
                        _this._callChangeMethod();
                    }
                }
            });
            webix.ui(this._sortSelect = {
                view: "select",
                container: this.$view.childNodes[0],
                options: ["asc", "desc"],
                width: 60,
                inputHeight: 38,
                height: 38,
                on: {
                    onChange: function () {
                        if (_this._getSortingValues().sortBy) {
                            _this._callChangeMethod();
                        }
                    }
                }
            });
            webix.extend(this, qbsorting_1.qbsorting);
        }
        if (this.config.filtering === false) {
            this.config.padding = 0;
            this.cols_setter([{ height: 1 }]);
        }
        else {
            this.cols_setter(cols);
        }
    },
    $getSize: function (dx, dy) {
        if (this.config.sorting) {
            dy = dy + 50;
        }
        return webix.ui.layout.prototype.$getSize.call(this, dx, dy);
    },
    _checkItemRules: function (item) {
        var _this = this;
        var layout = this.queryView({ css: "webix_qb_section" });
        if (item.glue && item.glue === "and") {
            this._setActiveButtons(this.$view, "and");
        }
        else if (item.glue && item.glue === "or") {
            this._setActiveButtons(this.$view);
        }
        if (item.rules) {
            item.rules.forEach(function (el) {
                var rule;
                if (!el.glue) {
                    rule = _this._addRule();
                }
                else {
                    rule = _this._addGroup();
                }
                webix.$$(rule).setValue(el);
            });
        }
    },
    _setActiveButtons: function (container, and, item) {
        var btnAnd = container.querySelector(".webix_querybuilder_and");
        var btnOr = container.querySelector(".webix_querybuilder_or");
        if (btnAnd) {
            btnAnd.classList.remove("webix_active");
            if (and) {
                btnOr.classList.remove("webix_active");
                btnAnd.className += " webix_active";
            }
            else {
                btnAnd.classList.remove("webix_active");
                btnOr.className += " webix_active";
            }
        }
        this._callChangeMethod();
    },
    _eachLine: function (cb) {
        var layout = this.queryView({ css: "webix_qb_section" });
        var cells = layout.getChildViews();
        for (var i = 0; i < cells.length; i++) {
            if (cells[i].setFilters) {
                cb(cells[i]);
            }
        }
    },
    setFilters: function (filters) {
        this._filters = filters;
        this._eachLine(function (cell) { return cell.setFilters(filters); });
    },
    validate: function () {
        this._eachLine(function (cell) { return cell.validate(); });
    },
    getFilters: function () {
        return this._filters;
    },
    _getValue: function () {
        var rules = [];
        this._eachLine(function (a) {
            if (a._getValue(rules)) {
                rules.push(a._getValue(rules));
            }
        });
        if (rules.length) {
            return { glue: this.config.glue, rules: rules };
        }
        else {
            return null;
        }
    },
    getValue: function () {
        return [this._getValue(), this.config.fields];
    },
    setValue: function (value) {
        var firstValue = value[0];
        var newValue;
        // check array elements: rules+fields/rules/fields
        if (value[1]) {
            newValue = firstValue;
            this.config.fields = value[1];
            this.reconstruct();
        }
        else if (!value[0]) {
            newValue = value;
        }
        else if (!Array.isArray(firstValue)) {
            newValue = firstValue;
        }
        else {
            this.config.fields = firstValue;
            this.reconstruct();
        }
        if (newValue) {
            this.config.glue = newValue.glue;
            this._checkItemRules(newValue);
        }
        if (this.config.sorting) {
            var fields = [].concat(this.config.fields).map(function (a) { return a.value; });
            var list = this.getSortingElements()[0].getPopup().getList();
            list.clearAll();
            list.parse(fields);
        }
    },
    focus: function () {
        var selectEl = this.$view.querySelector(".webix_active");
        if (selectEl) {
            selectEl.focus();
        }
    },
    getFilterHelper: function () {
        var result;
        var childsArr = [];
        var glue = this.config.glue;
        this._eachLine(function (a) { return childsArr.push(a.getFilterHelper()); });
        var filterFunction = function (obj) {
            if (!childsArr.length) {
                return true;
            }
            if (glue === "and") {
                result = true;
                childsArr.forEach(function (item) {
                    if (!item(obj)) {
                        result = false;
                    }
                });
            }
            else {
                result = false;
                childsArr.forEach(function (item) {
                    if (item(obj)) {
                        result = true;
                    }
                });
            }
            return result;
        };
        return filterFunction;
    }
};
webix.protoUI(querybuilder, qbsql_1.qbsql, webix.ui.layout, webix.EventSystem);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(1);
var locales_1 = __webpack_require__(0);
webix.ui.datafilter.queryBuilder = webix.extend({
    getValue: function () {
        var value = [];
        value.push.apply(value, this._qb.getValue());
        if (this._qb._getSortingValues) {
            value.push(this._qb._getSortingValues());
        }
        return value;
    },
    setValue: function (node, value) {
        if (value) {
            this._qb.setValue(value);
            if (this._qb.config.sorting) {
                this._qb._setSortingValues(value[2]);
                this._master.sort(this._qb.getSortingHelper());
            }
        }
    },
    refresh: function (master, node, value) {
        var _this = this;
        node.component = master.config.id;
        master.registerFilter(node, value, this);
        node._comp_id = master.config.id;
        if (value.value && (JSON.stringify(this.getValue(value)[0]) !== JSON.stringify(value.value[0]))) {
            this.setValue(node, value.value);
            if (!this._qb.config.sorting) {
                this._master.filterByAll();
            }
        }
        webix.event(node, "click", function () { return _this._filterShow(node); });
    },
    compare: function (el, rules, obj) {
        return this._qb.getFilterHelper()(obj);
    },
    render: function (master, config) {
        var _this = this;
        config.css = "webix_ss_filter";
        config.compare = function (el, rules, obj) { return _this.compare(el, rules, obj); };
        var buttonSort = {};
        var qb = {
            view: "querybuilder", fields: config.fields || [], sorting: config.sorting || false, filtering: config.filtering === false ? false : true,
            columnMode: config.columnMode || false, maxLevel: config.maxLevel || 999, inputMaxWidth: config.inputMaxWidth || 210, inputWidth: config.inputWidth || false,
            borderless: config.borderless === false ? false : true
        };
        var buttonSave = this._buttonCreate(locales_1.locale.filter, function () {
            if (_this._qb) {
                var helper = _this._qb.getFilterHelper();
                master.filter(helper, undefined, undefined);
                _this._popup.hide();
            }
        });
        if (config.sorting) {
            buttonSort = this._buttonCreate(locales_1.locale.sort, function () {
                if (_this._qb) {
                    master.sort(_this._qb.getSortingHelper());
                    _this._popup.hide();
                }
            });
        }
        var buttonCancel = this._buttonCreate(locales_1.locale.cancel, function () {
            _this._popup.hide();
        });
        var body = { margin: 5, rows: [qb, { cols: [buttonSave, buttonCancel, {}, buttonSort] }] };
        var popup = {
            view: "popup",
            width: 1280,
            body: body
        };
        if (config.popupConfig) {
            webix.extend(popup, config.popupConfig, true);
        }
        this._popup = webix.ui(popup);
        this._qb = this._popup.getBody().getChildViews()[0];
        master.attachEvent("onDestruct", function () {
            _this._popup.destructor();
        });
        this._master = master;
        return '<div class="webix_qb_filter"><i class="fa fa-filter" aria-hidden="true"></i></div>' + (config.label || "");
    },
    _filterShow: function (node) {
        this._popup.show(node.querySelector(".webix_qb_filter .fa"));
    },
    _buttonCreate: function (label, click) {
        return {
            view: "button",
            value: label,
            align: "right",
            width: 120,
            click: click
        };
    }
}, webix.EventSystem);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.qbsorting = {
    _getSortingValues: function () {
        var multiValue = this.getSortingElements()[0].getValue();
        var selectValue = this.getSortingElements()[1].getValue();
        return { sortBy: multiValue, sortAs: selectValue };
    },
    _setSortingValues: function (sortingValues) {
        this.getSortingElements()[0].setValue(sortingValues.sortBy);
        this.getSortingElements()[1].setValue(sortingValues.sortAs);
    },
    getSortingElements: function () {
        var multiSortEl = webix.$$(this._sortMultiselect.id);
        var selectSortEl = webix.$$(this._sortSelect.id);
        return [multiSortEl, selectSortEl];
    },
    getSortingHelper: function () {
        var _this = this;
        var multiValue = this._getSortingValues().sortBy.split(",");
        var sortByItem = [];
        for (var i = 0; i < multiValue.length; i++) {
            for (var j = 0; j < this.config.fields.length; j++) {
                if (this.config.fields[j].id === multiValue[i]) {
                    sortByItem.push(this.config.fields[j]);
                }
            }
        }
        this._i = 0;
        var sortingFunction = function (obj1, obj2) {
            if (_this._i === 0 && sortByItem.length) {
                return _this._getValueSort(obj1, obj2, sortByItem);
            }
            else if (_this._sortingValue && !sortByItem.length) {
                return _this._getValueSort(obj1, obj2);
            }
        };
        return sortingFunction;
    },
    _getValueSort: function (obj1, obj2, sortByItem) {
        var selectValue = this._getSortingValues().sortAs;
        var value;
        if (selectValue === "asc" || !selectValue) {
            value = this._getsorted(obj1, obj2, sortByItem);
        }
        else {
            value = this._getsorted(obj1, obj2, sortByItem) * -1;
        }
        return value;
    },
    _getsorted: function (obj1, obj2, sortByItem) {
        var value;
        var item;
        if (sortByItem) {
            item = sortByItem[this._i];
            this._sortingValue = { id: item.id, type: item.type };
        }
        else {
            item = this._sortingValue;
        }
        var a = obj1[item.id];
        var b = obj2[item.id];
        if (item.type === "number") {
            value = a > b ? 1 : (a < b ? -1 : 0);
        }
        else if (item.type === "date") {
            a = a - 0;
            b = b - 0;
            value = a > b ? 1 : (a < b ? -1 : 0);
        }
        else {
            if (!b) {
                return 1;
            }
            if (!a) {
                return -1;
            }
            a = a.toString().toLowerCase();
            b = b.toString().toLowerCase();
            value = a > b ? 1 : (a < b ? -1 : 0);
        }
        if (sortByItem && sortByItem[this._i + 1] && a === b) {
            this._i += 1;
            value = this._getValueSort(obj1, obj2, sortByItem);
        }
        else {
            this._i = 0;
        }
        return value;
    }
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.qbsql = {
    $init: function () {
        this.config.sqlDateFormat = this.config.sqlDateFormat || webix.Date.dateToStr("%Y-%m-%d %H:%i:%s", false);
    },
    sqlOperators: {
        equal: { op: '= ?' },
        not_equal: { op: '!= ?' },
        less: { op: '< ?' },
        less_or_equal: { op: '<= ?' },
        greater: { op: '> ?' },
        greater_or_equal: { op: '>= ?' },
        between: { op: 'BETWEEN ?', sep: ' AND ' },
        not_between: { op: 'NOT BETWEEN ?', sep: ' AND ' },
        begins_with: { op: 'LIKE(?)', mod: '{0}%' },
        not_begins_with: { op: 'NOT LIKE(?)', mod: '{0}%' },
        contains: { op: 'LIKE(?)', mod: '%{0}%' },
        not_contains: { op: 'NOT LIKE(?)', mod: '%{0}%' },
        ends_with: { op: 'LIKE(?)', mod: '%{0}' },
        not_ends_with: { op: 'NOT LIKE(?)', mod: '%{0}' },
        is_empty: { op: '= \"\"', no_val: true },
        is_not_empty: { op: '!= \"\"', no_val: true },
        is_null: { op: 'IS NULL', no_val: true },
        is_not_null: { op: 'IS NOT NULL', no_val: true }
    },
    toSQL: function (config, value) {
        value = value || this.getValue()[0];
        config = config || { placeholders: false };
        var values = [];
        var code = this._getSqlString(value, values, config);
        return { code: code, values: values };
    },
    _getSqlString: function (rulesObj, values, config, glueRule) {
        var _this = this;
        if (!rulesObj) {
            return "";
        }
        if (rulesObj.glue) {
            var code_1 = "";
            rulesObj.rules.forEach(function (item, index, array) {
                code_1 += (index < array.length - 1) ? _this._getSqlString(item, values, config, rulesObj.glue.toUpperCase()) : _this._getSqlString(item, values, config, 'last');
            });
            return glueRule ? this._putBrackets(code_1, glueRule) : code_1;
        }
        else {
            this._convertValueToSql(rulesObj, values);
            return glueRule !== 'last' ? rulesObj.key + " " + this._convertRuleToSql(rulesObj, config) + " " + glueRule + " " : rulesObj.key + " " + this._convertRuleToSql(rulesObj, config);
        }
    },
    _putBrackets: function (ruleString, glue) {
        return glue !== 'last' ? "( " + ruleString + " ) " + glue.toUpperCase() + " " : "( " + ruleString + " )";
    },
    _convertValueToSql: function (el, values) {
        var format = this.config.sqlDateFormat;
        for (var key in this.sqlOperators) {
            if (key === el.rule) {
                var operatorsItem = this.sqlOperators[key];
                var value = void 0;
                if (operatorsItem.no_val) {
                    return;
                }
                else if (operatorsItem.mod) {
                    value = operatorsItem.mod.replace("{0}", "" + el.value);
                }
                else {
                    if (Array.isArray(el.value)) {
                        for (var i = 0; i < el.value.length; i++) {
                            if (Array.isArray(el.value[i])) {
                                el.value = el.value[0];
                            }
                            values.push(el.value[i]);
                        }
                        return;
                    }
                    else if (Object.prototype.toString.call(el.value) === '[object Date]' || el.value.start) {
                        if (el.value.start && el.value.start.getFullYear) {
                            var start = [el.value.start, el.value.end].map(function (item) { return format(item); });
                            for (var i = 0; i < start.length; i++) {
                                values.push(start[i]);
                            }
                            return;
                        }
                        else if (Object.prototype.toString.call(el.value) === '[object Date]') {
                            el.value = format(el.value);
                        }
                    }
                    value = el.value;
                }
                values.push(value);
            }
        }
    },
    _convertRuleToSql: function (el, config) {
        var format = this.config.sqlDateFormat;
        for (var key in this.sqlOperators) {
            if (key === el.rule) {
                var operatorsItem = this.sqlOperators[key];
                var operator = this.sqlOperators[key].op;
                if (!config.placeholders) {
                    if (operatorsItem.mod) {
                        operator = operator.replace("?", "\"" + operatorsItem.mod.replace("{0}", "" + el.value) + "\"");
                    }
                    else if (operatorsItem.sep) {
                        if (Array.isArray(el.value)) {
                            operator = operator.replace("?", "" + el.value[0] + operatorsItem.sep + el.value[1]);
                        }
                        else if (el.value.start) {
                            operator = operator.replace("?", "\"" + format(el.value.start) + "\"" + operatorsItem.sep + "\"" + format(el.value.end) + "\"");
                        }
                    }
                    else {
                        operator = operator.replace("?", typeof el.value === "string" ? "\"" + el.value + "\"" : "" + el.value);
                    }
                }
                else {
                    if (operatorsItem.sep) {
                        operator = operator.replace("?", "?" + operatorsItem.sep + "?");
                    }
                }
                return operator;
            }
        }
    }
};


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(1);
var locales_1 = __webpack_require__(0);
webix.i18n.querybuilder = locales_1.locale;
webix.protoUI({
    name: "querybuilderline",
    defaults: {
        height: 36,
        padding: 0, margin: 0,
        borderless: true
    },
    $init: function () {
        this.$view.className += " webix_querybuilder_line";
        this.$ready.unshift(this._setqueryline);
        this.$ready.push(this._setForm);
    },
    setFilters: function (filters) {
        this.config.filters = filters;
        this._setRuleSelect(this.config.value, this.config.fields, true);
    },
    _setqueryline: function () {
        var _this = this;
        var select = {
            view: "richselect",
            minWidth: 100, maxWidth: this.config.inputMaxWidth, inputWidth: this.config.inputWidth, width: this.config.inputWidth,
            height: 38, inputHeight: 38, maxHeight: 38,
            inputPadding: 0,
            options: [],
            css: "",
            name: ""
        };
        this.cols_setter([
            __assign({}, select, { css: "webix_querybuilder_value_select", name: "key" }),
            __assign({}, select, { css: "webix_querybuilder_rule_select", name: "rule", hidden: true }),
            { view: "button", type: "htmlbutton", css: "webix_querybuilder_close", width: 20, inputWidth: 20, name: "close",
                label: "<span class=\"fa fa-trash-o\" title=\"" + locales_1.locale.delete_rule + "\"></sapn>", click: function () {
                    _this._masterQuery._deleteRow(_this);
                }
            }, { gravity: 0.001 }
        ]);
    },
    _setForm: function () {
        this._valueSelect = this.elements.key;
        this._ruleSelect = this.elements.rule;
        if (this.config.columnMode) {
            if (!this.$view.classList.contains("webix_column_qb")) {
                this.define({ height: 150, margin: 0, rows: [] });
                webix.html.addCss(this.$view, "webix_column_qb");
                this.elements.close.getNode().style.display = "block";
            }
        }
        else {
            if (this.$view.classList.contains("webix_column_qb")) {
                webix.html.removeCss(this.$view, "webix_column_qb");
                this.define({ height: 38, margin: 10, cols: [] });
                this.elements.close.getNode().style.display = "inline-block";
            }
        }
        this._setKeySelect();
    },
    _setPreselectedKeys: function (rule) {
        this._setKeySelect(rule);
        this._setRuleSelect(rule, this.config.fields);
    },
    _setKeySelect: function (rule) {
        var _this = this;
        var options = [{ id: "not_selected", value: locales_1.locale.default_option, type: "string" }].concat(this.config.fields);
        var obj = {};
        this._valueSelect.getList().parse(options);
        if (rule) {
            this._valueSelect.setValue(rule.key);
            this._updateRules(rule);
        }
        else {
            rule = obj;
        }
        if (this.eventSelEl) {
            webix.eventRemove(this.eventSelEl);
        }
        this.eventSelEl = webix.event(this._valueSelect, "change", function (e) {
            rule.key = _this._valueSelect.getValue();
            if (rule.key === "not_selected") {
                _this._changeRule("not_sel");
                if (_this._ruleSelect) {
                    _this._ruleSelect.hide();
                }
                if (_this._ruleInput) {
                    _this._ruleInput.hide();
                }
                _this._getTopQuery().callEvent("onKeySelect", [_this]);
                return;
            }
            rule.rule = undefined;
            rule.value = null;
            _this._updateRules(rule);
            _this._setRuleSelect(rule, options);
            _this._getTopQuery().callEvent("onKeySelect", [_this]);
        });
    },
    _setRuleSelect: function (rule, options, update) {
        var _this = this;
        this._ruleSelect.getList().clearAll();
        if (rule.key !== "not_selected") {
            var filters = this._setFilterRule(rule.key, options);
            var optionsList_1 = [];
            filters.forEach(function (item, index, array) {
                for (var key in locales_1.locale) {
                    if (key === item.id) {
                        optionsList_1.push({ id: item.id, value: locales_1.locale[key] });
                    }
                }
                _this._ruleSelect.getList().parse(optionsList_1);
            });
            if (!rule.rule) {
                rule.rule = filters[0].id;
                rule.value = null;
            }
            this._ruleSelect.show();
            this._ruleSelect.$view.style.display = "";
            this._ruleSelect.setValue(rule.rule);
            if (!update) {
                this._setRuleEl(rule);
            }
            this._updateRules(rule);
        }
        if (!update) {
            if (this.eventSelRule) {
                webix.eventRemove(this.eventSelRule);
            }
            this.eventSelRule = webix.event(this._ruleSelect, "change", function (e) {
                _this.config.filters.forEach(function (item) {
                    for (var key in locales_1.locale) {
                        if (key === item.id) {
                            if (locales_1.locale[key] === _this._ruleSelect.getList().data.pull[_this._ruleSelect.getValue()].value) {
                                rule.rule = item.id;
                            }
                        }
                    }
                });
                _this._setRuleEl(rule, options);
                _this._updateRules(rule);
                if (rule.value || rule.value === 0) {
                    _this._callChangeMethod();
                }
            });
        }
    },
    _setFilterRule: function (selectedItem, optionsArray) {
        var ruleTypesArray = [];
        for (var option in optionsArray) {
            if (optionsArray[option].id === selectedItem) {
                this._ruleType = optionsArray[option].type;
            }
        }
        for (var key in this.config.filters) {
            if (this._ruleType === "date" && this.config.filters[key].type === "number") {
                ruleTypesArray.push(this.config.filters[key]);
            }
            if (this.config.filters[key].type === this._ruleType || this.config.filters[key].type === "any") {
                ruleTypesArray.push(this.config.filters[key]);
            }
        }
        return ruleTypesArray;
    },
    _updateRules: function (rule) {
        if (rule === "not_sel") {
            this.config.value = null;
            return;
        }
        var obj = {};
        if (!this.config.value) {
            this.config.value = obj;
        }
        if (rule) {
            this.config.value = { key: rule.key, rule: rule.rule, value: rule.value };
        }
        return this.config.value;
    },
    _getTopQuery: function () {
        var parent = this._masterQuery;
        return parent._getTopQuery ? parent._getTopQuery() : parent;
    },
    _callChangeMethod: function () {
        this._getTopQuery().callEvent("onChange", []);
    },
    _changeRule: function (rule) {
        this._updateRules(rule);
        this._callChangeMethod();
    },
    _setRuleEl: function (rule) {
        var _this = this;
        var value = this.config.value.value;
        var customEl = [this._datepicker, this._datepickerRange, this._slider, this._inputText];
        customEl.forEach(function (item) {
            if (item) {
                item.hide();
            }
        });
        if (rule.rule === "is_null" || rule.rule === "is_not_null") {
            rule.value = null;
            this._changeRule(rule);
            return;
        }
        else if (rule.rule === "is_not_empty" || rule.rule === "is_empty") {
            rule.value = "";
            this._changeRule(rule);
            return;
        }
        this.config.value = rule = this._setCustomRuleEl(rule, value);
        if (this._ruleInput) {
            this._ruleInput.show();
        }
        this.config.fields.forEach(function (item, index, array) {
            if (item.validate && item.id === rule.key) {
                _this._ruleInput.define("validate", item.validate);
                _this._ruleInput.refresh();
            }
            else if (!item.validate && item.id === rule.key) {
                _this.markInvalid(_this._ruleInput.config.name, false);
            }
        });
        this._handleEvents(rule);
    },
    _setCustomRuleEl: function (rule, value) {
        var el = {
            minWidth: 100, maxWidth: this.config.inputMaxWidth, width: this.config.inputWidth,
            inputWidth: this.config.inputWidth, height: 38, inputHeight: 38, maxHeight: 38,
            name: "value"
        };
        if (rule && rule.rule) {
            if (!rule.key) {
                return;
            }
            if (this._ruleType === "date" && rule.rule !== "is_null" && rule.rule !== "is_not_null") {
                if (value && typeof value === "object" && value.length) {
                    value = "";
                }
                else if (!this.config.value.value) {
                    value = new Date();
                }
                if (rule.rule === "between" || rule.rule === "not_between") {
                    if (!this._datepickerRange) {
                        if (value && !value.start || value && !value.end) {
                            value = { start: value, end: value };
                        }
                        this._datepickerRange = webix.$$(this.addView(__assign({}, el, { view: "daterangepicker", value: value }), this.queryView({}, 'all').length - 2));
                    }
                    else if (this._datepickerRange) {
                        if (rule.value && rule.value.start) {
                            value = value;
                        }
                        else if (rule.value && rule.value.start === '' || !rule.value) {
                            value = { start: new Date(), end: new Date() };
                        }
                        else if (rule.value) {
                            value = { start: rule.value, end: rule.value };
                        }
                    }
                    this._ruleInput = this._datepickerRange;
                }
                else if (rule.rule !== "between" && rule.rule !== "not_between") {
                    if (value && value.end) {
                        value = value.start;
                    }
                    else if (!value || Array.isArray(rule.value)) {
                        value = new Date();
                    }
                    if (!this._datepicker) {
                        this._datepicker = webix.$$(this.addView(__assign({}, el, { view: "datepicker", value: value }), this.queryView({}, 'all').length - 2));
                    }
                    else if (this._datepicker) {
                        if (rule.value && rule.value.start) {
                            value = rule.value.start;
                        }
                        else if (rule.value && rule.value.start === '' || !rule.value) {
                            value = new Date();
                        }
                        else if (rule.value) {
                            value = rule.value;
                        }
                    }
                    this._ruleInput = this._datepicker;
                }
            }
            else if ((rule.rule === "between" || rule.rule === "not_between") && (this._ruleType !== "date")) {
                if (!this._slider) {
                    if (!value || !value.length) {
                        value = [[0, 0], [0, 100]];
                    }
                    else if (typeof value[1][0] === "undefined") {
                        value = [value, [0, 100]];
                    }
                    this._slider = webix.$$(this.addView(__assign({}, el, { view: "rangeslider", value: value[0], min: value[1][0], max: value[1][1], title: function (obj) {
                            var v = obj.value[0].length ? obj.value[0] : obj.value;
                            return (v[0] === v[1] ? v[0] : v[0] + " - " + v[1]);
                        } }), this.queryView({}, 'all').length - 2));
                }
                else if (this._slider) {
                    if (rule.value === 0 || (rule.value && !rule.value.length) || (!rule.value) || (!rule.value[1])) {
                        value = [[0, 0], [this._slider.config.min, this._slider.config.max]];
                    }
                    this._slider.define({ min: value[1][0], max: value[1][1] });
                }
                this._ruleInput = this._slider;
            }
            else {
                if (!this._inputText) {
                    this._inputText = webix.$$(this.addView(__assign({}, el, { view: "text", css: "webix_querybuilder_rule_input", type: "string" }), this.queryView({}, 'all').length - 2));
                    value = this._setInputType(value, rule);
                }
                value = this._setInputType(value, rule, true);
                this._ruleInput = this._inputText;
            }
            rule.value = value;
            this._updateRules(rule);
            if (Array.isArray(value)) {
                this._ruleInput.setValue(value[0]);
                return rule;
            }
            this._ruleInput.setValue(value);
        }
        return rule;
    },
    _setInputType: function (value, rule, input) {
        if (this._ruleType === "number") {
            if (typeof rule.value !== "number" || (!input)) {
                value = 0;
            }
            this._inputText.define("type", "number");
        }
        else {
            if (typeof rule.value !== "string" || (!input)) {
                value = "";
            }
            this._inputText.define("type", "string");
        }
        this._inputText.refresh();
        return value;
    },
    _handleEvents: function (rule) {
        var _this = this;
        // add listener to update rules onchange
        var timer;
        this.attachEvent("onDestruct", function () { return _this._ruleInput.destructor(); });
        if (this._ruleInput) {
            if (this.eventObjInput) {
                this._ruleInput.detachEvent(this.eventObjInput);
            }
            if (this.eventObjPress) {
                this._ruleInput.detachEvent(this.eventObjPress);
            }
            this.eventObjInput = this._ruleInput.attachEvent("onChange", function (newValue) {
                if (_this._ruleType === "number" && !Array.isArray(newValue)) {
                    newValue = Number(newValue);
                }
                if (_this.config.value.value === newValue) {
                    return;
                }
                if (Array.isArray(newValue)) {
                    newValue = [newValue, [_this._slider.config.min, _this._slider.config.max]];
                }
                rule.value = newValue;
                _this._changeRule(rule);
            });
            if (this._ruleInput.config.css === "webix_querybuilder_rule_input") {
                this.eventObjPress = this._ruleInput.attachEvent("onKeyPress", function (e) {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(function () {
                        if (_this._ruleType === "number") {
                            rule.value = Number(_this._inputText.getValue());
                        }
                        else {
                            rule.value = _this._inputText.getValue();
                        }
                        _this._changeRule(rule);
                    }, 250);
                });
            }
        }
    },
    _getValue: function () {
        return this.config.value;
    },
    setValue: function (value) {
        this.config.value = value;
        this._setPreselectedKeys(this.config.value);
    },
    getFilterHelper: function () {
        var _this = this;
        var result;
        var confValue = this.config.value;
        var confFilters = this.config.filters;
        var filterFunction = function (obj) {
            if (!confValue) {
                return true;
            }
            for (var filter in confFilters) {
                if (confFilters[filter].id === confValue.rule) {
                    if (confValue.value === null) {
                        result = confFilters[filter].fn(obj[confValue.key], confValue.value);
                    }
                    else if (_this._ruleType === "date") {
                        var keyItem = obj[confValue.key] ? obj[confValue.key].getTime() : obj[confValue.key];
                        var confItem = confValue.value;
                        if (typeof confItem === 'object' && confItem.start) {
                            var confStart = confItem.start;
                            var confEnd = confItem.end;
                            confStart = (confStart ? confStart.getTime() : confStart);
                            confEnd = (confEnd ? confEnd.getTime() : confEnd);
                            result = confFilters[filter].fn(keyItem, confStart, confEnd);
                        }
                        else {
                            if (typeof confItem === 'string') {
                                confItem = webix.i18n.parseFormatDate(confItem);
                            }
                            confItem = confItem.getTime();
                            result = confFilters[filter].fn(keyItem, confItem);
                        }
                    }
                    else {
                        if (typeof confValue.value === 'string' && typeof obj[confValue.key] === 'string') {
                            result = confFilters[filter].fn(obj[confValue.key].toLowerCase(), confValue.value.toLowerCase());
                        }
                        else if (_this._ruleType === 'number' && typeof obj[confValue.key] === 'number' && !Array.isArray(confValue.value)) {
                            result = confFilters[filter].fn(obj[confValue.key], Number(confValue.value));
                        }
                        else {
                            // range
                            result = confFilters[filter].fn(obj[confValue.key], confValue.value[0][0], confValue.value[0][1]);
                        }
                    }
                }
            }
            return result;
        };
        return filterFunction;
    }
}, webix.ui.form, webix.EventSystem);


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ })
/******/ ]);