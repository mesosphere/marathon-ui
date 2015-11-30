var React = require("react/addons");
var classNames = require("classnames");
var lazy = require("lazy.js");

var Util = require("../helpers/Util");
var MesosActions = require("../actions/MesosActions");
var MesosEvents = require("../events/MesosEvents");
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
    this.setState({
      files: MesosStore.getTaskFiles(taskId)
    });
  },

  sortBy: function (sortKey) {
    var state = this.state;

    this.setState({
      sortKey: sortKey,
      sortDescending: state.sortKey === sortKey && !state.sortDescending
    });
  },

  getCaret: function (sortKey) {
    if (sortKey === this.state.sortKey) {
      return (
        <span className="caret"></span>
      );
    }
    return null;
  },

  getFileNodes: function () {
    var state = this.state;
    var files = state.files;
    var sortKey = state.sortKey;
    if (files != null) {
      return lazy(files)
        .sortBy((app) => {
          return app[sortKey];
        }, state.sortDescending)
        .map((file) => {
          let lastModifiedDate = new Date(file.mtime);
          let lastModifiedIsoString = lastModifiedDate.toISOString();
          let lastModifiedLocaleString = lastModifiedDate.toLocaleString();
          return (
            <tr key={file.path}>
              <td>
                <span>{file.name}</span>
                <a className="btn btn-default"
                  href={file.download}
                  download={`${lastModifiedIsoString}-${file.name}`}>
                  <i className="icon icon-mini file"/> Download
                </a>
              </td>
              <td>
                <span>{file.mode}</span>
              </td>
              <td>
                <span>{file.nlink}</span>
              </td>
              <td>
                <span>{file.uid}</span>
              </td>
              <td>
                <span>{file.gid}</span>
              </td>
              <td className="text-right">
                <span>
                  {`${Util.filesize(file.size * Math.pow(1024, 2), 0)}`}
                </span>
              </td>
              <td className="text-right">
                <time dateTime={lastModifiedIsoString}
                  title={lastModifiedIsoString}>
                  {lastModifiedLocaleString}
                </time>
              </td>
            </tr>
          );
        })
        .value();
    }
  },

  render: function () {
    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !this.state.sortDescending
    });
    return (
      <table className="table table-hover table-selectable task-file-list">
        <thead>
        <th>
          <span onClick={this.sortBy.bind(null, "name")}
            className={headerClassSet}>
                ID {this.getCaret("name")}
          </span>
        </th>
        <th>
          <span onClick={this.sortBy.bind(null, "mode")}
            className={headerClassSet}>
                Permissions {this.getCaret("mode")}
          </span>
        </th>
        <th>
          <span onClick={this.sortBy.bind(null, "nlink")}
            className={headerClassSet}>
                Nlink {this.getCaret("nlink")}
          </span>
        </th>
        <th>
          <span onClick={this.sortBy.bind(null, "uid")}
            className={headerClassSet}>
                Uid {this.getCaret("uid")}
          </span>
        </th>
        <th>
          <span onClick={this.sortBy.bind(null, "gid")}
            className={headerClassSet}>
                Gid {this.getCaret("gid")}
          </span>
        </th>
        <th className="text-right">
          <span onClick={this.sortBy.bind(null, "size")}
            className={headerClassSet}>
                Size {this.getCaret("size")}
          </span>
        </th>
        <th className="text-right">
           <span onClick={this.sortBy.bind(null, "mtime")}
             className={headerClassSet}>
                Last Modified {this.getCaret("mtime")}
          </span>
        </th>
        </thead>
        <tbody>
        {this.getFileNodes()}
        </tbody>
      </table>
    );
  }
});

module.exports = TaskFileListComponent;
