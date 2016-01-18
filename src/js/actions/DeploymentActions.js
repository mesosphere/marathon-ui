import ajaxWrapper from "../helpers/ajaxWrapper";

import config from "../config/config";
import AppDispatcher from "../AppDispatcher";
import DeploymentEvents from "../events/DeploymentEvents";

var DeploymentActions = {
  requestDeployments: function () {
    this.request({
      url: `${config.apiURL}v2/deployments`
    })
      .success(function (deployments) {
        AppDispatcher.dispatch({
          actionType: DeploymentEvents.REQUEST,
          data: deployments
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: DeploymentEvents.REQUEST_ERROR,
          data: error
        });
      });
  },
  revertDeployment: function (deploymentID) {
    this.request({
      method: "DELETE",
      url: `${config.apiURL}v2/deployments/${deploymentID}`
    })
      .success(function (deployment) {
        AppDispatcher.dispatch({
          actionType: DeploymentEvents.REVERT,
          data: deployment,
          deploymentId: deploymentID
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: DeploymentEvents.REVERT_ERROR,
          data: error
        });
      });
  },
  stopDeployment: function (deploymentID) {
    this.request({
      method: "DELETE",
      url: `${config.apiURL}v2/deployments/${deploymentID}?force=true`
    })
      .success(function (deployment) {
        AppDispatcher.dispatch({
          actionType: DeploymentEvents.STOP,
          data: deployment,
          deploymentId: deploymentID
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: DeploymentEvents.STOP_ERROR,
          data: error
        });
      });
  },
  request: ajaxWrapper
};

export default DeploymentActions;
