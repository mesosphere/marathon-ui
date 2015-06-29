var util = {
  alert: function () {
    /*eslint-disable no-alert */
    return global.alert.apply(null, arguments);
    /*eslint-enable no-alert */
  },
  confirm: function () {
    /*eslint-disable no-alert */
    return global.confirm.apply(null, arguments);
    /*eslint-enable no-alert */
  },
  prompt: function () {
    /*eslint-disable no-alert */
    return global.prompt.apply(null, arguments);
    /*eslint-enable no-alert */
  },
  param: function (obj) {
    try {
      return Object.keys(obj).reduce(function (a, k) {
        a.push(k + "=" + encodeURIComponent(obj[k]));
        return a;
      }, []).join("&");
    } catch (e) {
      return obj;
    }
  }
};

module.exports = util;
