var Util = require("../../helpers/Util");
var ValidConstraints = require("../../constants/ValidConstraints");

function isValidPort(value) {
  if (value == null || Util.isEmptyString(value)) {
    return true;
  }
  if (!Util.isEmptyString(value) && !/^[0-9]+$/.test(value.toString())) {
    return false;
  }
  var port = parseInt(value, 10);
  return (port >= 0 && port <= 65535);
}

function isValidPath(value) {
  if (value == null || Util.isEmptyString(value)) {
    return true;
  }
  return value.match(/ /g) == null;
}

const AppFormValidators = {
  appIdNotEmpty: (str) => !Util.isEmptyString(str),

  appIdNoWhitespaces: (str) => str.match(/ /g) == null,

  appIdValidChars: (str) => str.match(/[^a-z0-9\-_\.\/]/g) == null,

  appIdWellFormedPath: (str) => {
    return !!str.match(/[a-z0-9\-_]\.+[a-z0-9\-_]/g) ||
      !str.match(/[^\/\.]\.|\.[^\/\.]|\.{3,}/g);
  },

  containerVolumesContainerPathIsValid: (obj) => isValidPath(obj.containerPath),

  containerVolumesHostPathIsValid: (obj) => isValidPath(obj.hostPath),

  containerVolumesModeNotEmpty: (obj) => !Util.isEmptyString(obj.mode),

  constraints: (constraints) => Util.isEmptyString(constraints) ||
    constraints
      .split(",")
      .map((constraint) => constraint.split(":").map((value) => value.trim()))
      .every((p) => {
        if (p.length < 2 || p.length > 3) {
          return false;
        }
        return ValidConstraints.indexOf(p[1].toLowerCase()) !== -1;
      }),

  cpus: (value) => !Util.isEmptyString(value) &&
    !!value.toString().match(/^[0-9\.]+$/),

  disk: (value) => !Util.isEmptyString(value) &&
    !!value.toString().match(/^[0-9\.]+$/),

  dockerImageNoWhitespaces: (str) => str.match(/ /g) == null,

  dockerParameters: (obj) => obj.hasOwnProperty("key") &&
    obj.hasOwnProperty("value") &&
    !(Util.isEmptyString(obj.key) &&
    !Util.isEmptyString(obj.value)),

  dockerPortMappingsContainerPortIsValid: (obj) =>
    isValidPort(obj.containerPort),

  dockerPortMappingsHostPortIsValid: (obj) => isValidPort(obj.hostPort),

  dockerPortMappingsServicePortIsValid: (obj) => isValidPort(obj.servicePort),

  dockerPortMappingsProtocolValidType: (obj) =>
    obj.protocol == null ||
    Util.isEmptyString(obj.protocol) ||
    (obj.protocol != null &&
      (obj.protocol === "tcp" || obj.protocol === "udp")),

  env: (obj) => obj.hasOwnProperty("key") &&
    obj.hasOwnProperty("value") &&
    !(Util.isEmptyString(obj.key) &&
    !Util.isEmptyString(obj.value)),

  executor: (str) => Util.isString(str) &&
    (new RegExp("^(|\\/\\/cmd|\\/?[^\\/]+(\\/[^\\/]+)*)$"))
      .test(str),

  instances: (value) => !Util.isEmptyString(value) &&
    !!value.toString().match(/^[0-9]+$/),

  mem: (value) => !Util.isEmptyString(value) &&
    !!value.toString().match(/^[0-9\.]+$/),

  ports: (ports) => Util.isEmptyString(ports) ||
    ports.split(",")
      .every((port) => port.toString().trim().match(/^[0-9]+$/))
};

module.exports = AppFormValidators;
