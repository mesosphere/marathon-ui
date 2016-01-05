var React = require("react/addons");

var AlertModalComponent = require("../components/modals/AlertModalComponent");
var ConfirmModalComponent =
  require("../components/modals/ConfirmModalComponent");
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
    DialogStore.on(DialogEvents.ALERT_SHOW, this.onDialogAlertShow);
    DialogStore.on(DialogEvents.ALERT_DISMISS, this.onDialogClose);
    DialogStore.on(DialogEvents.CONFIRM_SHOW, this.onDialogConfirmShow);
    DialogStore.on(DialogEvents.CONFIRM_DISMISS, this.onDialogClose);
    DialogStore.on(DialogEvents.CONFIRM_ACCEPT, this.onDialogClose);
    DialogStore.on(DialogEvents.PROMPT_SHOW, this.onDialogPromptShow);
    DialogStore.on(DialogEvents.PROMPT_DISMISS, this.onDialogClose);
    DialogStore.on(DialogEvents.PROMPT_ACCEPT, this.onDialogClose);
  },

  componentWillUnmount: function () {
    DialogStore.removeListener(DialogEvents.ALERT_SHOW, this.onDialogAlertShow);
    DialogStore.removeListener(
      DialogEvents.ALERT_DISMISS,
      this.onDialogAlertClose
    );
    DialogStore.removeListener(
      DialogEvents.CONFIRM_SHOW,
      this.onDialogConfirmShow
    );
    DialogStore.removeListener(
      DialogEvents.CONFIRM_DISMISS,
      this.onDialogClose
    );
    DialogStore.removeListener(DialogEvents.CONFIRM_ACCEPT, this.onDialogClose);
    DialogStore.removeListener(
      DialogEvents.PROMPT_SHOW,
      this.onDialogPromptShow
    );
    DialogStore.removeListener(DialogEvents.PROMPT_DISMISS, this.onDialogClose);
    DialogStore.removeListener(DialogEvents.PROMPT_ACCEPT, this.onDialogClose);
  },

  onDialogAlertShow: function (message, dialogId) {
    this.setState({
      dialog: {
        type: DialogTypes.ALERT,
        message: message
      },
      currentId: dialogId
    });
  },

  onDialogConfirmShow: function (message, dialogId, successButtonLabel) {
    this.setState({
      dialog: {
        type: DialogTypes.CONFIRM,
        message: message,
        successButtonLabel: successButtonLabel
      },
      currentId: dialogId
    });
  },

  onDialogPromptShow: function (message, defaultValue, dialogId, inputProps) {
    this.setState({
      dialog: {
        type: DialogTypes.PROMPT,
        message: message,
        defaultValue: defaultValue,
        inputProps: inputProps
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

  handleAlertDismiss: function () {
    DialogActions.alertDismiss(this.state.currentId);
  },

  handleConfirmDismiss: function () {
    DialogActions.confirmDismiss(this.state.currentId);
  },

  handleConfirmAccept: function () {
    DialogActions.confirmAccept(this.state.currentId);
  },

  handlePromptDismiss: function () {
    DialogActions.promptDismiss(this.state.currentId);
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
            onDestroy={this.handleAlertDismiss} />
        );
      case DialogTypes.CONFIRM:
        return (
          <ConfirmModalComponent message={dialog.message}
            onConfirm={this.handleConfirmAccept}
            onDestroy={this.handleConfirmDismiss}
            successButtonLabel={dialog.successButtonLabel} />
        );
      case DialogTypes.PROMPT:
        return (
          <PromptModalComponent message={dialog.message}
            defaultValue={dialog.defaultValue}
            inputProps={dialog.inputProps}
            onConfirm={this.handlePromptAccept}
            onDestroy={this.handlePromptDismiss} />
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
