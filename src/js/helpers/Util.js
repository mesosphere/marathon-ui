/*eslint-disable no-alert */
var Util = {
    alert: function (msg) {
      return window.alert(msg);
    },
    confirm: function (msg) {
      return window.confirm(msg);
    },
    prompt: function (msg) {
      return window.prompt(msg);
    }
};
/*eslint-enable no-alert */

module.exports = Util;
