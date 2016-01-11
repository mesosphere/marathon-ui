var Util = require("../helpers/Util");
var AppDispatcher = require("../AppDispatcher");
var DialogEvents = require("../events/DialogEvents");
var DialogTypes = require("../constants/DialogTypes");
var dialogScheme = require("../stores/schemes/dialogScheme");

var DialogActions = {
  showDialog: function (data) {
    var dialog = Util.extendObject(dialogScheme, data,
      {id: Symbol("dialogId")});

    AppDispatcher.dispatchNext({
      actionType: DialogEvents.SHOW_DIALOG,
      dialog: dialog
    });

    return dialog.id;
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

  dismissLatest: function () {
    AppDispatcher.dispatchNext({
      actionType: DialogEvents.DISMISS_LATEST
    });
  },

  alert: function (...data) {
    if (Util.isObject(data[0])) {
      return this.showDialog(Object.assign(data[0],
        {type: DialogTypes.ALERT}));
    }

    let [message, actionButtonLabel = "OK"] = data;

    return this.showDialog({
      actionButtonLabel: actionButtonLabel,
      message: message,
      type: DialogTypes.ALERT
    });
  },

  confirm: function (...data) {
    if (Util.isObject(data[0])) {
      return this.showDialog(Object.assign(data[0],
        {type: DialogTypes.CONFIRM}));
    }

    let [message, actionButtonLabel = "OK"] = data;

    return this.showDialog({
      actionButtonLabel: actionButtonLabel,
      message: message,
      type: DialogTypes.CONFIRM
    });
  },

  prompt: function (...data) {
    if (Util.isObject(data[0])) {
      return this.showDialog(Object.assign(data[0],
        {type: DialogTypes.PROMPT}));
    }

    let [message, defaultValue = "",
      inputProperties = {type: "text"}] = data;

    return this.showDialog({
      message: message,
      inputProperties: Object.assign(inputProperties,
        {defaultValue: defaultValue}),
      type: DialogTypes.PROMPT
    });
  }
};

module.exports = DialogActions;
