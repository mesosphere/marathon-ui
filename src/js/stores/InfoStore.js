import {EventEmitter} from "events";

import AppDispatcher from "../AppDispatcher";
import InfoEvents from "../events/InfoEvents";

import Util from "../helpers/Util";

const storeData = {
  info: {}
};

var InfoStore = Util.extendObject(EventEmitter.prototype, {
  get info() {
    return Util.deepCopy(storeData.info);
  }
});

InfoStore.dispatchToken = AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case InfoEvents.REQUEST:
      storeData.info = action.data.body;
      InfoStore.emit(InfoEvents.CHANGE);
      break;
    case InfoEvents.REQUEST_ERROR:
      InfoStore.emit(InfoEvents.REQUEST_ERROR,
        action.data.body);
      break;
  }
});

export default InfoStore;
