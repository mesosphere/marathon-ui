var objectPath = require("object-path");

var consecutiveNumber = 0;
// Use ``Object.prototype.toString``, as the *global* ``window.toString``
// method can't be *call*ed on different objects in IE.
var toString = Object.prototype.toString;

var Util = {
  initKeyValue: function (obj, key, value) {
    if (obj[key] === undefined) {
      obj[key] = value;
    }
  },
  isArray: Array.isArray || function (obj) {
    return toString.call(obj) === "[object Array]";
  },
  isNumber: function (obj) {
    return toString.call(obj) === "[object Number]";
  },
  isString: function (obj) {
    return toString.call(obj) === "[object String]";
  },
  isObject: function (obj) {
    return toString.call(obj) === "[object Object]";
  },
  isStringAndEmpty: function (str) {
    return this.isString(str) && (str == null || str === "");
  },
  hasClass: function (element, className) {
    return element.className &&
      element.className.match(/\S+/g).indexOf(className) > -1;
  },
  noop: function () {},
  extendObject: function (...sources) {
    return Object.assign({}, ...sources);
  },
  getUniqueId: function () {
    return (++consecutiveNumber).toString() + (new Date()).getTime();
  },
  detectObjectPaths: function (obj, startKey, excludePaths = []) {
    var paths = [];

    var detect = (o, p) => {
      if (!this.isObject(o)) {
        paths.push(p);
      } else {
        Object.keys(o).forEach((key) => {
          let path = p != null
            ? `${p}.${key}`
            : key;
          if (excludePaths.indexOf(path) === -1) {
            detect(o[key], path);
          } else {
            paths.push(path);
          }
        });
      }
    };

    if (startKey != null) {
      detect(obj[startKey], startKey);
    } else {
      detect(obj);
    }

    return paths;
  },
  objectPathSet: function (obj, path, value) {
    var [initialKey] = path.split(".");

    if (obj[initialKey] == null) {
      obj[initialKey] = {};
    }

    objectPath.set(obj, path, value);
  },
  deepFreeze: function (obj) {
    Object.freeze(obj);

    if (this.isObject(obj)) {
      Object.keys(obj).forEach((key) => {
        this.deepFreeze(obj[key]);
      });
    } else if (this.isArray(obj)) {
      obj.forEach((value) => {
        this.deepFreeze(value);
      });
    }

    return obj;
  },
  filesize: function (bytes, decimals, threshold, multiplier, units) {
    bytes = bytes || 0;
    if (decimals == null) {
      decimals = 2;
    }
    threshold = threshold || 800; // Steps to next unit if exceeded
    multiplier = multiplier || 1024;
    units = units || ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];

    var factorize = 1;
    var unitIndex;

    for (unitIndex = 0; unitIndex < units.length; unitIndex++) {
      if (unitIndex > 0) {
        factorize = Math.pow(multiplier, unitIndex);
      }

      if (bytes < multiplier * factorize && bytes < threshold * factorize) {
        break;
      }
    }

    if (unitIndex >= units.length) {
      unitIndex = units.length - 1;
    }

    var filesize = bytes / factorize;

    filesize = filesize.toFixed(decimals);

    // This removes unnecessary 0 or . chars at the end of the string/decimals
    if (filesize.indexOf(".") > -1) {
      filesize = filesize.replace(/\.?0*$/, "");
    }

    return filesize + " " + units[unitIndex];
  },
  compareArrays: function (a, b) {
    return a === b ||
      a != null &&
      b != null &&
      a.length === b.length &&
      a.every((v, i) => v === b[i]);
  },
  compareProperties: function (a, b, ...keys) {
    return keys.every((key) => {
      var aVal = a[key];
      var bVal = b[key];
      if (Array.isArray(aVal)) {
        return this.compareArrays(aVal, bVal);
      }
      if (this.isObject(aVal) && this.isObject(bVal)) {
        return this.compareArrays(Object.keys(aVal), Object.keys(bVal))
          && this.compareArrays(Object.values(aVal), Object.values(bVal));
      }
      return aVal === bVal;
    });
  }
};

module.exports = Util;
