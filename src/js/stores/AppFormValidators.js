var Util = require("../helpers/Util");

const AppFormValidators = {
  appIdNotEmpty: (str) => !Util.isEmptyString(str),
  appIdNoWhitespaces: (str) => str.match(/ /g) == null,
  env: (obj) =>
    !(Util.isEmptyString(obj.key) && !Util.isEmptyString(obj.value)),
  mem: (value) => value != null && value.toString().match(/^[0-9]+$/)
};

module.exports = AppFormValidators;
