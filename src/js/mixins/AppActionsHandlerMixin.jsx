var AppsActions = require("../actions/AppsActions");
var AppsEvents = require("../events/AppsEvents");
var AppsStore = require("../stores/AppsStore");
var DialogActions = require("../actions/DialogActions");
var DialogStore = require("../stores/DialogStore");
var DialogSeverity = require("../constants/DialogSeverity");
var GroupsActions = require("../actions/GroupsActions");
var GroupsEvents = require("../events/GroupsEvents");
var GroupsStore = require("../stores/GroupsStore");
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

  addScaleGroupListener: function () {
    GroupsStore.once(GroupsEvents.SCALE_ERROR,
      this.onScaleGroupError);
  },

  addRestartAppListener: function () {
    AppsStore.once(AppsEvents.RESTART_APP_ERROR,
      this.onRestartAppError);
  },

  addDeleteAppListener: function () {
    AppsStore.once(AppsEvents.DELETE_APP_ERROR,
      this.onDeleteAppError);
  },

  addDeleteGroupListener: function () {
    GroupsStore.once(GroupsEvents.DELETE_ERROR,
      this.onDeleteGroupError);
  },

  addResetDelayListener: function () {
    QueueStore.once(QueueEvents.RESET_DELAY,
      this.onResetDelaySuccess);
    QueueStore.once(QueueEvents.RESET_DELAY_ERROR,
      this.onResetDelayError);
  },

  handleDestroyApp: function (event) {
    event.preventDefault();

    var appId = this.props.model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Destroy Application",
      message: `Are you sure you want to destroy ${appId}. Please note this
        action is irreversible.`,
      severity: DialogSeverity.DANGER,
      title: "Destroy Application"
    });

    DialogStore.handleUserResponse(dialogId, () => {
      this.addDeleteAppListener();

      AppsActions.deleteApp(appId);
    });
  },

  handleDestroyGroup: function (event) {
    event.preventDefault();

    var groupId = this.props.model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Destroy Group",
      message: `Are you sure you want to destroy ${groupId} including all it's
        applications. Please note this action is irreversible.`,
      severity: DialogSeverity.DANGER,
      title: "Destroy Group"});

    DialogStore.handleUserResponse(dialogId, () => {
      this.addDeleteGroupListener();

      GroupsActions.deleteGroup(groupId);
    });
  },

  handleResetDelay: function () {
    this.addResetDelayListener();

    QueueActions.resetDelay(this.props.model.id);
  },

  handleRestartApp: function () {
    var appId = this.props.model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Restart Application",
      message: `Are you sure you want to restart ${appId}?`,
      title: "Restart Application"
    });

    DialogStore.handleUserResponse(dialogId, () => {
      this.addRestartAppListener();

      AppsActions.restartApp(appId);
    });
  },

  handleScaleApp: function () {
    var model = this.props.model;

    const dialogId = DialogActions.prompt({
      actionButtonLabel:"Scale Application",
      inputProperties: {
        defaultValue: model.instances.toString(),
        type: "number",
        min: "0"
      },
      message: "How many instances would you like to scale to?",
      title: "Scale Application"
    });

    DialogStore.handleUserResponse(dialogId, instancesString => {
      if (instancesString != null && instancesString !== "") {
        let instances = parseInt(instancesString, 10);

        this.addScaleAppListener();

        AppsActions.scaleApp(model.id, instances);
      }
    });
  },

  handleScaleGroup: function () {
    var model = this.props.model;

    if (model.instances < 1) {
      return;
    }

    const dialogId = DialogActions.prompt({
      actionButtonLabel:"Scale Group",
      inputProperties: {
        defaultValue: "1.0",
        type: "number",
        min: "0"
      },
      message: "By which factor would you like to scale all applications " +
        "within this group?",
      title: "Scale Group"
    });

    DialogStore.handleUserResponse(dialogId, scaleByString => {
      if (scaleByString != null && scaleByString !== "") {
        let scaleBy = parseFloat(scaleByString);

        this.addScaleGroupListener();

        GroupsActions.scaleGroup(model.id, scaleBy);
      }
    });
  },

  handleSuspendApp: function (event) {
    event.preventDefault();

    var model = this.props.model;

    if (model.instances < 1) {
      return;
    }

    let appId = model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Suspend Application",
      message: `Are you sure you want to suspend ${appId} by scaling to 0
      instances?`,
      title: "Suspend Application"
    });

    DialogStore.handleUserResponse(dialogId, () => {
      this.addScaleAppListener();

      AppsActions.scaleApp(appId, 0);
    });
  },

  handleSuspendGroup: function (event) {
    event.preventDefault();

    var model = this.props.model;

    if (model.instances < 1) {
      return;
    }

    let groupId = model.id;

    const dialogId = DialogActions.confirm({
      actionButtonLabel: "Suspend Group",
      message: `Are you sure you want to suspend all application within
        ${groupId} by scaling to 0 instances?`,
      title: "Suspend Group"
    });

    DialogStore.handleUserResponse(dialogId, () => {
      this.addScaleGroupListener();

      GroupsActions.scaleGroup(groupId, 0);
    });
  },

  onScaleAppError: function (errorMessage, statusCode, instances) {
    var appId = this.props.model.id;

    if (statusCode === 409) {
      const dialogId = DialogActions.confirm({
        actionButtonLabel: "Stop Current Deployment and Scale",
        message: `In order to scale ${appId} to a new number of instances, the
          current deployment will have to be forcefully stopped, and a new
          one started. Please be cautious, as this could result in unwanted
          states.`,
        severity: DialogSeverity.DANGER,
        title: "Error Scaling Application"
      });

      DialogStore.handleUserResponse(dialogId, () => {
        this.addScaleAppListener();

        AppsActions.scaleApp(appId, instances, true);
      });
    } else if (statusCode === 401) {
      DialogActions.alert({
        message: `Error scaling ${appId}: ${Messages.UNAUTHORIZED}`,
        severity: DialogSeverity.DANGER,
        title: "Error Scaling Application"
      });
    } else if (statusCode === 403) {
      DialogActions.alert({
        message: `Error scaling ${appId}: ${Messages.FORBIDDEN}`,
        severity: DialogSeverity.DANGER,
        title: "Error Scaling Application"
      });
    } else {
      DialogActions.alert({
        message: `Error scaling ${appId}:
          ${errorMessage.message || errorMessage}`,
        severity: DialogSeverity.DANGER,
        title: "Error Scaling Application"
      });
    }
  },

  onScaleGroupError: function (errorMessage, statusCode) {
    var groupId = this.props.model.id;

    if (statusCode === 401) {
      DialogActions.alert({
        message: `Error scaling ${groupId}: ${Messages.UNAUTHORIZED}`,
        severity: DialogSeverity.DANGER,
        title: "Error Scaling Group"
      });
    } else if (statusCode === 403) {
      DialogActions.alert({
        message: `Error scaling ${groupId}: ${Messages.FORBIDDEN}`,
        severity: DialogSeverity.DANGER,
        title: "Error Scaling Group"
      });
    } else {
      DialogActions.alert({
        message: `Error scaling ${groupId}:
          ${errorMessage.message || errorMessage}`,
        severity: DialogSeverity.DANGER,
        title: "Error Scaling Group"
      });
    }
  },

  onRestartAppError: function (errorMessage, statusCode) {
    var appId = this.props.model.id;

    if (statusCode === 409) {

      const dialogId = DialogActions.confirm({
        actionButtonLabel: "Stop Current Deployment and Restart",
        message: `In order to restart ${appId}, the current deployment will have
          to be forcefully stopped. Please be cautious, as this could result in
          unwanted states.`,
        severity: DialogSeverity.DANGER,
        title: "Error Restarting Application"
      });

      DialogStore.handleUserResponse(dialogId, () => {
        this.addRestartAppListener();

        AppsActions.restartApp(appId, true);
      });
    } else if (statusCode === 401) {
      DialogActions.alert({
        message: `Error restating ${appId}: ${Messages.UNAUTHORIZED}`,
        severity: DialogSeverity.DANGER,
        title: "Error Restarting Application"
      });
    } else if (statusCode === 403) {
      DialogActions.alert({
        message: `Error restating ${appId}: ${Messages.FORBIDDEN}`,
        severity: DialogSeverity.DANGER,
        title: "Error Restarting Application"
      });
    } else {
      DialogActions.alert({
        message: `Error restating ${appId}:
          ${errorMessage.message || errorMessage}`,
        severity: DialogSeverity.DANGER,
        title: "Error Restarting Application"
      });
    }
  },

  onDeleteAppError: function (errorMessage, statusCode) {
    var appId = this.props.model.id;

    if (statusCode === 401) {
      DialogActions.alert({
        message: `Error destroying ${appId}: ${Messages.UNAUTHORIZED}`,
        severity: DialogSeverity.DANGER,
        title: "Error Destroying Application"
      });
    } else if (statusCode === 403) {
      DialogActions.alert({
        message: `Error destroying ${appId}: ${Messages.FORBIDDEN}`,
        severity: DialogSeverity.DANGER,
        title: "Error Destroying Application"
      });
    } else {
      DialogActions.alert({
        message: `Error destroying ${appId}:
          ${errorMessage.message || errorMessage}`,
        severity: DialogSeverity.DANGER,
        title: "Error Destroying Application"
      });
    }
  },

  onDeleteGroupError: function (errorMessage, statusCode) {
    var groupId = this.props.model.id;

    if (statusCode === 401) {
      DialogActions.alert({
        message: `Error destroying ${groupId}: ${Messages.UNAUTHORIZED}`,
        severity: DialogSeverity.DANGER,
        title: "Error Destroying Group"
      });
    } else if (statusCode === 403) {
      DialogActions.alert({
        message: `Error destroying ${groupId}: ${Messages.FORBIDDEN}`,
        severity: DialogSeverity.DANGER,
        title: "Error Destroying Group"
      });
    } else {
      DialogActions.alert({
        message: `Error destroying ${groupId}:
          ${errorMessage.message || errorMessage}`,
        severity: DialogSeverity.DANGER,
        title: "Error Destroying Group"
      });
    }
  },

  onResetDelayError: function (errorMessage, statusCode) {
    var appId = this.props.model.id;

    if (statusCode === 401) {
      DialogActions.alert({
        message: `Error resetting ${appId} delay: ${Messages.UNAUTHORIZED}`,
        severity: DialogSeverity.DANGER,
        title: "Error Resetting Delay"
      });
    } else if (statusCode === 403) {
      DialogActions.alert({
        message: `Error resetting ${appId} delay: ${Messages.FORBIDDEN}`,
        severity: DialogSeverity.DANGER,
        title: "Error Resetting Delay"
      });
    } else {
      DialogActions.alert({
        message: `Error resetting ${appId} delay:
          ${errorMessage.message || errorMessage}`,
        severity: DialogSeverity.DANGER,
        title: "Error Resetting Delay"
      });
    }
  },

  onResetDelaySuccess: function () {
    var appId = this.props.model.id;

    DialogActions.alert({
      message: `Application Delay for ${appId} was reset successfully.`,
      title: "Reset Successful"
    });
  }
};

module.exports = AppActionsHandlerMixin;
