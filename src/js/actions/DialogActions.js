var AppDispatcher = require("../AppDispatcher");
var DialogEvents = require("../events/DialogEvents");

var DialogActions = {
  alert: function (message) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.ALERT,
      message: message
    });
  },
  alertClose: function (dialogId) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.ALERT_CLOSE,
      dialogId: dialogId
    });
  }
};

module.exports = DialogActions;
