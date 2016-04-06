import Util from "../../helpers/Util";
import HealthCheckProtocols from "../../constants/HealthCheckProtocols";
import HealthCheckPortTypes from "../../constants/HealthCheckPortTypes";
import ValidConstraints from "../../constants/ValidConstraints";

function isValidPort(value) {
  if (value == null || Util.isStringAndEmpty(value)) {
    return true;
  }
  if (!Util.isStringAndEmpty(value) && !/^[0-9]+$/.test(value.toString())) {
    return false;
  }
  var port = parseInt(value, 10);
  return (port >= 0 && port <= 65535);
}

function isValidPath(value) {
  if (value == null || Util.isStringAndEmpty(value)) {
    return true;
  }
  return value.match(/ /g) == null;
}

const AppFormValidators = {
  appIdNotEmpty: (str) => !Util.isStringAndEmpty(str),

  appIdNoWhitespaces: (str) => str.match(/ /g) == null,

  appIdValidChars: (str) => str.match(/[^a-z0-9\-\.\/]/g) == null,

  appIdWellFormedPath: (str) => {
    // This RegExp is taken from the ID field explanation described here:
    // https://mesosphere.github.io/marathon/docs/rest-api.html#post-v2-apps
    var idMatchRegExp = "^(([a-z0-9]|[a-z0-9][a-z0-9\-]*" +
      "[a-z0-9])\.)*([a-z0-9]|[a-z0-9][a-z0-9\-]*[a-z0-9])$";

    return str.split("/").every((pathSegement) => {
      return Util.isStringAndEmpty(pathSegement) ||
        pathSegement === "." ||
        pathSegement === ".." ||
        !!pathSegement.match(idMatchRegExp);
    });
  },

  containerVolumesContainerPathIsValid: (obj) => isValidPath(obj.containerPath),

  containerVolumesHostPathIsValid: (obj) => isValidPath(obj.hostPath),

  containerVolumesModeNotEmpty: (obj) => !Util.isStringAndEmpty(obj.mode),

  containerVolumesIsNotEmpty: (obj) =>
    (!Util.isStringAndEmpty(obj.containerPath) &&
    !Util.isStringAndEmpty(obj.hostPath)) ||
    obj.mode == null,

  constraints: (constraints) => Util.isStringAndEmpty(constraints) ||
    constraints
      .split(",")
      .map((constraint) => constraint.split(":").map((value) => value.trim()))
      .every((p) => {
        if (p.length < 2 || p.length > 3) {
          return false;
        }
        return ValidConstraints.indexOf(p[1].toLowerCase()) !== -1;
      }),

  cpus: (value) => !Util.isStringAndEmpty(value) &&
    !!value.toString().match(/^[0-9\.]+$/) && parseFloat(value) >= 0.01,

  disk: (value) => !Util.isStringAndEmpty(value) &&
    !!value.toString().match(/^[0-9\.]+$/),

  dockerImageNoWhitespaces: (str) => str.match(/ /g) == null,

  dockerParameters: (obj) => obj.hasOwnProperty("key") &&
    obj.hasOwnProperty("value") &&
    !(Util.isStringAndEmpty(obj.key) &&
    !Util.isStringAndEmpty(obj.value)),

  env: (obj) => obj.hasOwnProperty("key") &&
    obj.hasOwnProperty("value") &&
    !(Util.isStringAndEmpty(obj.key) &&
    !Util.isStringAndEmpty(obj.value)),

  executor: (str) => Util.isString(str) &&
    (new RegExp("^(|\\/\\/cmd|\\/?[^\\/]+(\\/[^\\/]+)*)$"))
      .test(str),

  healthChecksProtocol: (obj) => {
    return !!Object.values(HealthCheckProtocols).find((protocol) => {
      return protocol === obj.protocol;
    });
  },

  healthChecksCommandNotEmpty: (obj) => {
    return obj.protocol !== HealthCheckProtocols.COMMAND ||
      !Util.isStringAndEmpty(obj.command);
  },

  healthChecksPathNotEmpty: (obj) => {
    return obj.protocol !== HealthCheckProtocols.HTTP ||
      !Util.isStringAndEmpty(obj.path);
  },

  healthChecksPortIndex: (obj) => {
    return obj.protocol !== HealthCheckProtocols.HTTP &&
      obj.protocol !== HealthCheckProtocols.TCP ||
      obj.portType !== HealthCheckPortTypes.PORT_INDEX ||
      !!obj.portIndex.toString().match(/^[0-9]+$/);
  },

  healthChecksPort: (obj) => {
    return obj.protocol !== HealthCheckProtocols.HTTP &&
      obj.protocol !== HealthCheckProtocols.TCP ||
      obj.portType !== HealthCheckPortTypes.PORT_NUMBER ||
      isValidPort(obj.port);
  },

  healthChecksGracePeriod: (obj) => {
    return obj.gracePeriodSeconds != null &&
      !!obj.gracePeriodSeconds.toString().match(/^[0-9]+$/);
  },

  healthChecksInterval: (obj) => {
    return obj.intervalSeconds != null &&
      !!obj.intervalSeconds.toString().match(/^[0-9]+$/);
  },

  healthChecksTimeout: (obj) => {
    return obj.timeoutSeconds != null &&
      !!obj.timeoutSeconds.toString().match(/^[0-9]+$/);
  },

  healthChecksMaxConsecutiveFailures: (obj) => {
    return obj.maxConsecutiveFailures != null &&
      !!obj.maxConsecutiveFailures.toString().match(/^[0-9]+$/);
  },

  instances: (value) => !Util.isStringAndEmpty(value) &&
    !!value.toString().match(/^[0-9]+$/),

  labels: (obj) => obj.hasOwnProperty("key") &&
    obj.hasOwnProperty("value") &&
    !(Util.isStringAndEmpty(obj.key) &&
    !Util.isStringAndEmpty(obj.value)),

  mem: (value) => !Util.isStringAndEmpty(value) &&
    !!value.toString().match(/^[0-9\.]+$/) && parseInt(value) >= 32,

  ports: (ports) => Util.isStringAndEmpty(ports) ||
    ports.split(",")
      .every((port) => port.toString().trim().match(/^[0-9]+$/)),

  localVolumesSize: (obj) =>
    Util.isStringAndEmpty(obj.persistentSize) ||
    !!obj.persistentSize.toString().match(/^[0-9\.]+$/),

  localVolumesPath: (obj) => isValidPath(obj.containerPath) &&
    !obj.containerPath.match(/\//),

  localVolumesIsNotEmpty: (obj) =>
    (!Util.isStringAndEmpty(obj.persistentSize) &&
    !Util.isStringAndEmpty(obj.containerPath)) ||
    (Util.isStringAndEmpty(obj.persistentSize) &&
    Util.isStringAndEmpty(obj.containerPath)),

  networkVolumesName: (obj) => Util.isStringAndEmpty(obj.networkName) ||
    !!obj.networkName.toString().match(/^[a-zA-Z\.]+$/),
  networkVolumesPath: (obj) => isValidPath(obj.containerPath) &&
    !obj.containerPath.match(/\//),

  portDefinitionsPortIsValid: (obj) => {
    // TODO is this needed?
    if (obj.isRandomPort === false) {
      return obj.port != null && obj.port !== "" && isValidPort(obj.port);
    }
    return isValidPort(obj.port);
  },

  portDefinitionsProtocolValidType: (obj) =>
    obj.protocol == null ||
    Util.isStringAndEmpty(obj.protocol) ||
    (obj.protocol != null &&
      (obj.protocol === "tcp" || obj.protocol === "udp"))
};

export default Object.freeze(AppFormValidators);
