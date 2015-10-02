var Util = require("../../helpers/Util");

var ContainerConstants = require("../../constants/ContainerConstants");
var HealthCheckProtocols = require("../../constants/HealthCheckProtocols");

const healthChecksRowScheme = require("../schemes/healthChecksRowScheme");

function hasOnlyEmptyValues(obj) {
  return obj == null || Util.isObject(obj) &&
    Object.values(obj)
    .every((element) => {
      return element == null ||
        element === false ||
        (Util.isArray(element) && element.length === 0) ||
        Util.isEmptyString(element);
    });
}

const AppFormModelPostProcess = {
  acceptedResourceRoles: (app) => {
    var acceptedResourceRoles = app.acceptedResourceRoles;

    if (acceptedResourceRoles != null &&
        Util.isArray(acceptedResourceRoles) &&
        acceptedResourceRoles.length === 0) {
      app.acceptedResourceRoles = ["*"];
    }
  },
  container: (app) => {
    var container = app.container;

    if (container == null) {
      return;
    }

    if (container.docker != null) {
      if (container.docker.network === ContainerConstants.NETWORK.HOST) {
        // If host networking is set, remove all port mappings.
        if (Util.isArray(container.docker.portMappings)) {
          container.docker.portMappings = [];
        }
      }
    }

    let isEmpty = (Util.isArray(container.volumes) &&
        container.volumes.length === 0 ||
        container.volumes == null) &&
      hasOnlyEmptyValues(container.docker);

    if (isEmpty) {
      app.container = null;
    } else {
      // Remove this hack, if there is a solution available.
      // https://github.com/mesosphere/marathon/issues/2147
      if (Util.isEmptyString(app.cmd)) {
        app.cmd = " ";
      }
    }
  },
  healthChecks: (app) => {
    var healthChecks = app.healthChecks;

    if (healthChecks == null || healthChecks.length !== 1) {
      return;
    }

    let hc = healthChecks[0];

    let isEmpty = hc.protocol === HealthCheckProtocols.HTTP &&
      hc.path == null || Util.isEmptyString(healthChecks.path) &&
      ["portIndex",
      "gracePeriodSeconds",
      "intervalSeconds",
      "timeoutSeconds",
      "maxConsecutiveFailures",
      "ignoreHttp1xx"]
        .every((key) => hc[key] === healthChecksRowScheme[key]);

    if (isEmpty) {
      app.healthChecks = [];
    }
  }
};

module.exports = Object.freeze(AppFormModelPostProcess);
