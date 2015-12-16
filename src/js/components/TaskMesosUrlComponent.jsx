var React = require("react/addons");

var InfoActions = require("../actions/InfoActions");
var InfoEvents = require("../events/InfoEvents");
var InfoStore = require("../stores/InfoStore");

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
          task.id
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

module.exports = TaskMesosUrlComponent;
