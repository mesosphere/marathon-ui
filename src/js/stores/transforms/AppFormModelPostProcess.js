import Util from "../../helpers/Util";

import ContainerConstants from "../../constants/ContainerConstants";
import HealthCheckProtocols from "../../constants/HealthCheckProtocols";
import HealthCheckPortTypes from "../../constants/HealthCheckPortTypes";

import healthChecksRowScheme from "../schemes/healthChecksRowScheme";

function hasOnlyEmptyValues(obj) {
  return obj == null || Util.isObject(obj) &&
    Object.values(obj)
    .every((element) => {
      return element == null ||
        element === false ||
        (Util.isArray(element) && element.length === 0) ||
        Util.isStringAndEmpty(element);
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

    if ((container.docker == null || container.docker.image == null ||
        container.docker.image === "") &&
        container.volumes != null) {
      delete container.docker;
      container.volumes = container.volumes.filter(row => {
        return row.hostPath == null;
      });
    }

    container.type = container.docker != null
      ? ContainerConstants.TYPE.DOCKER
      : ContainerConstants.TYPE.MESOS;

    if (container.type === ContainerConstants.TYPE.DOCKER &&
        container.docker.network === ContainerConstants.NETWORK.BRIDGE) {
      container.docker.portMappings =
        app.portDefinitions.map(portDefinition => {
          var definition = Object.assign({}, portDefinition);
          definition.containerPort = definition.port;
          delete definition.port;
          if (definition.hostPort == null) {
            definition.hostPort = 0;
          }
          return definition;
        });
    }

    let isEmpty = (Util.isArray(container.volumes) &&
        container.volumes.length === 0 ||
        container.volumes == null) &&
      hasOnlyEmptyValues(container.docker);

    if (isEmpty) {
      app.container = null;
    } else {
      // sending null unsets any pre-existing command in the API
      if (Util.isStringAndEmpty(app.cmd)) {
        app.cmd = null;
      }
    }
  },
  fetch: (app) => {
    delete app.fetch;
  },
  healthChecks: (app) => {
    var healthChecks = app.healthChecks;

    if (healthChecks == null || healthChecks.length !== 1) {
      return;
    }

    let hc = healthChecks[0];

    let isEmpty = hc.protocol === HealthCheckProtocols.HTTP &&
      hc.path == null || Util.isStringAndEmpty(healthChecks.path) &&
      ["portIndex",
      "port",
      "gracePeriodSeconds",
      "intervalSeconds",
      "timeoutSeconds",
      "maxConsecutiveFailures",
      "ignoreHttp1xx"]
        .every((key) => hc[key] === healthChecksRowScheme[key]);

    if (hc.portType === HealthCheckPortTypes.PORT_INDEX) {
      delete hc.port;
    } else if (hc.portType === HealthCheckPortTypes.PORT_NUMBER) {
      delete hc.portIndex;
    }
    delete hc.portType;

    if (isEmpty) {
      app.healthChecks = [];
    }
  }
};

export default Object.freeze(AppFormModelPostProcess);
