var AppDispatcher = require("../AppDispatcher");
var DialogEvents = require("../events/DialogEvents");

var DialogActions = {
  alert: function (message) {
    const dialogId = Symbol(message);
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.ALERT_SHOW,
      dialogId: dialogId,
      message: message
    });
    return dialogId;
  },
  alertDismiss: function (dialogId) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.ALERT_DISMISS,
      dialogId: dialogId
    });
  },
  confirm: function (message, successButtonLabel = "OK") {
    const dialogId = Symbol(message);
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.CONFIRM_SHOW,
      dialogId: dialogId,
      message: message
    });
    return dialogId;
  },
  confirmDismiss: function (dialogId) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.CONFIRM_DISMISS,
      dialogId: dialogId
    });
  },
  confirmAccept: function (dialogId) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.CONFIRM_ACCEPT,
      dialogId: dialogId
    });
  },
  prompt: function (message, defaultValue = "", inputProps = {type: "text"}) {
    const dialogId = Symbol(message);
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.PROMPT_SHOW,
      defaultValue: defaultValue,
      dialogId: dialogId,
      inputProps: inputProps,
      message: message
    });
    return dialogId;
  },
  promptDismiss: function (dialogId) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.PROMPT_DISMISS,
      dialogId: dialogId
    });
  },
  promptAccept: function (dialogId, value) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.PROMPT_ACCEPT,
      dialogId: dialogId,
      value: value
    });
  },
  dismissLatest: function () {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.DISMISS_LATEST
    });
  }
};

module.exports = DialogActions;
