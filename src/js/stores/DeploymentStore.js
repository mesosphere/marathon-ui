import {EventEmitter} from "events";

import AppDispatcher from "../AppDispatcher";
import AppsStore from "../stores/AppsStore";
import AppsEvents from "../events/AppsEvents";
import DeploymentEvents from "../events/DeploymentEvents";
import deploymentScheme from "./schemes/deploymentScheme";

import Util from "../helpers/Util";

const storeData = {
  deployments: []
};

function processDeployments(deployments) {
  return deployments.map(function (deployment) {
    deployment = Util.extendObject(deploymentScheme, deployment);

    deployment.affectedAppsString = deployment.affectedApps.join(", ");
    deployment.currentActionsString = deployment.currentActions.join(", ");
    detectIsWaitingForUserAction(deployment);

    return deployment;
  });
}

function removeDeployment(deployments, deploymentId) {
  return deployments.filter(deployment => deployment.id !== deploymentId);
}

function detectIsWaitingForUserAction(deployment) {
  deployment.currentActions.forEach(action => {
    const results = action.readinessCheckResults;
    action.isWaitingForUserAction = false;

    // Detect if the migration API is supported by the app and at least
    // one migration phase is waiting for user decision
    if (results != null && results.length > 0) {
      action.isWaitingForUserAction = results.some(result => {
        if (result.lastResponse == null || result.lastResponse.body == null) {
          return false;
        }

        let status;

        try {
          status = JSON.parse(result.lastResponse.body).status;
        } catch (e) {
          return false;
        }

        if (status != null && status === "Waiting") {
          const app = AppsStore.getCurrentApp(action.app);
          return !!app.hasMigrationApiSupport;
        }

        return false;
      });
    }
  });
}

var DeploymentStore = Util.extendObject(EventEmitter.prototype, {
  get deployments() {
    return Util.deepCopy(storeData.deployments);
  }
});

AppsStore.on(AppsEvents.CHANGE, function () {
  storeData.deployments.forEach(deployment => {
    detectIsWaitingForUserAction(deployment);
  });

  DeploymentStore.emit(DeploymentEvents.CHANGE);
});

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case DeploymentEvents.REQUEST:
      storeData.deployments = processDeployments(action.data.body);
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
      storeData.deployments =
        removeDeployment(storeData.deployments, action.deploymentId);
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
      storeData.deployments =
        removeDeployment(storeData.deployments, action.deploymentId);
      DeploymentStore.emit(DeploymentEvents.CHANGE);
      break;
    case DeploymentEvents.STOP_ERROR:
      DeploymentStore.emit(
        DeploymentEvents.STOP_ERROR,
        action.data.body,
        action.data.status
      );
      break;
    case DeploymentEvents.CONTINUE_MIGRATION_SUCCESS:
      DeploymentStore.emit(DeploymentEvents.CONTINUE_MIGRATION_SUCCESS,
        action.data.body,
        action.appId
      );
      break;
    case DeploymentEvents.CONTINUE_MIGRATION_ERROR:
      DeploymentStore.emit(DeploymentEvents.CONTINUE_MIGRATION_ERROR,
        action.data.body,
        action.data.status,
        action.appId
      );
      break;
  }
});

export default DeploymentStore;
