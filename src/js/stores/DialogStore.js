var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");
var Util = require("../helpers/Util");

var AppDispatcher = require("../AppDispatcher");
var DialogEvents = require("../events/DialogEvents");
var DialogTypes = require("../constants/DialogTypes");

function addDialog(dialogs, message, dialogId, dialogType) {
  dialogs.push({id: dialogId, message: message, type: dialogType});
}

function removeDialog(dialogs, dialogId) {
  dialogs = dialogs.filter(function (dialog) {
    return dialog.id !== dialogId;
  });
}

var DialogStore = lazy(EventEmitter.prototype).extend({
  dialogs: [],
  handleUserResponse: function (dialogId,
    acceptCallback,
    dismissCallback = Util.noop
  ) {

    function onAccept(id, value = null) {
      if (dialogId === id) {
        acceptCallback(value);
        removeListeners();
      }
    }

    function onDismiss(id) {
      if (dialogId === id) {
        dismissCallback();
        removeListeners();
      }
    }

    function removeListeners() {
      DialogStore.removeListener(DialogEvents.CONFIRM_ACCEPT, onAccept);
      DialogStore.removeListener(DialogEvents.CONFIRM_DISMISS, onDismiss);
      DialogStore.removeListener(DialogEvents.PROMPT_ACCEPT, onAccept);
      DialogStore.removeListener(DialogEvents.PROMPT_DISMISS, onDismiss);
    }

    DialogStore.on(DialogEvents.CONFIRM_ACCEPT, onAccept);
    DialogStore.on(DialogEvents.CONFIRM_DISMISS, onDismiss);
    DialogStore.on(DialogEvents.PROMPT_ACCEPT, onAccept);
    DialogStore.on(DialogEvents.PROMPT_DISMISS, onDismiss);
  }
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case DialogEvents.ALERT_SHOW:
      addDialog(DialogStore.dialogs, action.message, action.dialogId,
        DialogTypes.ALERT);
      DialogStore.emit(
        DialogEvents.ALERT_SHOW,
        action.message,
        action.dialogId
      );
      break;
    case DialogEvents.ALERT_DISMISS:
      removeDialog(DialogStore.dialogs, action.dialogId);
      DialogStore.emit(DialogEvents.ALERT_DISMISS, action.dialogId);
      break;
    case DialogEvents.CONFIRM_SHOW:
      addDialog(DialogStore.dialogs, action.message, action.dialogId,
        DialogTypes.CONFIRM);
      DialogStore.emit(
        DialogEvents.CONFIRM_SHOW,
        action.message,
        action.dialogId
      );
      break;
    case DialogEvents.CONFIRM_DISMISS:
      removeDialog(DialogStore.dialogs, action.dialogId);
      DialogStore.emit(DialogEvents.CONFIRM_DISMISS, action.dialogId);
      break;
    case DialogEvents.CONFIRM_ACCEPT:
      removeDialog(DialogStore.dialogs, action.dialogId);
      DialogStore.emit(DialogEvents.CONFIRM_ACCEPT, action.dialogId);
      break;
    case DialogEvents.PROMPT_SHOW:
      addDialog(DialogStore.dialogs, action.message, action.dialogId,
        DialogTypes.PROMPT);
      DialogStore.emit(
        DialogEvents.PROMPT_SHOW,
        action.message,
        action.defaultValue,
        action.dialogId,
        action.inputProps
      );
      break;
    case DialogEvents.PROMPT_DISMISS:
      removeDialog(DialogStore.dialogs, action.dialogId);
      DialogStore.emit(DialogEvents.PROMPT_DISMISS, action.dialogId);
      break;
    case DialogEvents.PROMPT_ACCEPT:
      removeDialog(DialogStore.dialogs, action.dialogId);
      DialogStore.emit(
        DialogEvents.PROMPT_ACCEPT,
        action.dialogId,
        action.value
      );
      break;
    case DialogEvents.DISMISS_LATEST:
      var latestDialog = DialogStore.dialogs.pop();
      if (latestDialog) {
        if (latestDialog.type === DialogTypes.ALERT) {
          DialogStore.emit(DialogEvents.ALERT_DISMISS, latestDialog.id);
        }
        if (latestDialog.type === DialogTypes.CONFIRM) {
          DialogStore.emit(DialogEvents.CONFIRM_DISMISS, latestDialog.id);
        }
        if (latestDialog.type === DialogTypes.PROMPT) {
          DialogStore.emit(DialogEvents.PROMPT_DISMISS, latestDialog.id);
        }
      }
      break;
  }
});

module.exports = DialogStore;
