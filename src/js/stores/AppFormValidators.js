var Util = require("../helpers/Util");

const AppFormValidators = {
  appId: (str) => !Util.isEmptyString(str),
  env: (obj) => !(Util.isEmptyString(obj.key) && !Util.isEmptyString(obj.value))
};

module.exports = AppFormValidators;
