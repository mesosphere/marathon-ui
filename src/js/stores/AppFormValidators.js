var Util = require("../helpers/Util");
var ValidConstraints = require("../constants/ValidConstraints");

const AppFormValidators = {
  appIdNotEmpty: (str) => !Util.isEmptyString(str),
  appIdNoWhitespaces: (str) => str.match(/ /g) == null,
  cpus: (value) =>
    !Util.isEmptyString(value) && value.toString().match(/^[0-9\.]+$/),
  disk: (value) =>
    !Util.isEmptyString(value) && value.toString().match(/^[0-9\.]+$/),
  constraints: (constraints) => constraints
    .split(",")
    .map((constraint) => constraint.split(":").map((value) => value.trim()))
    .every((p) => {
      if (p.length < 2 || p.length > 3) {
        return false;
      }
      return ValidConstraints.indexOf(p[1].toLowerCase()) !== -1;
    }),
  env: (obj) =>
    !(Util.isEmptyString(obj.key) && !Util.isEmptyString(obj.value)),
  executor: (str) => Util.isString(str) &&
    (new RegExp("^(|\\/\\/cmd|\\/?[^\\/]+(\\/[^\\/]+)*)$"))
      .test(str),
  instances: (value) =>
    !Util.isEmptyString(value) && value.toString().match(/^[0-9]+$/),
  mem: (value) =>
    !Util.isEmptyString(value) && value.toString().match(/^[0-9\.]+$/),
  ports: (ports) => Util.isEmptyString(ports) ||
    ports.toString().match(/^[0-9, ]+$/)
};

module.exports = AppFormValidators;
