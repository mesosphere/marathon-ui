var Util = require("../../helpers/Util");
var DialogTypes = require("../../constants/DialogTypes");
var DialogSeverity = require("../../constants/DialogSeverity");

const dialogScheme = {
  actionButtonLabel: "OK",
  id: null,
  inputProperties: {
    defaultValue:"",
    type: "text"
  },
  message: "",
  severity: DialogSeverity.INFO,
  title: "",
  type: DialogTypes.ALERT
};

module.exports = Util.deepFreeze(dialogScheme);
