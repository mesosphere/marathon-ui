var EventEmitter = require("events").EventEmitter;
var lazy = require("lazy.js");

var AppDispatcher = require("../AppDispatcher");
var AppsEvents = require("../events/AppsEvents");
var appScheme = require("../stores/schemes/appScheme");
var AppTypes = require("../constants/AppTypes");
var ContainerConstants = require("../constants/ContainerConstants");
var AppStatus = require("../constants/AppStatus");
var HealthStatus = require("../constants/HealthStatus");
var TasksEvents = require("../events/TasksEvents");
var TaskStatus = require("../constants/TaskStatus");
var QueueStore = require("./QueueStore");
var QueueEvents = require("../events/QueueEvents");

const healthWeights = Object.freeze({
  [HealthStatus.UNHEALTHY]: 32,
  [HealthStatus.OVERCAPACITY]: 16,
  [HealthStatus.STAGED]: 8,
  [HealthStatus.HEALTHY]: 4,
  [HealthStatus.UNKNOWN]: 2,
  [HealthStatus.UNSCHEDULED]: 1
});

function removeApp(apps, appId) {
  return lazy(apps).reject({
    id: appId
  }).value();
}

function removeTasks(tasks, relatedAppId, taskIds) {
  return lazy(tasks).reject(function (task) {
    return (taskIds.indexOf(task.id) > -1) && task.appId === relatedAppId;
  }).value();
}

function getTaskHealth(task) {
  var healthCheckResults = task.healthCheckResults;

  if (healthCheckResults != null && healthCheckResults.length > 0) {
    let isHealthy = healthCheckResults.every(function (hcr) {
      if (hcr.firstSuccess) {
        return hcr.alive;
      }

      return false;
    });

    return isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;
  } else {
    return HealthStatus.UNKNOWN;
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
}

function getAppHealth(app) {
  var tasksWithUnknownHealth = Math.max(
    (app.tasksRunning || 0) -
    (app.tasksHealthy || 0) -
    (app.tasksUnhealthy || 0),
    0
  );

  var healthData = [
    {quantity: app.tasksHealthy || 0, state: HealthStatus.HEALTHY},
    {quantity: app.tasksUnhealthy || 0, state: HealthStatus.UNHEALTHY},
    {quantity: tasksWithUnknownHealth, state: HealthStatus.UNKNOWN},
    {quantity: app.tasksStaged || 0, state: HealthStatus.STAGED}
  ];

  var tasksSum = 0;
  for (let i = 0; i < healthData.length; i++) {
    let capacityLeft = Math.max(0, app.instances - tasksSum);
    tasksSum += healthData[i].quantity;
  }

  var overCapacity = Math.max(0, tasksSum - app.instances);
  healthData.push({quantity: overCapacity, state: HealthStatus.OVERCAPACITY});

  var unscheduled = Math.max(0, (app.instances - tasksSum));
  healthData.push({
    quantity: unscheduled,
    state: HealthStatus.UNSCHEDULED
  });

  return healthData;
}

function getAppHealthWeight(health) {
  return health.reduce(function (totalWeight, entry) {
    if (entry.quantity) {
      return totalWeight + healthWeights[entry.state];
    }
    return totalWeight;
  }, 0);
}

function getAppType(app) {
  if (app.container != null &&
      app.container.type === ContainerConstants.TYPE.DOCKER) {
    return AppTypes.DOCKER;
  }
  return AppTypes.CGROUP;
}

function calculateTotalResources(app) {
  app.totalMem = app.mem * app.instances;
  app.totalCpus = parseFloat((app.cpus * app.instances).toPrecision(4));
  return app;
}

function processApp(app) {
  app = lazy(appScheme).extend(app).value();
  app = calculateTotalResources(app);

  app.status = AppStatus.RUNNING;
  if (app.deployments.length > 0) {
    app.status = AppStatus.DEPLOYING;
  } else if (app.instances === 0 && app.tasksRunning === 0) {
    app.status = AppStatus.SUSPENDED;
  }
  app.type = getAppType(app);
  app.health = getAppHealth(app);
  app.healthWeight = getAppHealthWeight(app.health);

  app.tasks = lazy(app.tasks).map(function (task) {
    task.id =  task.id || task.taskId;
    task.healthStatus = getTaskHealth(task);
    setTaskStatus(task);
    return task;
  }).value();

  return app;
}

function processApps(apps) {
  return lazy(apps).map(function (app) {
    return processApp(app);
  }).value();
}

function applyAppDelayStatus(app, queue) {
  var hasChanges = false;

  var queueEntry = lazy(queue).find(function (entry) {
    return entry.app != null && app.id === entry.app.id && entry.delay != null;
  });

  if (queueEntry) {
    let status;

    if (queueEntry.delay.overdue === false
        && queueEntry.delay.timeLeftSeconds > 0) {
      status = AppStatus.DELAYED;
    } else if (queueEntry.delay.overdue === true) {
      status = AppStatus.WAITING;
    }

    if (status) {
      if (app.status !== status) {
        hasChanges = true;
      }
      app.status = status;
    }
  }

  return hasChanges;
}

function applyAppDelayStatusOnAllApps(apps, queue) {
  var hasChanges = false;
  apps.forEach(function (app) {
    hasChanges = applyAppDelayStatus(app, queue) || hasChanges;
  });
  return hasChanges;
}

var AppsStore = lazy(EventEmitter.prototype).extend({
  // Array of apps objects recieved from the "apps/"-endpoint
  apps: [],
  // Object of the current app recieved from the "apps/[appId]"-endpoint
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
  },

  getTask: function (appId, taskId) {
    return lazy(this.getCurrentApp(appId).tasks).findWhere({"id": taskId});
  }
}).value();

