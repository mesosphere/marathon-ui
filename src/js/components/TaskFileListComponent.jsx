var React = require( "react/addons");
var MesosActions = require( "../actions/MesosActions");
var MesosEvents = require( "../events/MesosEvents");
var MesosStore = require( "../stores/MesosStore");

var TaskFileListComponent = React.createClass({
  displayName: "TaskFileListComponent",
  propTypes: {
    task: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    var task = this.props.task;
    var taskId = task.id || task.taskId;
    return {
      files: MesosStore.getTaskFiles(taskId)
    };
  },

  componentWillMount: function () {
    MesosStore.on(MesosEvents.CHANGE, this.onMesosChange);
  },

  componentDidMount: function () {
    var task = this.props.task;
    var agentId = task.slaveId;
    var taskId = task.id || task.taskId;
    if (this.state.files == null) {
      MesosActions.requestTaskFiles(agentId, taskId);
    }
  },

  componentWillUnmount: function () {
    MesosStore.removeListener(MesosEvents.CHANGE, this.onMesosChange);
  },

  onMesosChange() {
    var task = this.props.task;
    var taskId = task.id || task.taskId;
    var files = MesosStore.getTaskFiles(taskId);
    if (files != null) {
      this.setState({
        files: files
      });
    }
  },

  getFileNodes: function () {
    var files = this.state.files;
    if (files != null) {
      return files.map((file) => {
        return (<tr key={file.path}>
          <td>{file.gid}</td>
          <td>{file.mode}</td>
          <td>{file.mtime}</td>
          <td>{file.size}</td>
          <td>{file.uid}</td>
          <td>
            <a href={file.download}
              target="_blank">
              download
            </a>
          </td>
        </tr>);
      });
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
