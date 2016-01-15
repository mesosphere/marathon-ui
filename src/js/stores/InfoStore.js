import {EventEmitter} from "events";
import lazy from "lazy.js";

import AppDispatcher from "../AppDispatcher";
import InfoEvents from "../events/InfoEvents";

var InfoStore = lazy(EventEmitter.prototype).extend({
  info: {}
}).value();

InfoStore.dispatchToken = AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case InfoEvents.REQUEST:
      InfoStore.info = action.data.body;
      InfoStore.emit(InfoEvents.CHANGE);
      break;
    case InfoEvents.REQUEST_ERROR:
      InfoStore.emit(InfoEvents.REQUEST_ERROR,
        action.data.body);
      break;
  }
});

export default InfoStore;
