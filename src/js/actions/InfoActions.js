var oboeWrapper = require("../helpers/oboeWrapper");

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
    .error(function (error) {
      AppDispatcher.dispatch({
        actionType: InfoEvents.REQUEST_ERROR,
        data: error
      });
    });
  },
  request: oboeWrapper
};

module.exports = InfoActions;
