var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var DeploymentEvents = require("../events/DeploymentEvents");

function processDeployments (deployments) {
  return lazy(deployments).map(function (deployment) {
    deployment.affectedAppsString = deployment.affectedApps.join(", ");
    deployment.currentActionsString = deployment.currentActions.join(", ");
    return deployment;
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
      DeploymentStore.emit(DeploymentEvents.REQUEST_ERROR);
      break;
    case DeploymentEvents.REVERT:
      DeploymentStore.deployments.push(action.data);
      DeploymentStore.emit(DeploymentEvents.CHANGE);
      break;
    case DeploymentEvents.REVERT_ERROR:
      DeploymentStore.emit(DeploymentEvents.REVERT_ERROR);
      break;
    case DeploymentEvents.STOP:
      DeploymentStore.deployments = lazy(DeploymentStore.deployments).reject({
        deploymentId: action.deploymentId
      }).value();
      DeploymentStore.emit(DeploymentEvents.CHANGE);
      break;
    case DeploymentEvents.STOP_ERROR:
      DeploymentStore.emit(DeploymentEvents.STOP_ERROR);
      break;
  }
});

module.exports = DeploymentStore;
