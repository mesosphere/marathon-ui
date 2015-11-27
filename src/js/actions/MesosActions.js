var AppDispatcher = require("../AppDispatcher");
var JSONPUtil = require("../helpers/JSONPUtil");
var MesosEvents = require("../events/MesosEvents");

var MesosActions = {
  requestState: function (id, url) {
    JSONPUtil.request(`${url}/state`).then(
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
  requestFiles: function (id, host, filePath) {
    JSONPUtil.request(
      `${host}/files/browse?path=${encodeURIComponent(filePath)}`)
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
      actionType: MesosEvents.REQUEST_FILES,
      data: {agentId: agentId, taskId: taskId}
    });
  }
};

module.exports = MesosActions;
