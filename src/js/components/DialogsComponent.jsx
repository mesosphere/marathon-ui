var React = require("react/addons");

var AlertModalComponent = require("../components/modals/AlertModalComponent");

var DialogActions = require("../actions/DialogActions");
var DialogEvents = require("../events/DialogEvents");
var DialogStore = require("../stores/DialogStore");

var DialogsComponent = React.createClass({
  displayName: "DialogsComponent",

  getInitialState: function () {
    return {
      alert: null,
      currentId: null
    };
  },

  componentWillMount: function () {
    DialogStore.on(DialogEvents.ALERT, this.onDialogAlert);
    DialogStore.on(DialogEvents.ALERT_CLOSE, this.onDialogAlertClose);
  },

  componentWillUnmount: function () {
    DialogStore.removeListener(DialogEvents.ALERT, this.onDialogAlert);
    DialogStore.removeListener(
      DialogEvents.ALERT_CLOSE,
      this.onDialogAlertClose
    );
  },

  onDialogAlert: function (message, dialogId) {
    this.setState({
      alert: message,
      currentId: dialogId
    });
  },

  onDialogAlertClose: function (dialogId) {
    if (dialogId !== this.state.currentId) {
      return null;
    }
    this.setState({
      alert: null,
      currentId: null
    });
  },

  handleAlertClose: function () {
    DialogActions.alertClose(this.state.currentId);
  },

  getAlertDialog: function () {
    var alert = this.state.alert;

    if (alert == null) {
      return null;
    }

    return (
      <AlertModalComponent message={alert}
        onDestroy={this.handleAlertClose} />
    );
  },

  render: function () {
    return this.getAlertDialog();
  }
});

module.exports = DialogsComponent;
