var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var AppsEvents = require("../events/AppsEvents");
var AppStatus = require("../constants/AppStatus");
var TasksEvents = require("../events/TasksEvents");

var appScheme = {
  deployments: [],
  healthChecks: [],
  instances: 0,
  status: AppStatus.SUSPENDED,
  tasks: [],
  tasksRunning: 0
};

function removeApp(apps, appId) {
  return lazy(apps).reject({
    id: appId
  }).value();
}

function removeTask(tasks, relatedAppId, taskId) {
  return lazy(tasks).reject(function (task) {
    return task.id === taskId && task.appId === relatedAppId;
  }).value();
}

function processCurrentApp(app) {
  app = lazy(appScheme).extend(app).value();

  app.status = AppStatus.RUNNING;
  if (app.deployments.length > 0) {
    app.status = AppStatus.DEPLOYING;
  } else if (app.instances === 0 && app.tasksRunning === 0) {
    app.status = AppStatus.SUSPENDED;
  }

  return app;
}

function processApps(apps) {
  return lazy(apps).map(function (app) {
    return processCurrentApp(app);
  }).value();
}

var AppsStore = lazy(EventEmitter.prototype).extend({
  // Array of apps objects recieved from the "apps/"-endpoint
  apps: [],
  // Object of the current app recieved from the "apps/[appid]"-endpoint
  currentApp: appScheme,

  getCurrentApp: function (appId) {
    if (appId === this.currentApp.id) {
      return this.currentApp;
    }
    return appScheme;
  }
}).value();

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case AppsEvents.REQUEST_APPS:
      AppsStore.apps = processApps(action.data.body.apps);
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.REQUEST_APPS_ERROR:
      AppsStore.emit(AppsEvents.REQUEST_APPS_ERROR, action.data.body);
      break;
    case AppsEvents.REQUEST_APP:
      AppsStore.currentApp = processCurrentApp(action.data.body.app);
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.REQUEST_APP_ERROR:
      AppsStore.emit(AppsEvents.REQUEST_APP_ERROR, action.data.body);
      break;
    case AppsEvents.CREATE_APP:
      AppsStore.apps.push(action.data.body);
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.CREATE_APP_ERROR:
      AppsStore.emit(AppsEvents.CREATE_APP_ERROR, action.data.body);
      break;
    case AppsEvents.DELETE_APP:
      AppsStore.apps =
        removeApp(AppsStore.apps, action.appId);
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.DELETE_APP_ERROR:
      AppsStore.emit(AppsEvents.DELETE_APP_ERROR, action.data.body);
      break;
    case AppsEvents.RESTART_APP:
      AppsStore.emit(AppsEvents.RESTART_APP);
      break;
    case AppsEvents.RESTART_APP_ERROR:
      AppsStore.emit(AppsEvents.RESTART_APP_ERROR, action.data.body);
      break;
    case AppsEvents.SCALE_APP:
      AppsStore.emit(AppsEvents.SCALE_APP);
      break;
    case AppsEvents.SCALE_APP_ERROR:
      AppsStore.emit(AppsEvents.SCALE_APP_ERROR, action.data.body);
      break;
    case AppsEvents.APPLY_APP:
      AppsStore.emit(AppsEvents.APPLY_APP);
      break;
    case AppsEvents.APPLY_APP_ERROR:
      AppsStore.emit(AppsEvents.APPLY_APP_ERROR, action.data.body);
      break;
    case TasksEvents.DELETE:
      AppsStore.currentApp.tasks =
        removeTask(
          AppsStore.currentApp.tasks,
          action.appId,
          action.taskId
        );
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case TasksEvents.DELETE_ERROR:
      AppsStore.emit(TasksEvents.DELETE_ERROR, action.data.body);
      break;
  }
});

module.exports = AppsStore;
