import {EventEmitter} from "events";

import AppDispatcher from "../AppDispatcher";
import AppsEvents from "../events/AppsEvents";
import appScheme from "../stores/schemes/appScheme";
import AppTypes from "../constants/AppTypes";
import ContainerConstants from "../constants/ContainerConstants";
import AppStatus from "../constants/AppStatus";
import HealthStatus from "../constants/HealthStatus";
import TasksEvents from "../events/TasksEvents";
import TaskStatus from "../constants/TaskStatus";
import QueueStore from "./QueueStore";
import QueueEvents from "../events/QueueEvents";

import Util from "../helpers/Util";

const storeData = {
  apps: [],
  currentApp: appScheme
};

const healthWeights = Object.freeze({
  [HealthStatus.UNHEALTHY]: 32,
  [HealthStatus.OVERCAPACITY]: 16,
  [HealthStatus.STAGED]: 8,
  [HealthStatus.HEALTHY]: 4,
  [HealthStatus.UNKNOWN]: 2,
  [HealthStatus.UNSCHEDULED]: 1
});

function removeApp(apps, appId) {
  return apps.filter(app => app.id !== appId);
}

function removeTasks(tasks, relatedAppId, taskIds) {
  return tasks.filter(task => {
    return !(taskIds.includes(task.id) && task.appId === relatedAppId);
  });
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

  var tasksSum = healthData.reduce((sum, healthNode) => {
    return sum + healthNode.quantity;
  }, 0);

  healthData.push({
    quantity: Math.max(0, tasksSum - app.instances),
    state: HealthStatus.OVERCAPACITY
  });

  healthData.push({
    quantity: Math.max(0, app.instances - tasksSum),
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
  app = Util.extendObject(appScheme, app);

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

  app.tasks = app.tasks.map(function (task) {
    task.id =  task.id || task.taskId;
    task.healthStatus = getTaskHealth(task);
    setTaskStatus(task);
    return task;
  });

  return app;
}

function processApps(apps) {
  return apps.map(function (app) {
    return processApp(app);
  });
}

function applyAppDelayStatus(app, queue) {
  var hasChanges = false;

  var queueEntry = queue.find(function (entry) {
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

var AppsStore = Util.extendObject(EventEmitter.prototype, {
  // Array of apps objects received from the "apps/"-endpoint
  get apps() {
    return Util.deepCopy(storeData.apps);
  },

  // Object of the current app recieved from the "apps/[appId]"-endpoint
  // This endpoint delievers more data, like the tasks on the app.
  getCurrentApp: function (appId) {
    var app;

    if (appId === storeData.currentApp.id) {
      app = storeData.currentApp;
    } else {
      let shallowApp = storeData.apps.find(app => app.id === appId);
      if (shallowApp) {
        app = shallowApp;
      } else {
        app = appScheme;
      }
    }

    return Util.deepCopy(app);
  },

  getTask: function (appId, taskId) {
    return Util.deepCopy(
      this.getCurrentApp(appId).tasks.find(task => task.id === taskId)
    );
  }
});

QueueStore.on(QueueEvents.CHANGE, function () {
  var change = applyAppDelayStatusOnAllApps(storeData.apps, QueueStore.queue);
  if (change) {
    AppsStore.emit(AppsEvents.CHANGE);
  }
});

AppDispatcher.register(function (action) {
  switch (action.actionType) {
    case AppsEvents.REQUEST_APPS:
      storeData.apps = processApps(action.data.body.apps);
      applyAppDelayStatusOnAllApps(storeData.apps, QueueStore.queue);
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
      storeData.currentApp = processApp(action.data.body.app);
      applyAppDelayStatus(storeData.currentApp, QueueStore.queue);
      AppsStore.emit(AppsEvents.CHANGE);
      break;
    case AppsEvents.REQUEST_APP_ERROR:
      AppsStore.emit(
        AppsEvents.REQUEST_APP_ERROR,
        action.data.body,
        action.data.status);
      break;
    case AppsEvents.CREATE_APP:
      storeData.apps.push(processApp(action.data.body));
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
      storeData.apps =
        removeApp(storeData.apps, action.appId);
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
      storeData.currentApp.tasks =
        removeTasks(
          storeData.currentApp.tasks,
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

export default AppsStore;
