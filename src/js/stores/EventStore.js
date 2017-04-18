var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

import config from "../config/config";

import AppDispatcher from "../AppDispatcher";
import ServerEvents from "../events/ServerSideEvents";

var EventStore = lazy(EventEmitter.prototype).extend({
  events: [],
  source: new EventSource(`${config.apiURL}v2/events`)
}).value();

const events = [
  "api_post_event",
  "scheduler_registered_event",
  "scheduler_reregistered_event",
  "scheduler_disconnected_event",
  "subscribe_event",
  "unsubscribe_event",
  "event_stream_attached",
  "event_stream_detached",
  "add_health_check_event",
  "remove_health_check_event",
  "failed_health_check_event",
  "health_status_changed_event",
  "group_change_success",
  "group_change_failed",
  "deployment_success",
  "deployment_failed",
  "deployment_step_success",
  "deployment_step_failure",
  "app_terminated_event",
  "status_update_event",
  "framework_message_event"
];

function handleEvent(e) {
  var notification = JSON.parse(e.data);
  var id = (notification.taskId ||
            notification.appId ||
            notification.id ||
            notification.groupId ||
            notification.slaveId ||
            notification.frameworkId ||
            notification.master ||
            notification.clientIp ||
            notification.remoteAddress ||
            "");
  var keyId = notification.timestamp + notification.eventType + id;
  var event = {
    keyId: keyId,
    id: id,
    timestamp: notification.timestamp,
    eventType: notification.eventType
  };
  if (EventStore.events.length === 0 ||
      event.keyId !== EventStore.events[0].keyId) {
    EventStore.events = [event].concat(EventStore.events);
    EventStore.events = EventStore.events.slice(0, 100);
    EventStore.emit(ServerEvents.NEW_EVENT);
  }
}

AppDispatcher.register(function () {
  events.forEach(function (event) {
    EventStore.source.addEventListener(event, function (e) {
      handleEvent(e);
    });
  });
});

module.exports = EventStore;
