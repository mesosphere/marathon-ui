import AppDispatcher from "../AppDispatcher";
import AppsFiltersEvents from "../events/AppsFiltersEvents";

var AppsFiltersActions = {
  setFilters: function (filters) {
    AppDispatcher.dispatch({
      actionType: AppsFiltersEvents.ADD_FILTER,
      data: filters
    });
    // this.request({
    //   url: `${config.apiURL}v2/info`
    // })
    //   .success(function (info) {
    //     AppDispatcher.dispatch({
    //       actionType: AppsFiltersEvents.REQUEST,
    //       data: info
    //     });
    //   })
    //   .error(function (error) {
    //     AppDispatcher.dispatch({
    //       actionType: AppsFiltersEvents.REQUEST_ERROR,
    //       data: error
    //     });
    //   });
  }
};

export default AppsFiltersActions;
