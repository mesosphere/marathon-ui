import {EventEmitter} from "events";

import AppDispatcher from "../AppDispatcher";
import MesosEvents from "../events/MesosEvents";

class MesosStore extends EventEmitter {
  // @todo: invalidate state and files data
  constructor() {
    super();
    this.state = {};
    this.files = {};
    AppDispatcher.register(this.handleActions.bind(this));
  }

  handleActions(action) {
    // @todo: save state machine specific
    switch (action.actionType) {
      case MesosEvents.REQUEST_STATE:
        this.state[action.data.id] = action.data.state;
        this.emit(MesosEvents.CHANGE);
        break;
      case MesosEvents.REQUEST_STATE_ERROR:
        MesosEvents.emit(MesosEvents.REQUEST_STATE_ERROR,
          action.data.body);
        break;
      case MesosEvents.REQUEST_FILES:
        this.files[action.data.id] = action.data.files;
        this.emit(MesosEvents.CHANGE);
        break;
      case MesosEvents.REQUEST_FILES_ERROR:
        MesosEvents.emit(MesosEvents.REQUEST_FILES_ERROR,
          action.data.body);
        break;
    }
  }

}

export default new MesosStore();

