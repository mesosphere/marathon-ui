var AppsActions = require("../actions/AppsActions");
var AppsEvents = require("../events/AppsEvents");
var AppsStore = require("../stores/AppsStore");
var DialogActions = require("../actions/DialogActions");
var DialogStore = require("../stores/DialogStore");
var Messages = require("../constants/Messages");
var QueueActions = require("../actions/QueueActions");
var QueueEvents = require("../events/QueueEvents");
var QueueStore = require("../stores/QueueStore");

var AppActionsHandlerMixin = {
  componentWillMount: function () {
    if (this.props.model == null) {
      throw new Error(
        "The AppActionsHandlerMixin needs a defined model-property"
      );
    }
  },

  addScaleAppListener: function () {
    AppsStore.once(AppsEvents.SCALE_APP_ERROR,
      this.onScaleAppError);
  },

  addRestartAppListener: function () {
    AppsStore.once(AppsEvents.RESTART_APP_ERROR,
      this.onRestartAppError);
  },

  addDeleteAppListener: function () {
    AppsStore.once(AppsEvents.DELETE_APP_ERROR,
      this.onDeleteAppError);
  },

  addResetDelayListener: function () {
    AppsStore.once(AppsEvents.RESET_DELAY,
      this.onResetDelaySuccess);
    AppsStore.once(AppsEvents.RESET_DELAY_ERROR,
      this.onResetDelayError);
  },

  handleDestroyApp: function (event) {
    event.preventDefault();

    var appId = this.props.model.id;

    const dialogId =
      DialogActions.confirm(`Destroy app '${appId}'? This is irreversible.`,
        "Destroy");

    DialogStore.handleUserResponse(dialogId, () => {
      this.addDeleteAppListener();

      AppsActions.deleteApp(appId);
    });
  },

  handleResetDelay: function () {
    this.addResetDelayListener();

    QueueActions.resetDelay(this.props.model.id);
  },

  handleRestartApp: function () {
    var appId = this.props.model.id;

    const dialogId =
      DialogActions.confirm(`Restart app '${appId}'?`, "Restart");

    DialogStore.handleUserResponse(dialogId, () => {
      this.addRestartAppListener();

      AppsActions.restartApp(appId);
    });
  },

  handleScaleApp: function () {
    var model = this.props.model;

    const dialogId =
      DialogActions.prompt("Scale to how many instances?",
          model.instances.toString(), {
            type: "number",
            min: "0"
          }
      );

    DialogStore.handleUserResponse(dialogId, instancesString => {
      if (instancesString != null && instancesString !== "") {
        let instances = parseInt(instancesString, 10);

        this.addScaleAppListener();

        AppsActions.scaleApp(model.id, instances);
      }
    });
  },

  handleSuspendApp: function (event) {
    event.preventDefault();

    var model = this.props.model;

    if (model.instances < 1) {
      return;
    }

    const dialogId =
      DialogActions.confirm("Suspend app by scaling to 0 instances?",
        "Suspend");

    DialogStore.handleUserResponse(dialogId, () => {
      this.addScaleAppListener();

      AppsActions.scaleApp(model.id, 0);
    });
  },

  onScaleAppError: function (errorMessage, statusCode, instances) {
    if (statusCode === 409) {
      let appId = this.props.model.id;

      const dialogId = DialogActions.
        confirm(`There is a deployment in progress that changes ${appId}.
          If you want to stop this deployment and force a new one to scale it,
          press the 'Scale forcefully' button.`, "Scale forcefully");

      DialogStore.handleUserResponse(dialogId, () => {
        this.addScaleAppListener();

        AppsActions.scaleApp(appId, instances, true);
      });
    } else if (statusCode === 401) {
      DialogActions.alert(`Not scaling: ${Messages.UNAUTHORIZED}`);
    } else if (statusCode === 403) {
      DialogActions.alert(`Not scaling: ${Messages.FORBIDDEN}`);
    } else {
      DialogActions.alert(`Not scaling:
          ${errorMessage.message || errorMessage}`);
    }
  },

  onRestartAppError: function (errorMessage, statusCode) {
    if (statusCode === 409) {
      let appId = this.props.model.id;

      const dialogId = DialogActions.
        confirm(`There is a deployment in progress that changes ${appId}.
          If you want to stop this deployment and force a restart,
          press the 'Restart forcefully' button.`, "Restart forcefully");

      DialogStore.handleUserResponse(dialogId, () => {
        this.addRestartAppListener();

        AppsActions.restartApp(appId, true);
      });
    } else if (statusCode === 401) {
      DialogActions.alert(`Error restarting app: ${Messages.UNAUTHORIZED}`);
    } else if (statusCode === 403) {
      DialogActions.alert(`Error restarting app: ${Messages.FORBIDDEN}`);
    } else {
      DialogActions.alert(
        `Error restarting app: ${errorMessage.message || errorMessage}`
      );
    }
  },

  onDeleteAppError: function (errorMessage, statusCode) {
    if (statusCode === 401) {
      DialogActions.alert(`Error destroying app: ${Messages.UNAUTHORIZED}`);
    } else if (statusCode === 403) {
      DialogActions.alert(`Error destroying app: ${Messages.FORBIDDEN}`);
    } else {
      DialogActions.alert(
        `Error destroying app: ${errorMessage.message || errorMessage}`
      );
    }
  },

  onResetDelayError: function (errorMessage, statusCode) {
    if (statusCode === 401) {
      DialogActions.alert(`Error resetting delay on app:
        ${Messages.UNAUTHORIZED}`);
    } else if (statusCode === 403) {
      DialogActions.alert(`Error resetting delay on app:
        ${Messages.FORBIDDEN}`);
    } else {
      DialogActions.alert(
        `Error resetting delay on app: ${errorMessage.message || errorMessage}`
      );
    }
  },

  onResetDelaySuccess: function () {
    DialogActions.alert("Delay reset succesfully");
  }
};

module.exports = AppActionsHandlerMixin;
