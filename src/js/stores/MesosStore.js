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

var stateMap = {};
var taskFileMap = {};
var taskFileRequestQue = [];

var MesosStore = Object.assign({

  getState: function (nodeId) {
    var data = stateMap[nodeId];
    if (data == null || data.timestamp + STATE_TTL < Date.now()) {
      invalidateState(nodeId);
      return null;
    }
    return data.state;
  },

  getTaskFiles: function (taskId) {
    var data = taskFileMap[taskId];
    if (data == null || data.timestamp + FILES_TTL < Date.now()) {
      invalidateTaskFiles(taskId);
      return null;
    }
    return data.files;
  }

}, EventEmitter.prototype);

function addState(nodeId, state) {
  stateMap[nodeId] = {
    state: state,
    timestamp: Date.now()
  };
  MesosStore.emit(MesosEvents.CHANGE);
}

function invalidateState(nodeId) {
  stateMap[nodeId] = null;
}

function addTaskFiles(taskId, files) {
  taskFileMap[taskId] = {
    files: files,
    timestamp: Date.now()
  };
  MesosStore.emit(MesosEvents.CHANGE);
}

function invalidateTaskFiles(taskId) {
  delete taskFileMap[taskId];
}

function getNodeUrl(nodeId) {
  var master = MesosStore.getState(MASTER_ID);
  if (master == null) {
    throw new Error(
      `Unable to get the node url as the master state is undefined.`
    );
  }

  let agent = master.slaves.find((slave) => {
    return slave.id === nodeId;
  });

  if (agent == null) {
    throw new Error(
      `Can't get the node url as the he node (${nodeId}) is undefined.`
    );
  }

  let pid = agent.pid;
  let hostname = agent.hostname;
  return `//${hostname}:${pid.substring(pid.lastIndexOf(":") + 1)}`;
}

function getExecutorDirectory(agentId, frameworkId, taskId) {
  var agentState = MesosStore.getState(agentId);

  if (agentState == null) {
    throw new Error(
      `Unable get the executor directory as the agent (${agentId})
      state is undefined.`
    );
  }

  function matchFramework(framework) {
    return frameworkId === framework.id;
  }

  let framework =
    agentState.frameworks.find(matchFramework) ||
    agentState.completed_frameworks.find(matchFramework);

  if (!framework) {
    throw new Error(
      `Can't get the executor directory as the Framework (${frameworkId})
       does not exist on the given agent (${agentId}).`
    );
  }

  function matchExecutor(executor) {
    return taskId === executor.id;
  }

  var executor =
    framework.executors.find(matchExecutor) ||
    framework.completed_executors.find(matchExecutor);

  if (executor == null) {
    throw new Error(
      `Unable to get the executor directory as the task (${taskId})
      does not exists.`
    );
  }

  return executor.directory;
}

function resolveTaskFileRequests() {
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
  taskFileRequestQue.forEach((request, index) => {

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
    taskFileRequestQue.splice(index, 1);

  });
}

AppDispatcher.register(function (action) {
  var data = action.data;
  switch (action.actionType) {
    case MesosEvents.REQUEST_FILES:
      taskFileRequestQue.push({
        agentId: data.agentId,
        taskId: data.taskId
      });
      resolveTaskFileRequests();
      break;
    case InfoEvents.CHANGE:
      resolveTaskFileRequests();
      break;
    case MesosEvents.REQUEST_STATE_COMPLETE:
      addState(data.id, data.state);
      resolveTaskFileRequests();
      break;
    case MesosEvents.REQUEST_STATE_ERROR:
      MesosStore.emit(MesosEvents.REQUEST_STATE_ERROR, data.body);
      break;
    case MesosEvents.REQUEST_FILES_COMPLETE:
      addTaskFiles(data.id, data.files.map((file) => {
        let encodedPath = encodeURIComponent(file.path);
        file.host = data.host;
        file.name = /[^/]+\/?$/.exec(file.path)[0];
        file.download = `${data.host}/files/download?path=${encodedPath}`;
        return file;
      }));
      resolveTaskFileRequests();
      break;
    case MesosEvents.REQUEST_FILES_ERROR:
      MesosStore.emit(MesosEvents.REQUEST_FILES_ERROR, data.body);
      break;
  }
});

module.exports = MesosStore;

