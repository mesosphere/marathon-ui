var AppDispatcher = require("../AppDispatcher");
var DialogEvents = require("../events/DialogEvents");

var DialogActions = {
  alert: function (message) {
    const dialogId = Symbol(message);
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.ALERT,
      message: message,
      dialogId: dialogId
    });
    return dialogId;
  },
  alertClose: function (dialogId) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.ALERT_CLOSE,
      dialogId: dialogId
    });
  },
  confirm: function (message) {
    const dialogId = Symbol(message);
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.CONFIRM,
      message: message,
      dialogId: dialogId
    });
    return dialogId;
  },
  confirmClose: function (dialogId) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.CONFIRM_CLOSE,
      dialogId: dialogId
    });
  },
  confirmAccept: function (dialogId) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.CONFIRM_ACCEPT,
      dialogId: dialogId
    });
  }
};

module.exports = DialogActions;
