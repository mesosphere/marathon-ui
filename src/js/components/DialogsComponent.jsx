var React = require("react/addons");

var AlertDialogComponent = require("../components/AlertDialogComponent");
var ConfirmDialogComponent =
  require("../components/ConfirmDialoglComponent");
var PromptDialogComponent = require("../components/PromptDialogComponent");

var DialogActions = require("../actions/DialogActions");
var DialogEvents = require("../events/DialogEvents");
var DialogStore = require("../stores/DialogStore");
var DialogTypes = require("../constants/DialogTypes");

var DialogsComponent = React.createClass({
  displayName: "DialogsComponent",

  getInitialState: function () {
    return {
      dialogData: null
    };
  },

  componentWillMount: function () {
    DialogStore.on(DialogEvents.SHOW_DIALOG, this.onDialogShow);
    DialogStore.on(DialogEvents.ACCEPT_DIALOG, this.onDialogClose);
    DialogStore.on(DialogEvents.DISMISS_DIALOG, this.onDialogClose);
  },

  componentWillUnmount: function () {
    DialogStore.removeListener(DialogEvents.SHOW_DIALOG, this.onDialogShow);
    DialogStore.removeListener(DialogEvents.ACCEPT_DIALOG, this.onDialogClose);
    DialogStore.removeListener(DialogEvents.DISMISS_DIALOG, this.onDialogClose);
  },

  onDialogShow: function (dialogData) {
    this.setState({
      dialogData: dialogData
    });
  },

  onDialogClose: function (dialogData) {
    var currentDialogData = this.state.dialogData;

    if (dialogData == null || currentDialogData == null) {
      return;
    }

    if (currentDialogData.id !== dialogData.id) {
      return;
    }

    this.setState({
      dialogData: null
    });
  },

  handleAcceptDialog: function (value = null) {
    DialogActions.acceptDialog(this.state.dialogData, value);
  },

  handleDismissDialog: function () {
    DialogActions.dismissDialog(this.state.dialogData);
  },

  getDialog: function () {
    var dialogData = this.state.dialogData;

    if (dialogData == null) {
      return null;
    }

    switch (dialogData.type) {
      case DialogTypes.ALERT:
        return (
          <AlertDialogComponent data={dialogData}
              onAccept={this.handleAcceptDialog}
              onDismiss={this.handleDismissDialog} />
        );
      case DialogTypes.CONFIRM:
        return (
          <ConfirmDialogComponent data={dialogData}
              onAccept={this.handleAcceptDialog}
              onDismiss={this.handleDismissDialog}  />
        );
      case DialogTypes.PROMPT:
        return (
          <PromptDialogComponent data={dialogData}
              onAccept={this.handleAcceptDialog}
              onDismiss={this.handleDismissDialog}  />
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
