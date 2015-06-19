var Util = {
  alert: function (msg) {
    /*eslint-disable no-alert */
    return global.alert(msg);
    /*eslint-enable no-alert */
  },
  confirm: function (msg) {
    /*eslint-disable no-alert */
    return global.confirm(msg);
    /*eslint-enable no-alert */
  },
  prompt: function (msg) {
    /*eslint-disable no-alert */
    return global.prompt(msg);
    /*eslint-enable no-alert */
  }
};

module.exports = Util;
