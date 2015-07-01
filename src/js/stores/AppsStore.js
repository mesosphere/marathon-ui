var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var AppsEvents = require("../events/AppsEvents");
var AppStatus = require("../constants/AppStatus");
var HealthStatus = require("../constants/HealthStatus");
var TasksEvents = require("../events/TasksEvents");
var TaskStatus = require("../constants/TaskStatus");

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

function getTaskHealth(task) {
  var nullResult = true;
  var health = false;
  var healthCheckResults = task.healthCheckResults;
  if (healthCheckResults != null) {
    health = lazy(healthCheckResults).every(function (hcr) {
      if (hcr.firstSuccess) {
        nullResult = false;
        return hcr.alive;
      } else { // might be null
        return false;
      }
    });
  }
  if (!health && nullResult) { // health check has not returned yet
    return HealthStatus.UNKNOWN;
  } else {
    return health ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;
  }
}

function setTaskStatus(task) {
  if (task.startedAt != null) {
    task.status = TaskStatus.STARTED;
    task.updatedAt = task.startedAt;
  } else if (task.stagedAt != null) {
    task.status = TaskStatus.STAGED;
    task.updatedAt = task.stagedAt;
  }
  return task;
}

function processApp(app) {
  app = lazy(appScheme).extend(app).value();

  app.status = AppStatus.RUNNING;
  if (app.deployments.length > 0) {
    app.status = AppStatus.DEPLOYING;
  } else if (app.instances === 0 && app.tasksRunning === 0) {
    app.status = AppStatus.SUSPENDED;
  }

  app.tasks = lazy(app.tasks).map(function (task) {
    task.healthStatus = getTaskHealth(task);
    task = setTaskStatus(task);
    return task;
  }).value();

  return app;
}

function processApps(apps) {
  return lazy(apps).map(function (app) {
    return processApp(app);
  }).value();
}

var AppsStore = lazy(EventEmitter.prototype).extend({
  // Array of apps objects recieved from the "apps/"-endpoint
  apps: [],
  // Object of the current app recieved from the "apps/[appid]"-endpoint
  // This endpoint delievers more data, like the tasks on the app.
  currentApp: appScheme,

  getCurrentApp: function (appId) {
    if (appId === this.currentApp.id) {
      return this.currentApp;
    }

    var shallowApp = lazy(this.apps).findWhere({id: appId});
    if (shallowApp) {
      return shallowApp;
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
      AppsStore.currentApp = processApp(action.data.body.app);
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
