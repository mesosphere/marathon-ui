import {EventEmitter} from "events";
import lazy from "lazy.js";

import AppDispatcher from "../AppDispatcher";
import AppsFiltersEvents from "../events/AppsFiltersEvents";

var AppsFiltersStore = lazy(EventEmitter.prototype).extend({
  filters: {}
}).value();

AppsFiltersStore.dispatchToken = AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case AppsFiltersEvents.ADD_FILTER:

      AppsFiltersStore.filters = Object.assign({},
        AppsFiltersStore.filters,
        action.data
      );

      AppsFiltersStore.emit(AppsFiltersEvents.CHANGE);
      break;
  }
});

export default AppsFiltersStore;
