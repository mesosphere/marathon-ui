var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");
var request = require("../helpers/qajaxWrapper");

var config = require("../config/config");
var util = require("../helpers/util");

var AppsStore = require("../stores/AppsStore");
var ChaosEvents = require("../events/ChaosEvents");

function requestApp(appId, onSuccess, onError) {
  request({
    url: `${config.apiURL}v2/apps/${appId}`
  })
  .success(function (data) {
    onSuccess(data.body.app);
  })
  .error(function () {
    onError();
  });
}

function deleteTasks(taskIds = [], onSuccess = util.noop) {
  request({
    method: "POST",
    data: {
      ids: taskIds
    },
    headers: {
      "Content-Type": "application/json"
    },
    url: `${config.apiURL}v2/tasks/delete`
  })
  .success(function () {
    onSuccess();
  })
  .error(function () {
    onSuccess();
  });
}

var ChaosActions = lazy(EventEmitter.prototype).extend({
  makeChaos: function (amountPercentage = 10) {
    ChaosActions.emit(ChaosEvents.STARTED);

    var apps = lazy(AppsStore.apps)
      .filter(function (app) {
        return app.tasksRunning > 1;
      })
      .shuffle();

    var iterator = apps.getIterator();

    var totalTasksToKill = lazy([]);

    var iterateOverAppsAndMakeChaos = function () {
      var hasNext = iterator.moveNext();

      if (!hasNext) {
        let tasksToKill = totalTasksToKill.value();

        let onTaskDeletion = function () {
          ChaosActions.emit(ChaosEvents.FINISHED);
        };

        if (tasksToKill.length > 0) {
          deleteTasks(
            tasksToKill,
            onTaskDeletion
          );
        } else {
          onTaskDeletion();
        }

        return;
      }

      var currentApp = iterator.current();

      var onAppRequest = function (app) {
        totalTasksToKill = totalTasksToKill.concat(
          lazy(app.tasks)
            .shuffle()
            .take(parseInt(app.tasksRunning * amountPercentage / 100, 10))
            .map(function (task) {
              return task.id;
            })
        );

        iterateOverAppsAndMakeChaos();
      };

      requestApp(
          currentApp.id,
          onAppRequest,
          iterateOverAppsAndMakeChaos
        );
    };

    iterateOverAppsAndMakeChaos();
  }
}).value();

module.exports = ChaosActions;
