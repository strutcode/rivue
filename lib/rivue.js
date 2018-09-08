(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("vue"));
	else if(typeof define === 'function' && define.amd)
		define(["vue"], factory);
	else if(typeof exports === 'object')
		exports["Rivue"] = factory(require("vue"));
	else
		root["Rivue"] = factory(root["Vue"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE_vue__) {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ "./src/Store.js":
/*!**********************!*\
  !*** ./src/Store.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Store; });
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue */ "vue");
/* harmony import */ var vue__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue__WEBPACK_IMPORTED_MODULE_0__);


class Store {
  constructor(stores) {
    Object.entries(stores).forEach(([name, Constructor]) => {
      const storeName = name.toLowerCase()

      let instance, props

      if (typeof Constructor === 'function') {
        instance = new Constructor()
        props = [
          ...Object.getOwnPropertyNames(Constructor.prototype),
          ...Object.getOwnPropertyNames(instance),
        ]
      }
      else if (typeof Constructor === 'object') {
        instance = Constructor
        props = Object.getOwnPropertyNames(instance)
      }
      else {
        throw new Error(`Provided store '${name}' is not a class or object`)
      }

      props.forEach(key => {
        if (typeof instance[key] === 'function') {
          vue__WEBPACK_IMPORTED_MODULE_0__["util"].defineReactive(instance, key, instance[key].bind(instance))
        }

        vue__WEBPACK_IMPORTED_MODULE_0__["util"].defineReactive(instance, key)
      })

      Object.defineProperty(instance, '$store', {
        value: this,
        configurable: false,
        enumerable: false,
      })

      this[storeName] = instance
    })
  }
}


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: Store, install, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "install", function() { return install; });
/* harmony import */ var _Store__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Store */ "./src/Store.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Store", function() { return _Store__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./util */ "./src/util.js");



function install(Vue, options) {
  Vue.mixin({
    beforeCreate() {
      const options = this.$options

      if (!options.parent && options.store) {
        if (!(options.store instanceof _Store__WEBPACK_IMPORTED_MODULE_0__["default"])) {
          throw new Error('provided store is not a Rivue store')
        }

        this.$store = options.store
      }

      if (options.parent && options.parent.$store) this.$store = options.parent.$store

      // Init
      const store = this.$store
      const init = name => typeof options[name] === 'function' ? options[name]() : options[name] || {}

      options.data = init('data')
      options.computed = init('computed')
      options.methods = init('methods')

      if (options.state) {
        const map = Object(_util__WEBPACK_IMPORTED_MODULE_1__["resolveParam"])(store, options.state)

        // TODO: verification

        map.forEach(({ parent, name }) => {
          options.computed[name] = {
            get: function() {
              return parent[name]
            },
            set: function(val) {
              parent[name] = val
            }
          }
        })
      }
    },
    created() {
      const options = this.$options
      const store = this.$store

      if (options.stores) {
        const map = Object(_util__WEBPACK_IMPORTED_MODULE_1__["resolveParam"])(store, options.stores)

        // TODO: verification

        map.forEach(({ name, value }) => {
          this[name] = value
        })
      }

      if (options.actions) {
        const map = Object(_util__WEBPACK_IMPORTED_MODULE_1__["resolveParam"])(store, options.actions)

        // TODO: verification

        map.forEach(({ parent, name, value }) => {
          this[name] = value
        })
      }
    }
  })
}

const Rivue = {
  Store: _Store__WEBPACK_IMPORTED_MODULE_0__["default"],
  install,
}

if (global.Vue) global.Vue.use(Rivue)


/* harmony default export */ __webpack_exports__["default"] = (Rivue);

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/util.js":
/*!*********************!*\
  !*** ./src/util.js ***!
  \*********************/
/*! exports provided: lookupDescriptor, resolveParam */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lookupDescriptor", function() { return lookupDescriptor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resolveParam", function() { return resolveParam; });
function lookupDescriptor(root, desc) {
  const ids = desc.split(/\.|\/|\\/)
  const name = ids[ids.length - 1]
  let parent
  let value = root

  for (let i = 0; i < ids.length; i++) {
    if (typeof value !== 'object' || value[ids[i]] === undefined) {
      break
    }

    parent = value
    value = value[ids[i]]
  }

  return { parent, name, value }
}

function resolveParam(store, param) {
  if (Array.isArray(param)) {
    return param.map(lookupDescriptor.bind(null, store))
  }
  if (typeof param === 'object') {
    const flatLookup = (acc, [key, value]) => {
      const resolved = resolveParam(store[key], value)
      return acc.concat(resolved)
    }

    return Object.entries(param).reduce(flatLookup, [])
  }
  if (typeof param === 'string') {
    return [lookupDescriptor(store, param)]
  }

  return []
}


/***/ }),

/***/ "vue":
/*!******************************************************************************!*\
  !*** external {"commonjs":"vue","commonjs2":"vue","amd":"vue","root":"Vue"} ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_vue__;

/***/ })

/******/ });
});
//# sourceMappingURL=rivue.js.map