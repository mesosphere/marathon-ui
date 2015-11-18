import AppDispatcher from "../AppDispatcher";
import JSONPUtil from "../helpers/JSONPUtil";
import MesosEvents from "../events/MesosEvents";

var MesosActions = {
  requestState(id, url) {
    JSONPUtil.request(`${url}/state`).then(
      function (state) {
        AppDispatcher.dispatch({
          actionType: MesosEvents.REQUEST_STATE,
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
  requestFiles(id, url, filePath) {
    JSONPUtil.request(
      `${url}/files/browse?path=${encodeURIComponent(filePath)}`)
      .then(
        function (files) {
          AppDispatcher.dispatch({
            actionType: MesosEvents.REQUEST_FILES,
            data: {id: id, files: files}
          });
        },
        function (error) {
          AppDispatcher.dispatch({
            actionType: MesosEvents.REQUEST_FILES_ERROR,
            data: error
          });
        }
      );
  }
};

export default MesosActions;
