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
  serializeArray: function (form) {
    var serialized = [];
    // https://github.com/jquery/jquery/blob/2.1-stable/src/serialize.js#L12
    var rCRLF = /\r?\n/g,
      rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
      rsubmittable = /^(?:input|select|textarea|keygen)/i,
      rcheckableType = /^(?:checkbox|radio)$/i;

    var nodeIterator = document.createNodeIterator(
      form,
      NodeFilter.SHOW_ELEMENT,
      function (node) {
        // The .serializeArray() method uses the standard W3C rules for
        // successful controls to determine which elements it should include;
        // in particular the element cannot be disabled and must contain a name
        // attribute. No submit button value is serialized since the form was
        // not submitted using a button. Data from file select elements is not
        // serialized.
        var type = node.type;

        return node.name &&
          !node.disabled &&
          rsubmittable.test(node.nodeName) &&
          !rsubmitterTypes.test(type) &&
          (node.checked || !rcheckableType.test(type))
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
      },
      false
    );
    var field;
    /*eslint-disable no-cond-assign */
    while (field = nodeIterator.nextNode()) {
      var val = field.value.replace(rCRLF, "\r\n");
      if (field.type === "number") {
        let number = parseFloat(val);
        val = !isNaN(number) ? number : val;
      }
      if (field.type === "checkbox") {
        val = !!val;
      }
      if (val != null) {
        serialized.push({name: field.name, value: val});
      }
    }
    /*eslint-enable no-cond-assign */
    return serialized;
  },
  serializedArrayToDictionary: function (serializedArray = []) {
    var sanitizePath = function (path) {
      return path
        .replace(/^\.|\.$/, "") // leading/trailing dots
        .replace(/\.\.+/, "."); // multiple dots
    };
    var parsePath = function (obj, position, tokens, value) {
      if (position === tokens.length) {
        return value;
      }
      const token = tokens[position];
      let matches = token.match(/(\w+)\[(\d*)]$/); // parse array notation

      if (!matches) {
        if (obj[token] === undefined) {
          obj[token] = {};
        }
        obj[token] = parsePath(obj[token], position + 1, tokens, value);
      } else {
        let [key, index] = matches.slice(1);
        if (obj[key] === undefined) {
          obj[key] = [];
        }
        if (index.length === 0) {
          index = obj[key].length;
        }
        if (obj[key][index] === undefined) {
          obj[key][index] = {};
        }
        obj[key][index] =
            parsePath(obj[key][index], position + 1, tokens, value);
      }
      return obj;
    };

    let json = {};
    for (let i = 0; i < serializedArray.length; i++) {
      const value = serializedArray[i].value;
      let tokens = sanitizePath(serializedArray[i].name).split(".");
      parsePath(json, 0, tokens, value);
    }
    return json;
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
  hasClass: function (element, className) {
    return element.className &&
      element.className.match(/\S+/g).indexOf(className) > -1;
  },
  noop: function () {},
  extendObject: function (...sources) {
    return Object.assign({}, ...sources);
  },
  // TODO: delete after #2105
  compactArray: function (arr) {
    if (!Util.isArray(arr)) {
      return arr;
    }
    return arr.map(function (item) {
      let compactedItem = {};
      for (let key in item) {
        if (item.hasOwnProperty(key)) {
          let val = item[key];
          if (val != null && val !== "") {
            compactedItem[key] = val;
          }
        }
      }
      if (Object.keys(compactedItem).length > 0) {
        return compactedItem;
      }
    }).filter(function (item) {
      return item != null;
    });
  }
};

module.exports = Util;
