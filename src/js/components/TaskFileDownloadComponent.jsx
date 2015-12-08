var React = require("react/addons");
var classNames = require("classnames");

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

  componentWillMount: function () {
    MesosStore.on(MesosEvents.TASK_FILE_CHANGE, this.onMesosTaskFileChange);
  },

  componentWillUnmount: function () {
    MesosStore.removeListener(MesosEvents.TASK_FILE_CHANGE,
      this.onMesosTaskFileChange);
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

  onMesosTaskFileChange: function () {
    var file = this.getFile();
    var fileIsRequestedByUser = this.state.fileIsRequestedByUser;
    if (file != null && fileIsRequestedByUser) {
      window.open(file.downloadURI);
      fileIsRequestedByUser = false;
    }
    this.setState({
      file: file,
      fileIsRequestedByUser: fileIsRequestedByUser
    });
  },

  handleClick: function (event) {
    var file = this.state.file;
    if (file == null) {
      event.preventDefault();
      let task = this.props.task;
      MesosActions.requestTaskFiles(task.slaveId, task.id);
      this.setState({
        fileIsRequestedByUser: true
      });
    }
  },

  render: function () {
    var state = this.state;
    var props = this.props;
    var name = props.fileName;
    var file = state.file;

    if (!file || !file.downloadURI) {
      return (
        <span>&ndash;</span>
      );
    }

    let className = classNames("task-file-download", props.className, {
      "loading": state.fileIsRequestedByUser
    });

    return (
      <a className={className}
          href={file.downloadURI}
          onClick={this.handleClick}
          ref="download"
          download={name}>
        <i className="icon icon-mini file" /> {name}
      </a>
    );
  }
});

module.exports = TaskFileDownloadComponent;
