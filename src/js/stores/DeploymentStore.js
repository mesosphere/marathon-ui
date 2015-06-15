var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var DeploymentEvents = require("../events/DeploymentEvents");

function processDeployments(deployments) {
  return lazy(deployments).map(function (deployment) {
    if (deployment.affectedApps == null) {
      deployment.affectedApps = [];
    }
    if (deployment.currentActions == null) {
      deployment.currentActions = [];
    }

    deployment.affectedAppsString = deployment.affectedApps.join(", ");
    deployment.currentActionsString = deployment.currentActions.join(", ");

    return deployment;
  }).value();
}

function removeDeployment(deployments, deploymentId) {
  return lazy(deployments).reject({
    id: deploymentId
  }).value();
}

var DeploymentStore = lazy(EventEmitter.prototype).extend({
  deployments: []
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case DeploymentEvents.REQUEST:
      DeploymentStore.deployments = processDeployments(action.data);
      DeploymentStore.emit(DeploymentEvents.CHANGE);
      break;
    case DeploymentEvents.REQUEST_ERROR:
      DeploymentStore.emit(DeploymentEvents.REQUEST_ERROR,
        action.data.jsonBody);
      break;
    case DeploymentEvents.REVERT:
      DeploymentStore.deployments =
        removeDeployment(DeploymentStore.deployments, action.deploymentId);
      DeploymentStore.emit(DeploymentEvents.CHANGE);
      break;
    case DeploymentEvents.REVERT_ERROR:
      DeploymentStore.emit(DeploymentEvents.REVERT_ERROR, action.data.jsonBody);
      break;
    case DeploymentEvents.STOP:
      DeploymentStore.deployments =
        removeDeployment(DeploymentStore.deployments, action.deploymentId);
      DeploymentStore.emit(DeploymentEvents.CHANGE);
      break;
    case DeploymentEvents.STOP_ERROR:
      DeploymentStore.emit(DeploymentEvents.STOP_ERROR, action.data.jsonBody);
      break;
  }
});

module.exports = DeploymentStore;
