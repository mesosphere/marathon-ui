var AppDispatcher = require("../AppDispatcher");
var DialogEvents = require("../events/DialogEvents");

var DialogActions = {
  alert: function (message) {
    const dialogId = Symbol(message);
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.ALERT_SHOW,
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
      actionType: DialogEvents.CONFIRM_SHOW,
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
  },
  prompt: function (message, defaultValue = "") {
    const dialogId = Symbol(message);
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.PROMPT_SHOW,
      message: message,
      defaultValue: defaultValue,
      dialogId: dialogId
    });
    return dialogId;
  },
  promptClose: function (dialogId) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.PROMPT_CLOSE,
      dialogId: dialogId
    });
  },
  promptAccept: function (dialogId, value) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.PROMPT_ACCEPT,
      dialogId: dialogId,
      value: value
    });
  }
};

module.exports = DialogActions;
