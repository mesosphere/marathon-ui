var classNames = require("classnames");
var moment = require("moment");
var React = require("react/addons");

var AppStatus = require("../constants/AppStatus");
var QueueStore = require("../stores/QueueStore");
var Util = require("../helpers/Util");

var statusClassNameMapping = {
  [AppStatus.RUNNING]: "running",
  [AppStatus.DEPLOYING]: "deploying",
  [AppStatus.SUSPENDED]: "suspended",
  [AppStatus.DELAYED]: "delayed",
  [AppStatus.WAITING]: "waiting"
};

var statusNameMapping = {
  [AppStatus.RUNNING]: "Running",
  [AppStatus.DEPLOYING]: "Deploying",
  [AppStatus.SUSPENDED]: "Suspended",
  [AppStatus.DELAYED]: "Delayed",
  [AppStatus.WAITING]: "Waiting"
};

var AppStatusComponent = React.createClass({
  displayName: "AppStatusComponent",

  propTypes: {
    model: React.PropTypes.object.isRequired,
    showSummary: React.PropTypes.bool
  },

  shouldComponentUpdate: function (nextProps) {
    var props = this.props;

    return !Util.compareProperties(props.model, nextProps.model, "status",
        "tasksRunning", "instances") ||
      props.showSummary !== nextProps.showSummary;
  },

  getTasksSummary: function () {
    var props = this.props;
    if (props.showSummary !== true) {
      return null;
    }

    return (
      <span className="tasks-summary">
        {`(${props.model.tasksRunning} of ${props.model.instances} instances)`}
      </span>
    );
  },

  getStatusTitle: function () {
    var model = this.props.model;

    var executionDelay = QueueStore.getDelayByAppId(model.id);

    if (executionDelay) {
      return "Task execution failed, delayed for " +
        `${moment.duration(executionDelay, "seconds").humanize()}.`;
    } else if (model.status === AppStatus.WAITING) {
      return "Waiting for resource offer";
    }

    return null;
  },

  render: function () {
    var model = this.props.model;

    if (model.status == null) {
      return <span></span>;
    }

    var statusClassSet = classNames("app-status",
      statusClassNameMapping[model.status]);

    var iconClassSet = classNames("icon", "icon-mini",
      statusClassNameMapping[model.status]);

    return (
      <span className={statusClassSet} title={this.getStatusTitle()}>
        <i className={iconClassSet}></i>
        {statusNameMapping[model.status]}
        {this.getTasksSummary()}
      </span>
    );
  }
});

module.exports = AppStatusComponent;
