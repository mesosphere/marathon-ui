var oboe = require("oboe");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var AppsEvents = require("../events/AppsEvents");

var AppsActions = {
  requestApps: function () {
    this.request({
      url: config.apiURL + "v2/apps"
    })
    .done(function (apps) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.REQUEST_APPS,
        data: apps
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: AppsEvents.REQUEST_APPS_ERROR,
        data: error
      });
    });
  },
  request: oboe
};

module.exports = AppsActions;
