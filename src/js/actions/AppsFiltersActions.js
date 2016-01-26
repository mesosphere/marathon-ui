import AppDispatcher from "../AppDispatcher";
import AppsFiltersEvents from "../events/AppsFiltersEvents";

var AppsFiltersActions = {
  setFilters: function (filters) {
    AppDispatcher.dispatch({
      actionType: AppsFiltersEvents.ADD_FILTER,
      data: filters
    });
  }
};

export default AppsFiltersActions;
