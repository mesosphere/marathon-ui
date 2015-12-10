var ajaxWrapper = require("../helpers/ajaxWrapper");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var TasksEvents = require("../events/TasksEvents");

var TasksActions = {
  deleteTasks: function (appId, taskIds = []) {
    this.request({
      method: "POST",
      data: {
        "ids": taskIds
      },
      url: `${config.apiURL}v2/tasks/delete`
    })
      .success(function () {
        AppDispatcher.dispatch({
          actionType: TasksEvents.DELETE,
          appId: appId,
          taskIds: taskIds
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: TasksEvents.DELETE_ERROR,
          data: error
        });
      });
  },
  deleteTasksAndScale: function (appId, taskIds = [], force = false) {
    var url = `${config.apiURL}v2/tasks/delete?scale=true`;
    if (force) {
      url = url + "&force=true";
    }
    this.request({
      method: "POST",
      data: {
        "ids": taskIds
      },
      url: url
    })
      .success(function () {
        AppDispatcher.dispatch({
          actionType: TasksEvents.DELETE,
          appId: appId,
          taskIds: taskIds
        });
      })
      .error(function (error) {
        AppDispatcher.dispatch({
          actionType: TasksEvents.DELETE_ERROR,
          data: error,
          taskIds: taskIds
        });
      });
  },
  request: ajaxWrapper
};

module.exports = TasksActions;
