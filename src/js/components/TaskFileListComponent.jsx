var React = require("react/addons");

var InfoActions = require("../actions/InfoActions");
var MesosActions = require("../actions/MesosActions");
var InfoEvents = require("../events/InfoEvents");
var MesosEvents = require("../events/MesosEvents");
var InfoStore = require("../stores/InfoStore");
var MesosStore = require("../stores/MesosStore");

var TaskFileListComponent = React.createClass({
  displayName: "TaskFileListComponent",
  propTypes: {
    task: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    var task = this.props.task;
    var taskId = task.id || task.taskId;
    return {
      files: MesosStore.files[taskId]
    };
  },

  componentDidMount: function () {
    var task = this.props.task;
    var taskId = task.id || task.taskId;
    var slaveId = task.slaveId;

    if (!MesosStore.state["master"]) {
      InfoActions.requestInfo();
      return;
    }

    if (!MesosStore.state[slaveId]) {
      MesosActions.requestState(slaveId, this.getNodeUrl(slaveId));
      return;
    }

    if (!MesosStore.files[taskId]) {
      let frameworkId = InfoStore.info.frameworkId;

      MesosActions.requestFiles(taskId,
        this.getNodeUrl(slaveId),
        this.getExecutorDirectory(slaveId, frameworkId, taskId));
    }

  },

  componentWillMount: function () {
    InfoStore.on(InfoEvents.CHANGE, this.onInfoChange);
    MesosStore.on(MesosEvents.CHANGE, this.onMesosChange);
  },

  componentWillUnmount: function () {
    InfoStore.removeListener(InfoEvents.CHANGE, this.onInfoChange);
  },

  onInfoChange: function () {
    var info = InfoStore.info;

    if (info.hasOwnProperty("marathon_config")) {
      MesosActions.requestState(
        "master", info.marathon_config.mesos_leader_ui_url + "master");
    }
  },

  onMesosChange() {
    var task = this.props.task;
    var taskId = task.id || task.taskId;
    var slaveId = task.slaveId;

    // Get node/slave sate
    if (!MesosStore.state[slaveId]) {
      MesosActions.requestState(slaveId, this.getNodeUrl(slaveId));
      return;
    }

    // Get files
    if (!MesosStore.files[taskId]) {
      let info = InfoStore.info;
      let frameworkId = info.frameworkId;

      MesosActions.requestFiles(taskId,
        this.getNodeUrl(slaveId),
        this.getExecutorDirectory(slaveId, frameworkId, taskId));
      return;
    }

    this.setState({files: MesosStore.files[taskId]});
  },

  getNodeUrl(nodeId) {
    // @todo: test for missing master state data
    var slave = MesosStore.state["master"].slaves.find((slave) => {
      return slave.id === nodeId;
    });
    var pid = slave.pid;
    var hostname = slave.hostname
    return `//${hostname}:${pid.substring(pid.lastIndexOf(":") + 1)}`;
  },

  getExecutorDirectory(slaveId, frameworkId, taskId) {
    var state = MesosStore.state[slaveId];

    if (state == null) {
      throw new Error(`Missing ${slaveId} state data.`);
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
         with ID ${slaveId}.`
      );
    }

    function matchExecutor(executor) {
      return taskId === executor.id;
    }

    var executor =
      framework.executors.find(matchExecutor) ||
      framework.completed_executors.find(matchExecutor);
    return executor.directory;
  },

  getFileNodes() {
    var files = this.state.files;
    if (files != null) {
      let url = this.getNodeUrl(this.props.task.slaveId);
      return files.map((file) => {
        let encodedPath = encodeURIComponent(file.path);
        return (<tr key={file.path}>
          <td>{file.gid}</td>
          <td>{file.mode}</td>
          <td>{file.mtime}</td>
          <td>{file.size}</td>
          <td>{file.uid}</td>
          <td>
            <a href={`${url}/files/download?path=${encodedPath}`}
                target="_blank">
              download
            </a>
          </td>
        </tr>)
      })
    }
  },

  render: function () {
    return (
      <table className="table table-fixed table-hover table-selectable">
        <thead>
          <th>gid</th>
          <th>mode</th>
          <th>mtime</th>
          <th>size</th>
          <th>uid</th>
          <th>path</th>
        </thead>
        {this.getFileNodes()}
      </table>
    );
  }
});

module.exports = TaskFileListComponent;
