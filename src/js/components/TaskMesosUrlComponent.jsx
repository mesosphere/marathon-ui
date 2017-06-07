import React from "react/addons";

import InfoActions from "../actions/InfoActions";
import InfoEvents from "../events/InfoEvents";
import InfoStore from "../stores/InfoStore";

import ExecutorUtil from "../helpers/ExecutorUtil";

var TaskMesosUrlComponent = React.createClass({
  displayName: "TaskMesosUrlComponent",
  propTypes: {
    className: React.PropTypes.string,
    task: React.PropTypes.object.isRequired,
    text: React.PropTypes.string
  },

  getInitialState: function () {
    return {
      info: InfoStore.info
    };
  },

  componentDidMount: function () {
    InfoActions.requestInfo();
  },

  componentWillMount: function () {
    InfoStore.on(InfoEvents.CHANGE, this.onInfoChange);
  },

  componentWillUnmount: function () {
    InfoStore.removeListener(InfoEvents.CHANGE, this.onInfoChange);
  },

  onInfoChange: function () {
    this.setState({
      info: InfoStore.info
    });
  },

  buildUrl: function (task, info) {
    if (typeof task !== "undefined" && typeof info !== "undefined") {
      if (info.hasOwnProperty("marathon_config")) {
        var masterUrl = info.marathon_config.mesos_leader_ui_url;
        var frameworkId = info.frameworkId;
        if (masterUrl == null || task.slaveId == null) {
          return null;
        }
        masterUrl = masterUrl.replace(/\/?$/, "/");
        return [
          masterUrl,
          "#/slaves/",
          task.slaveId,
          "/frameworks/",
          frameworkId,
          "/executors/",
          ExecutorUtil.calculateExecutorId(task)
        ].join("");
      }
    }
  },

  render: function () {
    var info = this.state.info;
    var task = this.props.task;
    var text = this.props.text;
    var mesosTaskUrl = this.buildUrl(task, info);
    if (mesosTaskUrl == null) {
      return (
        <span className="text-muted">No link available</span>
      );
    }
    return (
      <a href={mesosTaskUrl} target="_blank">{text ? text : "link"}</a>
    );
  }
});

export default TaskMesosUrlComponent;
