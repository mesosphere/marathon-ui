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
  }
};

module.exports = util;
