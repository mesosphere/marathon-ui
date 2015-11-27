import {EventEmitter} from "events";

import AppDispatcher from "../AppDispatcher";
import InfoStore from "../stores/InfoStore";
import InfoActions from "../actions/InfoActions";
import InfoEvents from "../events/InfoEvents";
import MesosActions from "../actions/MesosActions";
import MesosEvents from "../events/MesosEvents";

const FILES_TTL = 60000;
const STATE_TTL = 60000;
const MASTER_ID = "master";

class MesosStore extends EventEmitter {

  constructor() {
    super();
    this._state = {};
    this._files = {};
    this._fileRequests = [];
    AppDispatcher.register(this.handleActions.bind(this));
  }

  getTaskFiles(taskId) {
    var data = this._files[taskId];
    if (data == null || data.timestamp + FILES_TTL < Date.now()) {
      return null;
    }
    return data.files;
  }

  getState(nodeId) {
    var data = this._state[nodeId];
    if (data == null || data.timestamp + STATE_TTL < Date.now()) {
      return null;
    }
    return data.state;
  }

  getNodeUrl(nodeId) {
    var master = this.getState(MASTER_ID);
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

  getExecutorDirectory(agentId, frameworkId, taskId) {
    var state = this.getState(agentId);

    if (state == null) {
      return null;
    }

    function matchFramework(framework) {
      return frameworkId === framework.id;
    }

    let framework =
      state.frameworks.find(matchFramework) ||
      state.completed_frameworks.find(matchFramework);

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

  _resolveRequests() {
    var info = InfoStore.info;

    // Get the marathon config, to retrieve the mesos leader (master)  url
    if (!info.hasOwnProperty("marathon_config")) {
      InfoActions.requestInfo();
      return;
    }

    // Get master sate, We need it to parse the agent/node url
    if (!this.getState(MASTER_ID)) {
      MesosActions.requestState(MASTER_ID,
        info.marathon_config.mesos_leader_ui_url.replace(/\/?$/, "/master"));
      return;
    }

    // Check all requests, request needed data or remove them from the que
    this._fileRequests.forEach((request, index) => {

      var taskId = request.taskId;
      var agentId = request.agentId;

      // Get node/agent sate. This is needed to actually retrieve
      // the executor directory.
      if (!this.getState(agentId)) {
        MesosActions.requestState(agentId, this.getNodeUrl(agentId));
        return;
      }

      // Request the files if not present
      if (!this.getTaskFiles(taskId)) {
        MesosActions.requestFiles(taskId,
          this.getNodeUrl(agentId),
          this.getExecutorDirectory(agentId, info.frameworkId, taskId));
        return;
      }

      // Everything is fine, we have the file, let's remove it from the que
      this._fileRequests.splice(index, 1);

    });
  }

  handleActions(action) {
    var data = action.data;
    switch (action.actionType) {
      case MesosEvents.REQUEST_FILES:
        this._fileRequests.push({
          agentId: data.agentId,
          taskId: data.taskId
        });
        this._resolveRequests();
        break;
      case InfoEvents.CHANGE:
        this._resolveRequests();
        break;
      case MesosEvents.REQUEST_STATE_COMPLETE:
        this._state[data.id] = {
          state: data.state,
          timestamp: Date.now()
        };
        this._resolveRequests();
        this.emit(MesosEvents.CHANGE);
        break;
      case MesosEvents.REQUEST_STATE_ERROR:
        MesosEvents.emit(MesosEvents.REQUEST_STATE_ERROR, data.body);
        break;
      case MesosEvents.REQUEST_FILES_COMPLETE:
        this._files[data.id] = {
          files: data.files.map((file) => {
            let encodedPath = encodeURIComponent(file.path);
            file.host = data.host;
            file.name = /[^/]+$/.exec(file.path);
            file.download = `${data.host}/files/download?path=${encodedPath}`;
            return file;
          }),
          timestamp: Date.now()
        };
        this._resolveRequests();
        this.emit(MesosEvents.CHANGE);
        break;
      case MesosEvents.REQUEST_FILES_ERROR:
        MesosEvents.emit(MesosEvents.REQUEST_FILES_ERROR, data.body);
        break;
    }
  }

}

MesosStore.MASTER_ID = MASTER_ID;

export default new MesosStore();

