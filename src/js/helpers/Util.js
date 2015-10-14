var objectPath = require("object-path");

var consecutiveNumber = 0;
// Use ``Object.prototype.toString``, as the *global* ``window.toString``
// method can't be *call*ed on a different objects in IE.
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
  isEmptyString: function (str) {
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
  }
};

module.exports = Util;
