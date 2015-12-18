var React = require("react/addons");
var classNames = require("classnames");

var DialogActions = require("../actions/DialogActions");
var MesosActions = require("../actions/MesosActions");
var MesosEvents = require("../events/MesosEvents");
var MesosStore = require("../stores/MesosStore");

var TaskFileDownloadComponent = React.createClass({
  displayName: "TaskFileDownloadComponent",

  propTypes: {
    className: React.PropTypes.string,
    fileName: React.PropTypes.string.isRequired,
    task: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      file: this.getFile(),
      fileIsRequestedByUser: false
    };
  },

  componentWillUnmount: function () {
    MesosStore.removeListener(MesosEvents.REQUEST_TASK_FILES_COMPLETE,
      this.onMesosRequestTaskFilesComplete);
    MesosStore.removeListener(MesosEvents.REQUEST_TASK_FILES_ERROR,
      this.onMesosRequestTaskFilesError);
  },

  getFile: function () {
    var props = this.props;
    var task = props.task;
    var files = MesosStore.getTaskFiles(task.id);

    if (files != null && files.length) {
      return files.filter(file => file.name === props.fileName)[0];
    }

    return null;
  },

  onMesosRequestTaskFilesComplete: function (request) {
    if (!request || request.taskId !== this.props.task.id) {
      return;
    }

    let file = this.getFile();
    let fileIsRequestedByUser = this.state.fileIsRequestedByUser;

    MesosStore.removeListener(MesosEvents.REQUEST_TASK_FILES_COMPLETE,
      this.onMesosRequestTaskFilesComplete);
    MesosStore.removeListener(MesosEvents.REQUEST_TASK_FILES_ERROR,
      this.onMesosRequestTaskFilesError);

    if (file != null && fileIsRequestedByUser) {
      window.open(file.downloadURI);
      fileIsRequestedByUser = false;
    }

    this.setState({
      file: file,
      fileIsRequestedByUser: fileIsRequestedByUser
    });

  },

  onMesosRequestTaskFilesError: function (request) {
    if (!request || request.taskId !== this.props.task.id) {
      return;
    }

    DialogActions
      .alert(`Request failed or timed out for task ID ${request.taskId}`);

    MesosStore.removeListener(MesosEvents.REQUEST_TASK_FILES_COMPLETE,
      this.onMesosRequestTaskFilesComplete);
    MesosStore.removeListener(MesosEvents.REQUEST_TASK_FILES_ERROR,
      this.onMesosRequestTaskFilesError);

    this.setState({
      fileIsRequestedByUser: false
    });
  },

  handleClick: function (event) {
    var file = this.state.file;

    if (file == null) {
      event.preventDefault();

      let task = this.props.task;

      MesosStore.on(MesosEvents.REQUEST_TASK_FILES_COMPLETE,
        this.onMesosRequestTaskFilesComplete);
      MesosStore.on(MesosEvents.REQUEST_TASK_FILES_ERROR,
        this.onMesosRequestTaskFilesError);

      this.setState({
        fileIsRequestedByUser: true
      }, () => MesosActions.requestTaskFiles(task.slaveId, task.id));
    }
  },

  getIcon: function() {
    if (this.state.fileIsRequestedByUser === true) {
      return (<i className="icon icon-mini loading" />)
    }
    return (<i className="icon icon-mini file" />)
  },

  render: function () {
    var state = this.state;
    var props = this.props;
    var name = props.fileName;
    var file = state.file;
    var href = "";

    if (file) {
      href = file.downloadURI;
    }

    return (
      <a className="task-file-download"
          href={href}
          onClick={this.handleClick}
          download={name}>
        {this.getIcon()} {name}
      </a>
    );
  }
});

module.exports = TaskFileDownloadComponent;
