var Util = require("../../helpers/Util");
var HealthCheckProtocols = require("../../constants/HealthCheckProtocols");
var HealthCheckPortTypes = require("../../constants/HealthCheckPortTypes");
var ValidConstraints = require("../../constants/ValidConstraints");

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

  appIdValidChars: (str) => str.match(/[^a-z0-9\-_\.\/]/g) == null,

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
    !!value.toString().match(/^[0-9\.]+$/),

  disk: (value) => !Util.isStringAndEmpty(value) &&
    !!value.toString().match(/^[0-9\.]+$/),

  dockerImageNoWhitespaces: (str) => str.match(/ /g) == null,

  dockerParameters: (obj) => obj.hasOwnProperty("key") &&
    obj.hasOwnProperty("value") &&
    !(Util.isStringAndEmpty(obj.key) &&
    !Util.isStringAndEmpty(obj.value)),

  dockerPortMappingsContainerPortIsValid: (obj) =>
    isValidPort(obj.containerPort),

  dockerPortMappingsHostPortIsValid: (obj) => isValidPort(obj.hostPort),

  dockerPortMappingsServicePortIsValid: (obj) => isValidPort(obj.servicePort),

  dockerPortMappingsProtocolValidType: (obj) =>
    obj.protocol == null ||
    Util.isStringAndEmpty(obj.protocol) ||
    (obj.protocol != null &&
      (obj.protocol === "tcp" || obj.protocol === "udp")),

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
    return !!obj.gracePeriodSeconds.toString().match(/^[0-9]+$/);
  },

  healthChecksInterval: (obj) => {
    return !!obj.intervalSeconds.toString().match(/^[0-9]+$/);
  },

  healthChecksTimeout: (obj) => {
    return !!obj.timeoutSeconds.toString().match(/^[0-9]+$/);
  },

  healthChecksMaxConsecutiveFailures: (obj) => {
    return !!obj.maxConsecutiveFailures.toString().match(/^[0-9]+$/);
  },

  instances: (value) => !Util.isStringAndEmpty(value) &&
    !!value.toString().match(/^[0-9]+$/),

  labels: (obj) => obj.hasOwnProperty("key") &&
    obj.hasOwnProperty("value") &&
    !(Util.isStringAndEmpty(obj.key) &&
    !Util.isStringAndEmpty(obj.value)),

  mem: (value) => !Util.isStringAndEmpty(value) &&
    !!value.toString().match(/^[0-9\.]+$/),

  ports: (ports) => Util.isStringAndEmpty(ports) ||
    ports.split(",")
      .every((port) => port.toString().trim().match(/^[0-9]+$/))
};

module.exports = Object.freeze(AppFormValidators);
