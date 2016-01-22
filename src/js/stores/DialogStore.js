import {EventEmitter} from "events";
import lazy from "lazy.js";
import Util from "../helpers/Util";

import AppDispatcher from "../AppDispatcher";
import DialogEvents from "../events/DialogEvents";

var dialogs = [];

function addDialog(dialog) {
  dialogs.push(dialog);
}

function removeDialog(dialog) {
  if (dialog == null) {
    return;
  }

  let dialogId = dialog.id;
  dialogs = dialogs.filter(function (dialog) {
    return dialog.id !== dialogId;
  });
}

var DialogStore = lazy(EventEmitter.prototype).extend({
  handleUserResponse: function (dialogId,
    acceptCallback,
    dismissCallback = Util.noop
  ) {

    function onAccept(dialog, value = null) {
      if (dialog != null && dialogId === dialog.id) {
        acceptCallback(value);
        removeListeners();
      }
    }

    function onDismiss(dialog) {
      if (dialog != null && dialogId === dialog.id) {
        dismissCallback();
        removeListeners();
      }
    }

    function removeListeners() {
      DialogStore.removeListener(DialogEvents.ACCEPT_DIALOG, onAccept);
      DialogStore.removeListener(DialogEvents.DISMISS_DIALOG, onDismiss);
    }

    DialogStore.on(DialogEvents.ACCEPT_DIALOG, onAccept);
    DialogStore.on(DialogEvents.DISMISS_DIALOG, onDismiss);
  }
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case DialogEvents.SHOW_DIALOG:
      addDialog(action.dialog);
      DialogStore.emit(DialogEvents.SHOW_DIALOG, action.dialog);
      break;
    case DialogEvents.ACCEPT_DIALOG:
      removeDialog(action.dialog);
      DialogStore.emit(DialogEvents.ACCEPT_DIALOG, action.dialog, action.value);
      break;
    case DialogEvents.DISMISS_DIALOG:
      removeDialog(action.dialog);
      DialogStore.emit(DialogEvents.DISMISS_DIALOG, action.dialog);
      break;
    case DialogEvents.DISMISS_LATEST:
      var latestDialog = dialogs.pop();
      if (latestDialog) {
        DialogStore.emit(DialogEvents.DISMISS_DIALOG, latestDialog);
      }
      break;
  }
});

export default DialogStore;
