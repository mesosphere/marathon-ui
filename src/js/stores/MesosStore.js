var EventEmitter = require("events").EventEmitter;
var semver = require("semver");

var AppDispatcher = require("../AppDispatcher");
var Util = require("../helpers/Util");
var InfoStore = require("../stores/InfoStore");
var InfoActions = require("../actions/InfoActions");
var InfoEvents = require("../events/InfoEvents");
var MesosActions = require("../actions/MesosActions");
var MesosEvents = require("../events/MesosEvents");

const FILES_TTL = 60000;
const STATE_TTL = 60000;
const REQUEST_COUNT_TTL = 10000;
const MAX_REQUESTS = 1;
const MASTER_ID = "master";
const INFO_ID = "info";

var version = null;
var stateMap = {};
var taskFileMap = {};
var taskFileRequestQueue = [];
var requestCountMap = {};

function getDataFromMap(id, map, ttl = 100) {
  if (!Util.isString(id) || map == null) {
    return null;
  }

  let item = map[id];
  if (item == null) {
    return null;
  }
  if (item.timestamp + ttl < Date.now()) {
    invalidateMapData(id, map);
    return null;
  }

  return item.data;
}

function invalidateMapData(id, map) {
  if (!Util.isString(id) || map == null) {
    return;
  }
  delete map[id];
}

function addDataToMap(id, map, data) {
  if (!Util.isString(id) || map == null || data == null) {
    return;
  }
  map[id] = {
    data: data,
    timestamp: Date.now()
  };
}

var MesosStore = Object.assign({

  getState: function (nodeId) {
    return getDataFromMap(nodeId, stateMap, STATE_TTL);
  },

  getTaskFiles: function (taskId) {
    return getDataFromMap(taskId, taskFileMap, FILES_TTL);
  }

}, EventEmitter.prototype);

function getNodeURLFromState(nodeId, state) {

  if (state == null) {
    return null;
  }

  let agent = state.slaves.find((slave) => {
    return slave.id === nodeId;
  });

  if (agent == null) {
    return null;
  }

  let pid = agent.pid;
  let hostname = agent.hostname;
  return `//${hostname}:${pid.substring(pid.lastIndexOf(":") + 1)}`;
}

function getExecutorDirectoryFromState(frameworkId, taskId, state) {

  if (state == null) {
    return null;
  }

  function matchFramework(framework) {
    return frameworkId === framework.id;
  }

  let framework = state.frameworks.find(matchFramework) ||
    state.completed_frameworks.find(matchFramework);

  if (framework == null) {
    return null;
  }

  function matchExecutor(executor) {
    return taskId === executor.id;
  }

  let executor = framework.executors.find(matchExecutor) ||
    framework.completed_executors.find(matchExecutor);

  if (executor == null) {
    return null;
  }

  return executor.directory;
}

function performRequest(requestId, request) {
  let requestCount = getDataFromMap(requestId, requestCountMap,
      REQUEST_COUNT_TTL) || 0;
  if (requestCount >= MAX_REQUESTS) {
    return false;
  }
  addDataToMap(requestId, requestCountMap, ++requestCount);
  request();
  return true;
}

function resetRequest(requestId) {
  invalidateMapData(requestId, requestCountMap);
}

function resolveFileRequest(fileRequest, queueIndex) {
  MesosStore.emit(MesosEvents.REQUEST_TASK_FILES_COMPLETE, fileRequest);
  taskFileRequestQueue.splice(queueIndex, 1);
}

function rejectFileRequest(fileRequest, queueIndex) {
  MesosStore.emit(MesosEvents.REQUEST_TASK_FILES_ERROR, fileRequest);
  taskFileRequestQueue.splice(queueIndex, 1);
}

