var Util = require("../helpers/Util");

const AppFormValidators = {
  appIdNotEmpty: (str) => !Util.isEmptyString(str),
  appIdNoWhitespaces: (str) => str.match(/ /g) == null,
  cpus: (value) =>
    !Util.isEmptyString(value) && value.toString().match(/^[0-9\.]+$/),
  disk: (value) =>
    !Util.isEmptyString(value) && value.toString().match(/^[0-9\.]+$/),
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
