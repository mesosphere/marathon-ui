import ajaxWrapper from "../helpers/ajaxWrapper";

import config from "../config/config";

import AppDispatcher from "../AppDispatcher";
import QueueEvents from "../events/QueueEvents";

var QueueActions = {
  requestQueue: function () {
    this.request({
      url: `${config.apiURL}v2/queue`
    })
      .success(function (queue) {
        AppDispatcher.dispatch({
          actionType: QueueEvents.REQUEST,
          data: queue
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: QueueEvents.REQUEST_ERROR,
          data: error
        });
      });
  },
  resetDelay: function (appId) {
    this.request({
      method: "DELETE",
      url: `${config.apiURL}v2/queue/${appId}/delay`
    })
      .success(function () {
        AppDispatcher.dispatch({
          actionType: QueueEvents.RESET_DELAY,
          appId: appId
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: QueueEvents.RESET_DELAY_ERROR,
          data: error,
          appId: appId
        });
      });
  },
  getOfferStats: function (appId) {
    this.request({
      url: `${config.apiURL}v2/queue/${appId}/stats`
    })
      .success(function (data) {
        AppDispatcher.dispatch({
          actionType: QueueEvents.OFFER_STATS,
          data: data.body
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: QueueEvents.OFFER_STATS_ERROR,
          data: error
        });
      });
  },
  request: ajaxWrapper
};

export default QueueActions;
