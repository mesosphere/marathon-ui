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

    return {
      files: MesosStore.getTaskFiles(task.id)
    };
  },

  componentWillMount: function () {
    MesosStore.on(MesosEvents.CHANGE, this.onMesosChange);
  },

  componentDidMount: function () {
    var task = this.props.task;

    if (this.state.files == null) {
      MesosActions.requestTaskFiles(task.slaveId, task.id);
    }
  },

  componentWillUnmount: function () {
    MesosStore.removeListener(MesosEvents.CHANGE, this.onMesosChange);
  },

  onMesosChange() {
    var task = this.props.task;

    this.setState({
      files: MesosStore.getTaskFiles(task.id)
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
        .sortBy(app => app[sortKey], state.sortDescending)
        .map((file) => {
          var lastModifiedDate = new Date(file.mtime);
          var lastModifiedIsoString = lastModifiedDate.toISOString();
          var lastModifiedLocaleString = lastModifiedDate.toLocaleString();
          return (
            <tr key={file.path}>
              <td>
                <span>{file.name}</span>
                <a className="btn btn-default"
                    href={file.downloadURI}
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
                  {`${Util.filesize(file.size, 0)}`}
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

    return null;
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
