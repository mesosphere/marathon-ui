import React from "react/addons";
import classNames from "classnames";
import lazy from "lazy.js";

import Util from "../helpers/Util";
import MesosActions from "../actions/MesosActions";
import MesosEvents from "../events/MesosEvents";
import MesosStore from "../stores/MesosStore";

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

  getDownloadButton: function (file) {
    if (file == null || /^d/.test(file.mode)) {
      return null;
    }

    return (
      <a className="btn btn-default" href={file.downloadURI}>
        <i className="icon icon-mini file"/> Download
      </a>
    );
  },

  getFileNodes: function () {
    var state = this.state;
    var files = state.files;
    var sortKey = state.sortKey;

    var idClassSet = classNames({
      "cell-highlighted": sortKey === "name"
    });

    var modeClassSet = classNames({
      "cell-highlighted": sortKey === "mode"
    });

    var nlinkClassSet = classNames({
      "cell-highlighted": sortKey === "nlink"
    });

    var uidClassSet = classNames({
      "cell-highlighted": sortKey === "uid"
    });

    var gidClassSet = classNames({
      "cell-highlighted": sortKey === "gid"
    });

    var sizeClassSet = classNames("text-right", {
      "cell-highlighted": sortKey === "size"
    });

    var mtimeClassSet = classNames("text-right", {
      "cell-highlighted": sortKey === "mtime"
    });

    if (files != null) {
      return lazy(files)
        .sortBy(app => app[sortKey], state.sortDescending)
        .map(file => {
          var lastModifiedDate = new Date(file.mtime);
          var lastModifiedIsoString = lastModifiedDate.toISOString();
          return (
            <tr key={file.path}>
              <td className={idClassSet}>
                <span>{file.name}</span>
                {this.getDownloadButton(file)}
              </td>
              <td className={modeClassSet}>
                <span>{file.mode}</span>
              </td>
              <td className={nlinkClassSet}>
                <span>{file.nlink}</span>
              </td>
              <td className={uidClassSet}>
                <span>{file.uid}</span>
              </td>
              <td className={gidClassSet}>
                <span>{file.gid}</span>
              </td>
              <td className={sizeClassSet}>
                <span>
                  {`${Util.filesize(file.size, 0)}`}
                </span>
              </td>
              <td className={mtimeClassSet}>
                <time dateTime={lastModifiedIsoString}
                    title={lastModifiedIsoString}>
                  {lastModifiedDate.toLocaleString()}
                </time>
              </td>
            </tr>
          );
        })
        .value();
    }

    return (
      <tr>
        <td colSpan="7" className="text-center">
          Currently no files available
        </td>
      </tr>
    );
  },

  render: function () {
    var state = this.state;
    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !this.state.sortDescending
    });

    var idClassSet = classNames({
      "cell-highlighted": state.sortKey === "name"
    });

    var modeClassSet = classNames({
      "cell-highlighted": state.sortKey === "mode"
    });

    var nlinkClassSet = classNames({
      "cell-highlighted": state.sortKey === "nlink"
    });

    var uidClassSet = classNames({
      "cell-highlighted": state.sortKey === "uid"
    });

    var gidClassSet = classNames({
      "cell-highlighted": state.sortKey === "gid"
    });

    var sizeClassSet = classNames("text-right", {
      "cell-highlighted": state.sortKey === "size"
    });

    var mtimeClassSet = classNames("text-right", {
      "cell-highlighted": state.sortKey === "mtime"
    });

    return (
      <table className="table table-hover table-selectable task-file-list">
        <thead>
          <th className={idClassSet}>
            <span onClick={this.sortBy.bind(null, "name")}
                className={headerClassSet}>
              ID {this.getCaret("name")}
            </span>
          </th>
          <th className={modeClassSet}>
            <span onClick={this.sortBy.bind(null, "mode")}
                className={headerClassSet}>
              Permissions {this.getCaret("mode")}
            </span>
          </th>
          <th className={nlinkClassSet}>
            <span onClick={this.sortBy.bind(null, "nlink")}
                className={headerClassSet}>
              Nlink {this.getCaret("nlink")}
            </span>
          </th>
          <th className={uidClassSet}>
            <span onClick={this.sortBy.bind(null, "uid")}
                className={headerClassSet}>
              Uid {this.getCaret("uid")}
            </span>
          </th>
          <th className={gidClassSet}>
            <span onClick={this.sortBy.bind(null, "gid")}
                className={headerClassSet}>
              Gid {this.getCaret("gid")}
            </span>
          </th>
          <th className={sizeClassSet}>
            <span onClick={this.sortBy.bind(null, "size")}
                className={headerClassSet}>
              Size {this.getCaret("size")}
            </span>
          </th>
          <th className={mtimeClassSet}>
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

export default TaskFileListComponent;
