import {EventEmitter} from "events";

import AppDispatcher from "../AppDispatcher";
import QueueEvents from "../events/QueueEvents";
import queueScheme from "./schemes/queueScheme";

import Util from "../helpers/Util";

const storeData = {
  queue: [],
  currentStats: {}
};

function processQueue(queue = []) {
  return queue.map(function (entry) {
    return Util.extendObject(queueScheme, entry);
  });
}

var QueueStore = Util.extendObject(EventEmitter.prototype, {
  get queue() {
    return Util.deepCopy(storeData.queue);
  },

  get currentStats() {
    return Util.deepCopy(storeData.currentStats);
  },

  getDelayByAppId: function (appId) {
    var timeLeftSeconds = 0;

    var queueEntry = storeData.queue.find(function (entry) {
      return entry.app.id === appId && entry.delay != null;
    });

    if (queueEntry) {
      timeLeftSeconds = queueEntry.delay.timeLeftSeconds;
    }

    return timeLeftSeconds;
  }
});

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case QueueEvents.REQUEST:
      storeData.queue = processQueue(action.data.body.queue);
      QueueStore.emit(QueueEvents.CHANGE);
      break;
    case QueueEvents.REQUEST_ERROR:
      QueueStore.emit(
        QueueEvents.REQUEST_ERROR,
        action.data.body
      );
      break;
    case QueueEvents.RESET_DELAY:
      QueueStore.emit(
        QueueEvents.RESET_DELAY,
        action.appId
      );
      break;
    case QueueEvents.RESET_DELAY_ERROR:
      QueueStore.emit(
        QueueEvents.RESET_DELAY_ERROR,
        action.data.body,
        action.appId
      );
      break;
    case QueueEvents.OFFER_STATS:
      storeData.currentStats = action.data;
      QueueStore.emit(
        QueueEvents.OFFER_STATS,
        action.data
      );
      break;
    case QueueEvents.OFFER_STATS_ERROR:
      QueueStore.emit(
        QueueEvents.OFFER_STATS_ERROR,
        action.data.body
      );
      break;
  }
});

export default QueueStore;
