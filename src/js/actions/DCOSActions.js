var AppDispatcher = require("../AppDispatcher");
var ajaxWrapper = require("../helpers/ajaxWrapper");
var DCOSEvents = require("../events/DCOSEvents");

var DCOSActions = {
  requestBuildInformation: function (host) {
    this.request({url: `${host || ""}/pkgpanda/active.buildinfo.full.json`})
      .success(function (data) {
        AppDispatcher.dispatch({
          actionType: DCOSEvents.REQUEST_BUILD_INFORMATION_COMPLETE,
          data: data.body
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: DCOSEvents.REQUEST_BUILD_INFORMATION_ERROR,
          data: error
        });
      });
  },
  request: ajaxWrapper
};

module.exports = DCOSActions;
