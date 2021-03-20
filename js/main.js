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
/******/ 	return __webpack_require__(__webpack_require__.s = "./app/js/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./app/js/main.js":
/*!************************!*\
  !*** ./app/js/main.js ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _slider__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./slider */ "./app/js/slider.js");
/* harmony import */ var _textarea__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./textarea */ "./app/js/textarea.js");


Object(_slider__WEBPACK_IMPORTED_MODULE_0__["default"])();
Object(_textarea__WEBPACK_IMPORTED_MODULE_1__["default"])();

/***/ }),

/***/ "./app/js/slider.js":
/*!**************************!*\
  !*** ./app/js/slider.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var range;
var slides;

var findElements = function findElements() {
  range = document.querySelector('.slider__range');
  slides = [].slice.call(document.querySelectorAll('.slider__item')).map(function (slide) {
    return slide.querySelector('input');
  });
};

var isFirst = function isFirst() {
  return range.value >= 0 && range.value < 38;
};

var isSecond = function isSecond() {
  return range.value >= 38 && range.value < 99;
};

var isThird = function isThird() {
  return range.value >= 99 && range.value < 165;
};

var isFourh = function isFourh() {
  return range.value >= 165;
};

var onSlideInput = function onSlideInput(_ref) {
  var currentTarget = _ref.currentTarget;
  range.value = currentTarget.value;
};

var onRangeInput = function onRangeInput() {
  if (isFirst()) {
    slides[0].checked = true;
  } else if (isSecond()) {
    slides[1].checked = true;
  } else if (isThird()) {
    slides[2].checked = true;
  } else if (isFourh()) {
    slides[3].checked = true;
  }
};

var subscribe = function subscribe() {
  range.addEventListener('input', onRangeInput);
  slides.forEach(function (slide) {
    return slide.addEventListener('input', onSlideInput);
  });
};

/* harmony default export */ __webpack_exports__["default"] = (function () {
  findElements();
  subscribe();
});

/***/ }),

/***/ "./app/js/textarea.js":
/*!****************************!*\
  !*** ./app/js/textarea.js ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = (function () {
  var textarea = document.querySelector('textarea');

  var update = function update() {
    textarea.style.height = 'auto';
    textarea.style.height = "".concat(textarea.scrollHeight, "px");
  };

  textarea.addEventListener('input', update);
  update();
});

/***/ })

/******/ });
//# sourceMappingURL=main.js.map