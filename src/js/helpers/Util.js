var consecutiveNumber = 0;
var objectPath = require("object-path");

var Util = {
  param: function (obj) {
    if (typeof obj !== "object" ) {
      return obj;
    }
    try {
      return Object.keys(obj).reduce(function (a, k) {
        a.push(k + "=" + encodeURIComponent(obj[k]));
        return a;
      }, []).join("&");
    } catch (e) {
      return obj;
    }
  },
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
    return ++consecutiveNumber;
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
  }
};

module.exports = Util;
