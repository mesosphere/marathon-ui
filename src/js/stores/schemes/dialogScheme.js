var Util = require("../../helpers/Util");
var DialogTypes = require("../../constants/DialogTypes");
var DialogStates = require("../../constants/DialogStates");

const dialogScheme = {
  actionButtonLabel: "OK",
  id: null,
  inputProperties: {
    defaultValue:"",
    type: "text"
  },
  message: "",
  state: DialogStates.INFO,
  title: "",
  type: DialogTypes.ALERT
};

module.exports = Util.deepFreeze(dialogScheme);
