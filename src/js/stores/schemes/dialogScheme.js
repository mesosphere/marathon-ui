var Util = require("../../helpers/Util");
var DialogTypes = require("../../constants/DialogTypes");

const dialogScheme = {
  actionButtonLabel: "OK",
  id: null,
  inputProperties: {
    defaultValue:"",
    type: "text"
  },
  message: "",
  title: "",
  type: DialogTypes.ALERT
};

module.exports = Util.deepFreeze(dialogScheme);
