var Util = require("../helpers/Util");

const AppFormValidators = {
  appIdNotEmpty: (str) => !Util.isEmptyString(str),
  appIdNoWhitespaces: (str) => str.match(/ /g) == null,
  disk: (value) =>
    !Util.isEmptyString(value) && value.toString().match(/^[0-9\.]+$/),
  env: (obj) => !(Util.isEmptyString(obj.key) && !Util.isEmptyString(obj.value))
};

module.exports = AppFormValidators;
