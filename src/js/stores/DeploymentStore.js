var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var DeploymentEvents = require("../events/DeploymentEvents");
var deploymentScheme = require("./schemes/deploymentScheme");

function processDeployments(deployments) {
  return lazy(deployments).map(function (deployment) {
    deployment = lazy(deploymentScheme).extend(deployment).value();

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
      DeploymentStore.deployments = processDeployments(action.data.body);
      DeploymentStore.emit(DeploymentEvents.CHANGE);
      break;
    case DeploymentEvents.REQUEST_ERROR:
      DeploymentStore.emit(
        DeploymentEvents.REQUEST_ERROR,
        action.data.body,
        action.data.status
      );
      break;
    case DeploymentEvents.REVERT:
      DeploymentStore.deployments =
        removeDeployment(DeploymentStore.deployments, action.deploymentId);
      DeploymentStore.emit(DeploymentEvents.CHANGE);
      break;
    case DeploymentEvents.REVERT_ERROR:
      DeploymentStore.emit(
        DeploymentEvents.REVERT_ERROR,
        action.data.body,
        action.data.status
      );
      break;
    case DeploymentEvents.STOP:
      DeploymentStore.deployments =
        removeDeployment(DeploymentStore.deployments, action.deploymentId);
      DeploymentStore.emit(DeploymentEvents.CHANGE);
      break;
    case DeploymentEvents.STOP_ERROR:
      DeploymentStore.emit(
        DeploymentEvents.STOP_ERROR,
        action.data.body,
        action.data.status
      );
      break;
  }
});

module.exports = DeploymentStore;
