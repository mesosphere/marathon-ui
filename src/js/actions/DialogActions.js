import Util from "../helpers/Util";
import AppDispatcher from "../AppDispatcher";
import DialogEvents from "../events/DialogEvents";
import DialogTypes from "../constants/DialogTypes";
import dialogScheme from "../stores/schemes/dialogScheme";

function showDialog(data) {
  var dialog = Util.extendObject(dialogScheme, data,
    {id: Symbol("dialogId")});

  AppDispatcher.dispatchNext({
    actionType: DialogEvents.SHOW_DIALOG,
    dialog: dialog
  });

  return dialog.id;
}

var DialogActions = {
  alert: function (...data) {
    if (Util.isObject(data[0])) {
      return showDialog(Object.assign(data[0],
        {type: DialogTypes.ALERT}));
    }

    let [message, actionButtonLabel = "OK"] = data;

    return showDialog({
      actionButtonLabel: actionButtonLabel,
      message: message,
      type: DialogTypes.ALERT
    });
  },

  confirm: function (...data) {
    if (Util.isObject(data[0])) {
      return showDialog(Object.assign(data[0],
        {type: DialogTypes.CONFIRM}));
    }

    let [message, actionButtonLabel = "OK"] = data;

    return showDialog({
      actionButtonLabel: actionButtonLabel,
      message: message,
      type: DialogTypes.CONFIRM
    });
  },

  prompt: function (...data) {
    if (Util.isObject(data[0])) {
      return showDialog(Object.assign(data[0],
        {type: DialogTypes.PROMPT}));
    }

    let [message, defaultValue = "",
      inputProperties = {type: "text"}] = data;

    return showDialog({
      message: message,
      inputProperties: Object.assign(inputProperties,
        {defaultValue: defaultValue}),
      type: DialogTypes.PROMPT
    });
  },

  dismissDialog: function (dialog) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.DISMISS_DIALOG,
      dialog: dialog
    });
  },

  acceptDialog: function (dialog, value) {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.ACCEPT_DIALOG,
      dialog: dialog,
      value: value
    });
  },

  dismissLatestDialog: function () {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.DISMISS_LATEST
    });
  }
};

export default DialogActions;
