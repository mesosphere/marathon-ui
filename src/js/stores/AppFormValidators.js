var Util = require("../helpers/Util");

const AppFormValidators = {
  appIdNotEmpty: (str) => !Util.isEmptyString(str),
  appIdNoWhitespaces: (str) => str.match(/ /g) == null,
  cpus: (value) => value != null && value.toString().match(/^[0-9\.]+$/),
  env: (obj) => !(Util.isEmptyString(obj.key) && !Util.isEmptyString(obj.value))
};

module.exports = AppFormValidators;
