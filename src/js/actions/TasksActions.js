var oboe = require("oboe");

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
    .start(function (status) {
      this.status = status;
    })
    .done(function (task) {
      if (this.status !== 200) {
        return;
      }
      AppDispatcher.dispatch({
        actionType: TasksEvents.DELETE,
        data: task,
        appId: appId,
        taskId: taskId
      });
    })
    .fail(function (error) {
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
    .start(function (status) {
      this.status = status;
    })
    .done(function (task) {
      if (this.status !== 200) {
        return;
      }
      AppDispatcher.dispatch({
        actionType: TasksEvents.DELETE,
        data: task,
        appId: appId,
        taskId: taskId
      });
    })
    .fail(function (error) {
      AppDispatcher.dispatch({
        actionType: TasksEvents.DELETE_ERROR,
        data: error
      });
    });
  },
  request: oboe
};

module.exports = TasksActions;