function resolveTaskFileRequests() {
  var info = InfoStore.info;

  if (taskFileRequestQueue.length === 0) {
    return;
  }

  if (!info) {
    let isRequested = performRequest(INFO_ID, () => {
      InfoActions.requestInfo();
    });

    if (!isRequested) {
      taskFileRequestQueue.forEach(rejectFileRequest);
    }
    return;
  }

  if (!Util.isString(info.frameworkId) ||
      !Util.isObject(info.marathon_config) ||
      !Util.isString(info.marathon_config.mesos_leader_ui_url)) {
    taskFileRequestQueue.forEach(rejectFileRequest);
    return;
  }

  resetRequest(INFO_ID);

  if (!version) {
    MesosActions.requestVersionInformation(
      info.marathon_config.mesos_leader_ui_url.replace(/\/$/, ""));
    return;
  }

  if (!MesosStore.getState(MASTER_ID)) {

    let isRequested = performRequest(MASTER_ID, () => {
      MesosActions.requestState(MASTER_ID,
        info.marathon_config.mesos_leader_ui_url.replace(/\/?$/, "/master"),
        version)
    });

    if (!isRequested) {
      taskFileRequestQueue.forEach(rejectFileRequest);
    }

    return;
  }

  taskFileRequestQueue.forEach((fileRequest, queueIndex) => {
    var taskId = fileRequest.taskId;
    var agentId = fileRequest.agentId;

    if (!MesosStore.getState(agentId)) {
      let masterState = MesosStore.getState(MASTER_ID);
      let nodeURL = getNodeURLFromState(agentId, masterState);
      if (nodeURL == null) {
        invalidateMapData(MASTER_ID, stateMap);
        resolveTaskFileRequests();
        return;
      }

      let isRequested = performRequest(agentId, () => {
        MesosActions.requestState(agentId, nodeURL, version);
      });

      if (!isRequested) {
        rejectFileRequest(fileRequest, queueIndex);
      }

      return;
    }

    resetRequest(MASTER_ID);

    if (!MesosStore.getTaskFiles(taskId)) {
      let masterState = MesosStore.getState(MASTER_ID);
      let agentState = MesosStore.getState(agentId);
      let nodeURL = getNodeURLFromState(agentId, masterState);
      let executorDirectory =
        getExecutorDirectoryFromState(info.frameworkId, taskId, agentState);

      if (nodeURL == null || executorDirectory == null) {
        invalidateMapData(agentId, stateMap);
        resolveTaskFileRequests();
        return;
      }

      let isRequested = performRequest(taskId, () => {
        MesosActions.requestFiles(taskId, nodeURL, executorDirectory, version);
      });

      if (!isRequested) {
        rejectFileRequest(fileRequest, queueIndex);
      }

      return;
    }

    resetRequest(agentId);
    resetRequest(taskId);
    resolveFileRequest(fileRequest, queueIndex);
  });

}

AppDispatcher.register(function (action) {
  var data = action.data;
  switch (action.actionType) {
    case MesosEvents.REQUEST_TASK_FILES:
      taskFileRequestQueue.push({
        agentId: data.agentId,
        taskId: data.taskId
      });
      resolveTaskFileRequests();
      break;
    case InfoEvents.REQUEST:
      AppDispatcher.waitFor([InfoStore.dispatchToken]);
      resolveTaskFileRequests();
      break;
    case MesosEvents.REQUEST_VERSION_INFORMATION_COMPLETE:
      version = data.version;
      resolveTaskFileRequests();
      break;
    case MesosEvents.REQUEST_VERSION_INFORMATION_ERROR:
      version = "0.0.0";
      resolveTaskFileRequests();
      break;
    case MesosEvents.REQUEST_STATE_COMPLETE:
      addDataToMap(data.id, stateMap, data.state);
      resolveTaskFileRequests();
      MesosStore.emit(MesosEvents.CHANGE);
      break;
    case MesosEvents.REQUEST_STATE_ERROR:
      resolveTaskFileRequests();
      MesosStore.emit(MesosEvents.REQUEST_STATE_ERROR, data);
      break;
    case MesosEvents.REQUEST_FILES_COMPLETE:
      let downloadRoute = "/files/download.json";
      if (semver.valid(version) && semver.satisfies(version,">=0.26.0")) {
        downloadRoute = "/files/download";
      }
      addDataToMap(data.id, taskFileMap, data.files.map(file => {
        var encodedPath = encodeURIComponent(file.path);
        file.host = data.host;
        file.name = /[^/]+\/?$/.exec(file.path)[0];
        file.downloadURI = `${data.host}${downloadRoute}?path=${encodedPath}`;
        return file;
      }));
      resolveTaskFileRequests();
      MesosStore.emit(MesosEvents.CHANGE);
      break;
    case MesosEvents.REQUEST_FILES_ERROR:
      resolveTaskFileRequests();
      MesosStore.emit(MesosEvents.REQUEST_FILES_ERROR, data);
      break;
  }
});

module.exports = MesosStore;

