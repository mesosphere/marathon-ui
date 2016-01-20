import ajaxWrapper from "../helpers/ajaxWrapper";

import config from "../config/config";

import AppDispatcher from "../AppDispatcher";
import InfoEvents from "../events/InfoEvents";

var InfoActions = {
  requestInfo: function () {
    this.request({
      url: `${config.apiURL}v2/info`
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
  request: ajaxWrapper
};

export default InfoActions;
