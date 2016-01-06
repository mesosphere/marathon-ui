var AppsActions = require("../actions/AppsActions");
var DialogActions = require("../actions/DialogActions");
var DialogStore = require("../stores/DialogStore");
var QueueActions = require("../actions/QueueActions");

var AppActionsHandlerMixin = {
  componentWillMount: function () {
    if (this.props.model == null) {
      throw new Error(
        "The AppActionsHandlerMixin needs a defined model-property"
      );
    }
  },

  handleDestroyApp: function (event) {
    event.preventDefault();

    var appId = this.props.model.id;

    const dialogId =
      DialogActions.confirm(`Destroy app '${appId}'? This is irreversible.`,
        "Destroy");

    DialogStore.handleUserResponse(dialogId, () => {
      AppsActions.deleteApp(appId);
    });
  },

  handleResetDelay: function () {
    QueueActions.resetDelay(this.props.model.id);
  },

  handleRestartApp: function () {
    var appId = this.props.model.id;

    const dialogId =
      DialogActions.confirm(`Restart app '${appId}'?`, "Restart");

    DialogStore.handleUserResponse(dialogId, () => {
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
      AppsActions.scaleApp(model.id, 0);
    });
  },
};

module.exports = AppActionsHandlerMixin;
