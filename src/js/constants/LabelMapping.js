var Util = require("../helpers/Util");

var AppStatus = require("../constants/AppStatus");

const LabelMapping = {
  statusNameMapping: {
    [AppStatus.RUNNING]: "Running",
    [AppStatus.DEPLOYING]: "Deploying",
    [AppStatus.SUSPENDED]: "Suspended",
    [AppStatus.DELAYED]: "Delayed",
    [AppStatus.WAITING]: "Waiting"
  }
};

module.exports = Util.deepFreeze(LabelMapping);
