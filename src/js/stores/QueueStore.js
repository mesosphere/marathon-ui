var EventEmitter = require("events").EventEmitter;

var AppDispatcher = require("../AppDispatcher");
var QueueEvents = require("../events/QueueEvents");
var queueScheme = require("./queueScheme");

var util = require("../helpers/util");

function processQueue(queue = []) {
  return queue.map(function (entry) {
    return util.extendObject(queueScheme, entry);
  });
}

var QueueStore = util.extendObject(EventEmitter.prototype, {
  queue: [],

  getDelayByAppId: function (appId) {
    var timeLeftSeconds = 0;

    var queueEntry = this.queue.find(function (entry) {
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
      QueueStore.queue = processQueue(action.data.body.queue);
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
  }
});

module.exports = QueueStore;
