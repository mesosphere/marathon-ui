var oboe = require("oboe");

var config = require("../config/config");
var AppDispatcher = require('../AppDispatcher');
var DeploymentEvents = require("../events/DeploymentEvents");

var DeploymentActions = {
  requestDeployments: function () {
    this.request({
      url: config.apiURL + "v2/deployments"
    }).done(function (deployments) {
      AppDispatcher.dispatch({
        actionType: DeploymentEvents.REQUEST,
        data: deployments
      });
    }).fail(function (error) {
      AppDispatcher.dispatch({
        actionType: DeploymentEvents.REQUEST_ERROR,
        data: error
      });
    });
  },
  request: oboe
};

module.exports = DeploymentActions;
