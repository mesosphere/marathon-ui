var React = require("react/addons");
var classNames = require("classnames");

var MesosActions = require("../actions/MesosActions");
var MesosEvents = require("../events/MesosEvents");
var MesosStore = require("../stores/MesosStore");

function matchFileName(name) {
  return (file) => file.name === name;
}

var TaskFileLinkComponent = React.createClass({
  displayName: "TaskFileLinkComponent",
  propTypes: {
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    fileName: React.PropTypes.string.isRequired,
    task: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      file: null,
      requested: false
    };
  },

  componentWillMount: function () {
    MesosStore.on(MesosEvents.CHANGE, this.onMesosChange);
  },

  componentWillUnmount: function () {
    MesosStore.removeListener(MesosEvents.CHANGE, this.onMesosChange);
  },

  onMesosChange: function () {
    var props = this.props;
    var requested = this.state.requested;
    var task = props.task;
    var taskId = task.id || task.taskId;
    var files = MesosStore.getTaskFiles(taskId);
    var file = null;
    if (files) {
      file = files.filter(matchFileName(props.fileName))[0];
      // Start download if file was requested by the user
      if (requested) {
        window.open(file.download);
      }
      requested = false;
    }
    this.setState({
      file: file,
      requested: requested
    });
  },

  handleClick: function () {
    var file = this.state.file;
    if (file == null) {
      var task = this.props.task;
      var agentId = task.slaveId;
      var taskId = task.id || task.taskId;
      MesosActions.requestTaskFiles(agentId, taskId);
      this.setState({
        requested: true
      });
      return;
    }
    window.open(file.download);
  },

  render: function () {
    var className = classNames("task-file-download", this.props.className, {
      "loading": this.state.requested
    });
    return (<a className={className} onClick={this.handleClick}>
      {this.props.children}
    </a>);
  }
});

module.exports = TaskFileLinkComponent;
