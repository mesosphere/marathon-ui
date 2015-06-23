var OboeWrapper = require("../helpers/OboeWrapper");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var InfoEvents = require("../events/InfoEvents");

var InfoActions = {
  requestInfo: function () {
    this.request({
      url: config.apiURL + "v2/info"
    })
    .success(function (info) {
      AppDispatcher.dispatch({
        actionType: InfoEvents.REQUEST,
        data: info
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: InfoEvents.REQUEST_ERROR,
        data: error
      });
    });
  },
  request: OboeWrapper
};

module.exports = InfoActions;
