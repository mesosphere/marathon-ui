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
    model: React.PropTypes.object.isRequired
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
      "text-warning": this.isWarningStatus(),
      "text-danger": model.status === AppStatus.DELAYED
    });

    return (
      <span className={statusClassSet} title={this.getStatusTitle()}>
        {statusNameMapping[model.status]}
      </span>
    );
  }
});

module.exports = AppStatusComponent;
