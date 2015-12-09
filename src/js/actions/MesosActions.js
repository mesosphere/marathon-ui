var semver = require("semver");

var AppDispatcher = require("../AppDispatcher");
var JSONPUtil = require("../helpers/JSONPUtil");
var MesosEvents = require("../events/MesosEvents");

var MesosActions = {
  requestVersionInformation: function (host) {
    this.request(`${host}/version`).then(
      function (data) {
        AppDispatcher.dispatch({
          actionType: MesosEvents.REQUEST_VERSION_INFORMATION_COMPLETE,
          data: data
        });
      },
      function (error) {
        AppDispatcher.dispatch({
          actionType: MesosEvents.REQUEST_VERSION_INFORMATION_ERROR,
          data: error
        });
      }
    );
  },
  requestState: function (id, host, mesosVersion) {
    var route = "/state.json";
    if (semver.valid(mesosVersion) &&
        semver.satisfies(mesosVersion,">=0.26.0")) {
      route = "/state";
    }

    this.request(`${host}${route}`).then(
      function (state) {
        AppDispatcher.dispatch({
          actionType: MesosEvents.REQUEST_STATE_COMPLETE,
          data: {id: id, state: state}
        });
      },
      function (error) {
        AppDispatcher.dispatch({
          actionType: MesosEvents.REQUEST_STATE_ERROR,
          data: error
        });
      }
    );
  },
  requestFiles: function (id, host, filePath, mesosVersion) {
    var route = "/files/browse.json";
    if (semver.valid(mesosVersion) &&
        semver.satisfies(mesosVersion,">=0.26.0")) {
      route = "/files/browse";
    }

    this.request(
      `${host}${route}?path=${encodeURIComponent(filePath)}`)
      .then(
        function (files) {
          AppDispatcher.dispatch({
            actionType: MesosEvents.REQUEST_FILES_COMPLETE,
            data: {id: id, host: host, files: files}
          });
        },
        function (error) {
          AppDispatcher.dispatch({
            actionType: MesosEvents.REQUEST_FILES_ERROR,
            data: error
          });
        }
      );
  },
  requestTaskFiles: function (agentId, taskId) {
    AppDispatcher.dispatch({
      actionType: MesosEvents.REQUEST_TASK_FILES,
      data: {agentId: agentId, taskId: taskId}
    });
  },
  request: JSONPUtil.request
};

module.exports = MesosActions;
