var React = require("react/addons");

var AlertModalComponent = require("../components/modals/AlertModalComponent");
var ConfirmModalComponent = require("../components/modals/ConfirmModalComponent");
var PromptModalComponent = require("../components/modals/PromptModalComponent");

var DialogActions = require("../actions/DialogActions");
var DialogEvents = require("../events/DialogEvents");
var DialogStore = require("../stores/DialogStore");
var DialogTypes = require("../constants/DialogTypes");

var DialogsComponent = React.createClass({
  displayName: "DialogsComponent",

  getInitialState: function () {
    return {
      dialog: null,
      currentId: null
    };
  },

  componentWillMount: function () {
    DialogStore.on(DialogEvents.ALERT, this.onDialogAlert);
    DialogStore.on(DialogEvents.ALERT_CLOSE, this.onDialogClose);
    DialogStore.on(DialogEvents.CONFIRM, this.onDialogConfirm);
    DialogStore.on(DialogEvents.CONFIRM_CLOSE, this.onDialogClose);
    DialogStore.on(DialogEvents.CONFIRM_ACCEPT, this.onDialogClose);
    DialogStore.on(DialogEvents.PROMPT, this.onDialogPrompt);
    DialogStore.on(DialogEvents.PROMPT_CLOSE, this.onDialogClose);
    DialogStore.on(DialogEvents.PROMPT_ACCEPT, this.onDialogClose);
  },

  componentWillUnmount: function () {
    DialogStore.removeListener(DialogEvents.ALERT, this.onDialogAlert);
    DialogStore.removeListener(
      DialogEvents.ALERT_CLOSE,
      this.onDialogAlertClose
    );
    DialogStore.removeListener(DialogEvents.CONFIRM, this.onDialogConfirm);
    DialogStore.removeListener(DialogEvents.CONFIRM_CLOSE, this.onDialogClose);
    DialogStore.removeListener(DialogEvents.CONFIRM_ACCEPT, this.onDialogClose);
    DialogStore.removeListener(DialogEvents.PROMPT, this.onDialogPrompt);
    DialogStore.removeListener(DialogEvents.PROMPT_CLOSE, this.onDialogClose);
    DialogStore.removeListener(DialogEvents.PROMPT_ACCEPT, this.onDialogClose);
  },

  onDialogAlert: function (message, dialogId) {
    this.setState({
      dialog: {
        type: DialogTypes.ALERT,
        message: message
      },
      currentId: dialogId
    });
  },

  onDialogConfirm: function (message, dialogId) {
    this.setState({
      dialog: {
        type: DialogTypes.CONFIRM,
        message: message
      },
      currentId: dialogId
    });
  },

  onDialogPrompt: function (message, defaultValue, dialogId) {
    this.setState({
      dialog: {
        type: DialogTypes.PROMPT,
        message: message,
        defaultValue: defaultValue
      },
      currentId: dialogId
    });
  },

  onDialogClose: function (dialogId) {
    if (dialogId !== this.state.currentId) {
      return null;
    }
    this.setState({
      dialog: null,
      currentId: null
    });
  },

  handleAlertClose: function () {
    DialogActions.alertClose(this.state.currentId);
  },

  handleConfirmClose: function () {
    DialogActions.confirmClose(this.state.currentId);
  },

  handleConfirmAccept: function () {
    DialogActions.confirmAccept(this.state.currentId);
  },

  handlePromptClose: function () {
    DialogActions.promptClose(this.state.currentId);
  },

  handlePromptAccept: function (value) {
    DialogActions.promptAccept(this.state.currentId, value);
  },

  getDialog: function () {
    var dialog = this.state.dialog;

    if (dialog == null) {
      return null;
    }

    switch (dialog.type) {
      case DialogTypes.ALERT:
        return (
          <AlertModalComponent message={dialog.message}
            onDestroy={this.handleAlertClose} />
        );
      case DialogTypes.CONFIRM:
        return (
          <ConfirmModalComponent message={dialog.message}
            onConfirm={this.handleConfirmAccept}
            onDestroy={this.handleConfirmClose} />
        );
      case DialogTypes.PROMPT:
        return (
          <PromptModalComponent message={dialog.message}
            defaultValue={dialog.defaultValue}
            onConfirm={this.handlePromptAccept}
            onDestroy={this.handlePromptClose} />
        );
      default:
        return null;
    }
  },

  render: function () {
    return this.getDialog();
  }
});

module.exports = DialogsComponent;
