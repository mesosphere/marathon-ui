var EventEmitter = require("events").EventEmitter;
var semver = require("semver");

var AppDispatcher = require("../AppDispatcher");
var Util = require("../helpers/Util");
var InfoStore = require("../stores/InfoStore");
var InfoActions = require("../actions/InfoActions");
var InfoEvents = require("../events/InfoEvents");
var MesosActions = require("../actions/MesosActions");
var MesosEvents = require("../events/MesosEvents");

const FILES_TTL = 60000; // in ms
const STATE_TTL = 60000;
const REQUEST_DATA_TTL = 10000;
const REQUEST_TIMEOUT = 500; // in ms
const MAX_REQUESTS = 1;
const MASTER_ID = "master";
const INFO_ID = "info";

var info = null;
var version = null;
var stateMap = {};
var taskFileMap = {};
var taskFileRequestQueue = [];
var requestMap = {};

function getDataFromMap(id, map, ttlMilliseconds = 100) {
  if (!Util.isString(id) || map == null) {
    return null;
  }

  let item = map[id];
  if (item == null) {
    return null;
  }
  if (item.timestamp + ttlMilliseconds < Date.now()) {
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
  },

  resetStore: function () {
    info = null;
    version = null;
    stateMap = {};
    taskFileMap = {};
    taskFileRequestQueue.length = 0;
    requestMap = {};
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

  let framework = null;

  if (state.frameworks != null) {
    framework = state.frameworks.find(matchFramework)
  } else if (state.completed_frameworks != null) {
    framework = state.completed_frameworks.find(matchFramework)
  }

  if (framework == null) {
    return null;
  }

  function matchExecutor(executor) {
    return taskId === executor.id;
  }

  let executor = null;

  if (framework.executors != null) {
    executor = framework.executors.find(matchExecutor)
  } else if (framework.completed_executors != null) {
    executor = framework.completed_executors.find(matchExecutor)
  }

  if (executor == null) {
    return null;
  }

  return executor.directory;
}

function performRequest(requestId, requestCallback, timeoutErrorCallback) {
  var timestamp = Date.now();
  var requestData = getDataFromMap(requestId, requestMap, REQUEST_DATA_TTL) || {
    count:0,
    timeout: timestamp + REQUEST_TIMEOUT,
    error:false
  };

  if (requestData.error || requestData.count >= MAX_REQUESTS &&
      requestData.timeout <= timestamp) {
    timeoutErrorCallback();
    return;
  }

  if (requestData.count >= MAX_REQUESTS) {
    return;
  }

  requestData.count += 1;
  requestData.timeout = timestamp + REQUEST_TIMEOUT;
  addDataToMap(requestId, requestMap, requestData);
  requestCallback();
}

function updateRequest(requestId, nextRequestData) {
  var requestData = getDataFromMap(requestId, requestMap, REQUEST_DATA_TTL);
  if (requestData != null) {
    addDataToMap(requestId, requestMap,
      Object.assign(requestData, nextRequestData));
  }
}

function resetRequest(requestId) {
  invalidateMapData(requestId, requestMap);
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

  if (taskFileRequestQueue.length === 0) {
    return;
  }

  if (!info) {
    performRequest(INFO_ID,
      () =>  InfoActions.requestInfo(),
      () => taskFileRequestQueue.forEach(rejectFileRequest));
    return;
  }

  if (!Util.isString(info.frameworkId) ||
    !Util.isObject(info.marathon_config) ||
    !Util.isString(info.marathon_config.mesos_leader_ui_url)) {
    info = null;
    updateRequest(INFO_ID, {error:true});
    resolveTaskFileRequests();
    return;
  }

  if (!version) {
    MesosActions.requestVersionInformation(
      info.marathon_config.mesos_leader_ui_url.replace(/\/$/, ""));
    return;
  }

  if (!MesosStore.getState(MASTER_ID)) {
    performRequest(MASTER_ID,
      () => MesosActions.requestState(MASTER_ID,
        info.marathon_config.mesos_leader_ui_url.replace(/\/?$/, "/master"),
        version),
      () => taskFileRequestQueue.forEach(rejectFileRequest));
    return;
  }

  resetRequest(INFO_ID);

  taskFileRequestQueue.forEach((fileRequest, queueIndex) => {
    var agentId = fileRequest.agentId;
    var taskId = fileRequest.taskId;

    if (!MesosStore.getState(agentId)) {
      let masterState = MesosStore.getState(MASTER_ID);
      let nodeURL = getNodeURLFromState(agentId, masterState);

      if (nodeURL == null) {
        updateRequest(MASTER_ID, {error:true});
        invalidateMapData(MASTER_ID, stateMap);
        resolveTaskFileRequests();
        return;
      }

      performRequest(agentId,
        () => MesosActions.requestState(agentId, nodeURL, version),
        () => rejectFileRequest(fileRequest, queueIndex));
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
        updateRequest(agentId, {error:true});
        invalidateMapData(agentId, stateMap);
        resolveTaskFileRequests();
        return;
      }

      performRequest(taskId,
        () =>  MesosActions.requestFiles(taskId, nodeURL, executorDirectory,
          version),
        () => rejectFileRequest(fileRequest, queueIndex));
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
      info = InfoStore.info;
      resolveTaskFileRequests();
      break;
    case InfoEvents.REQUEST:
      AppDispatcher.waitFor([InfoStore.dispatchToken]);
      info = InfoStore.info;
      resolveTaskFileRequests();
      break;
    case InfoEvents.REQUEST_ERROR:
      updateRequest(INFO_ID, {error:true});
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
      updateRequest(data.id, {error:true});
      resolveTaskFileRequests();
      MesosStore.emit(MesosEvents.REQUEST_STATE_ERROR, data);
      break;
    case MesosEvents.REQUEST_FILES_COMPLETE:
      let downloadRoute = "/files/download.json";
      if (semver.valid(version) && semver.satisfies(version, ">=0.26.0")) {
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
      updateRequest(data.id, {error:true});
      resolveTaskFileRequests();
      MesosStore.emit(MesosEvents.REQUEST_FILES_ERROR, data);
      break;
  }
});

module.exports = MesosStore;