QueueStore.on(QueueEvents.CHANGE, function () {
  var change = applyAppDelayStatusOnAllApps(AppsStore.apps, QueueStore.queue);
  if (change) {
    AppsStore.emit(AppsEvents.CHANGE);
  }
});

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case AppsEvents.REQUEST_APPS:
      AppsStore.apps = processApps(action.data.body.apps);
      applyAppDelayStatusOnAllApps(AppsStore.apps, QueueStore.queue);
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.REQUEST_APPS_ERROR:
      AppsStore.emit(
        AppsEvents.REQUEST_APPS_ERROR,
        action.data.body,
        action.data.status
      );
      break;
    case AppsEvents.REQUEST_APP:
      AppsStore.currentApp = processApp(action.data.body.app);
      applyAppDelayStatus(AppsStore.currentApp, QueueStore.queue);
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.REQUEST_APP_ERROR:
      AppsStore.emit(
        AppsEvents.REQUEST_APP_ERROR,
        action.data.body,
        action.data.status);
      break;
    case AppsEvents.CREATE_APP:
      AppsStore.apps.push(processApp(action.data.body));
      AppsStore.emit(AppsEvents.CREATE_APP);
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.CREATE_APP_ERROR:
      AppsStore.emit(
        AppsEvents.CREATE_APP_ERROR,
        action.data.body,
        action.data.status
      );
      break;
    case AppsEvents.DELETE_APP:
      AppsStore.apps =
        removeApp(AppsStore.apps, action.appId);
      AppsStore.emit(AppsEvents.DELETE_APP);
      break;
    case AppsEvents.DELETE_APP_ERROR:
      AppsStore.emit(
        AppsEvents.DELETE_APP_ERROR,
        action.data.body,
        action.data.status
      );
      break;
    case AppsEvents.RESTART_APP:
      AppsStore.emit(AppsEvents.RESTART_APP);
      break;
    case AppsEvents.RESTART_APP_ERROR:
      AppsStore.emit(
        AppsEvents.RESTART_APP_ERROR,
        action.data.body,
        action.data.status
      );
      break;
    case AppsEvents.SCALE_APP:
      AppsStore.emit(AppsEvents.SCALE_APP);
      break;
    case AppsEvents.SCALE_APP_ERROR:
      AppsStore.emit(AppsEvents.SCALE_APP_ERROR, action.data.body,
          action.data.status, action.instances);
      break;
    case AppsEvents.APPLY_APP_REQUEST:
      AppsStore.emit(AppsEvents.APPLY_APP_REQUEST, action.appId);
      break;
    case AppsEvents.APPLY_APP:
      AppsStore.emit(AppsEvents.APPLY_APP, action.isEditing);
      break;
    case AppsEvents.APPLY_APP_ERROR:
      AppsStore.emit(
        AppsEvents.APPLY_APP_ERROR,
        action.data.body,
        action.isEditing,
        action.data.status
      );
      break;
    case TasksEvents.DELETE:
      AppsStore.currentApp.tasks =
        removeTasks(
          AppsStore.currentApp.tasks,
          action.appId,
          action.taskIds
        );
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case TasksEvents.DELETE_ERROR:
      AppsStore.emit(
        TasksEvents.DELETE_ERROR,
        action.data.body,
        action.data.status,
        action.taskIds
      );
      break;
    case AppsEvents.UPDATE_APPS_FILTER_COUNT:
      AppsStore.emit(AppsEvents.UPDATE_APPS_FILTER_COUNT, action.data);
      break;
  }
});

module.exports = AppsStore;
