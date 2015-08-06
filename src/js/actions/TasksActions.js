var qajaxWrapper = require("../helpers/qajaxWrapper");

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
      headers: {
        "Content-Type": "application/json"
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
  deleteTasksAndScale: function (appId, taskIds = []) {
    this.request({
      method: "POST",
      data: {
        "ids": taskIds
      },
      headers: {
        "Content-Type": "application/json"
      },
      url: `${config.apiURL}v2/tasks/delete?scale=true`
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
  request: qajaxWrapper
};

module.exports = TasksActions;
