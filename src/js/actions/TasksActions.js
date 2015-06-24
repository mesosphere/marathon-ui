var oboeWrapper = require("../helpers/oboeWrapper");

var config = require("../config/config");
var AppDispatcher = require("../AppDispatcher");
var TasksEvents = require("../events/TasksEvents");

var TasksActions = {
  deleteTask: function (appId, taskId) {
    this.request({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      url: config.apiURL + "v2/apps/" + appId + "/tasks/" + taskId
    })
    .success(function (task) {
      AppDispatcher.dispatch({
        actionType: TasksEvents.DELETE,
        data: task,
        appId: appId,
        taskId: taskId
      });
    })
    .error(function (error) {
      AppDispatcher.dispatch({
        actionType: TasksEvents.DELETE_ERROR,
        data: error
      });
    });
  },
  deleteTaskAndScale: function (appId, taskId) {
    this.request({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      url: config.apiURL + "v2/apps/" +
        appId + "/tasks/" +
        taskId + "?scale=true"
    })
    .success(function (task) {
      AppDispatcher.dispatch({
        actionType: TasksEvents.DELETE,
        data: task,
        appId: appId,
        taskId: taskId
      });
    })
    .error(function (error) {
      AppDispatcher.dispatch({
        actionType: TasksEvents.DELETE_ERROR,
        data: error
      });
    });
  },
  request: oboeWrapper
};

module.exports = TasksActions;
