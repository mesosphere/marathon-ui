var classNames = require("classnames");
var moment = require("moment");
var React = require("react/addons");

var AppHealthComponent = require("../components/AppHealthComponent");
var AppStatus = require("../constants/AppStatus");
var QueueStore = require("../stores/QueueStore");

var statusNameMapping = {
  [AppStatus.RUNNING]: "Running",
  [AppStatus.DEPLOYING]: "Deploying",
  [AppStatus.SUSPENDED]: "Suspended",
  [AppStatus.DELAYED]: "Delayed",
  [AppStatus.WAITING]: "Waiting"
};

var AppComponent = React.createClass({
  displayName: "AppComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  onClick: function () {
    this.context.router
      .transitionTo("app", {appid: encodeURIComponent(this.props.model.id)});
  },

  isWarningStatus: function () {
    var model = this.props.model;

    return model.status === AppStatus.DEPLOYING
      || model.status === AppStatus.WAITING;
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

    var runningTasksClassSet = classNames({
      "text-warning": model.tasksRunning !== model.instances
    });

    var statusClassSet = classNames({
      "text-warning": this.isWarningStatus(),
      "text-danger": model.status === AppStatus.DELAYED
    });

    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr onClick={this.onClick}>
        <td className="overflow-ellipsis" title={model.id}>
          {model.id}
        </td>
        <td className="text-right">{model.mem}</td>
        <td className="text-right">{model.cpus}</td>
        <td className="text-right">
          <span className={runningTasksClassSet}>
            {model.tasksRunning}
          </span> / {model.instances}
        </td>
        <td className="text-right health-bar-column">
          <AppHealthComponent model={model} />
        </td>
        <td className="text-right" title={this.getStatusTitle()}>
          <span className={statusClassSet}>
            {statusNameMapping[model.status]}
          </span>
        </td>
      </tr>
    );
  }
});

module.exports = AppComponent;
