var classNames = require("classnames");
var moment = require("moment");
var React = require("react/addons");

var AppStatus = require("../constants/AppStatus");
var QueueStore = require("../stores/QueueStore");

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

  getTasksSummary: function () {
    var props = this.props;
    if (props.showSummary !== true) {
      return null;
    }

    return (
      <span className="tasks-summary">
        {`(${props.model.tasksRunning} of ${props.model.instances} tasks)`}
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

  isWarningStatus: function () {
    var model = this.props.model;

    return model.status === AppStatus.DEPLOYING
      || model.status === AppStatus.WAITING;
  },

  render: function () {
    var model = this.props.model;

    var statusClassSet = classNames({
      "app-status": true,
      "text-warning": this.isWarningStatus(),
      "text-danger": model.status === AppStatus.DELAYED
    });

    var iconClassSet = classNames("icon", "icon-mini",
      `icon-${statusNameMapping[model.status].toLowerCase()}`);

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
