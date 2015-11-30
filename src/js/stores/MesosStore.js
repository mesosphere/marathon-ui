var EventEmitter = require("events").EventEmitter;

var AppDispatcher = require("../AppDispatcher");
var InfoStore = require("../stores/InfoStore");
var InfoActions = require("../actions/InfoActions");
var InfoEvents = require("../events/InfoEvents");
var MesosActions = require("../actions/MesosActions");
var MesosEvents = require("../events/MesosEvents");

const FILES_TTL = 60000;
const STATE_TTL = 60000;
const MASTER_ID = "master";

var state = {};
var files = {};
var fileRequests = [];

var MesosStore = Object.assign({

  getTaskFiles: function (taskId) {
    var data = files[taskId];
    if (data == null || data.timestamp + FILES_TTL < Date.now()) {
      return null;
    }
    return data.files;
  },

  getState: function (nodeId) {
    var data = state[nodeId];
    if (data == null || data.timestamp + STATE_TTL < Date.now()) {
      return null;
    }
    return data.state;
  }

}, EventEmitter.prototype);

function getNodeUrl(nodeId) {
  var master = MesosStore.getState(MASTER_ID);
  if (master == null) {
    return "";
  }

  let agent = master.slaves.find((slave) => {
    return slave.id === nodeId;
  });

  if (agent == null) {
    return "";
  }

  let pid = agent.pid;
  let hostname = agent.hostname;
  return `//${hostname}:${pid.substring(pid.lastIndexOf(":") + 1)}`;
}

function getExecutorDirectory(agentId, frameworkId, taskId) {
  var agentState = MesosStore.getState(agentId);

  if (agentState == null) {
    return null;
  }

  function matchFramework(framework) {
    return frameworkId === framework.id;
  }

  let framework =
    agentState.frameworks.find(matchFramework) ||
    agentState.completed_frameworks.find(matchFramework);

  if (!framework) {
    throw new Error(
      `Framework with ID ${frameworkId} does not exist on slave\
         with ID ${agentId}.`
    );
  }

  function matchExecutor(executor) {
    return taskId === executor.id;
  }

  var executor =
    framework.executors.find(matchExecutor) ||
    framework.completed_executors.find(matchExecutor);

  if (executor == null) {
    return null;
  }

  return executor.directory;
}

function resolveFileRequests() {
  var info = InfoStore.info;

  // Get the marathon config, to retrieve the mesos leader (master)  url
  if (!info.hasOwnProperty("marathon_config")) {
    InfoActions.requestInfo();
    return;
  }

  // Get master sate, We need it to parse the agent/node url
  if (!MesosStore.getState(MASTER_ID)) {
    MesosActions.requestState(MASTER_ID,
      info.marathon_config.mesos_leader_ui_url.replace(/\/?$/, "/master"));
    return;
  }

  // Check all requests, request needed data or remove them from the que
  fileRequests.forEach((request, index) => {

    var taskId = request.taskId;
    var agentId = request.agentId;

    // Get node/agent sate. This is needed to actually retrieve
    // the executor directory.
    if (!MesosStore.getState(agentId)) {
      MesosActions.requestState(agentId, getNodeUrl(agentId));
      return;
    }

    // Request the files if not present
    if (!MesosStore.getTaskFiles(taskId)) {
      MesosActions.requestFiles(taskId,
        getNodeUrl(agentId),
        getExecutorDirectory(agentId, info.frameworkId, taskId));
      return;
    }

    // Everything is fine, we have the file, let's remove it from the que
    fileRequests.splice(index, 1);

  });
}

AppDispatcher.register(function (action) {
  var data = action.data;
  switch (action.actionType) {
    case MesosEvents.REQUEST_FILES:
      fileRequests.push({
        agentId: data.agentId,
        taskId: data.taskId
      });
      resolveFileRequests();
      break;
    case InfoEvents.CHANGE:
      resolveFileRequests();
      break;
    case MesosEvents.REQUEST_STATE_COMPLETE:
      state[data.id] = {
        state: data.state,
        timestamp: Date.now()
      };
      resolveFileRequests();
      MesosStore.emit(MesosEvents.CHANGE);
      break;
    case MesosEvents.REQUEST_STATE_ERROR:
      MesosStore.emit(MesosEvents.REQUEST_STATE_ERROR, data.body);
      break;
    case MesosEvents.REQUEST_FILES_COMPLETE:
      files[data.id] = {
        files: data.files.map((file) => {
          let encodedPath = encodeURIComponent(file.path);
          file.host = data.host;
          file.name = /[^/]+\/?$/.exec(file.path)[0];
          file.download = `${data.host}/files/download?path=${encodedPath}`;
          return file;
        }),
        timestamp: Date.now()
      };
      resolveFileRequests();
      MesosStore.emit(MesosEvents.CHANGE);
      break;
    case MesosEvents.REQUEST_FILES_ERROR:
      MesosStore.emit(MesosEvents.REQUEST_FILES_ERROR, data.body);
      break;
  }
});

module.exports = MesosStore;

