var classNames = require("classnames");
var React = require("react/addons");

var AppHealthComponent = require("../components/AppHealthComponent");
var AppStatus = require("../constants/AppStatus");

var statusNameMapping = {
  [AppStatus.RUNNING]: "Running",
  [AppStatus.DEPLOYING]: "Deploying",
  [AppStatus.SUSPENDED]: "Suspended"
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

  getStatus: function () {
    var model = this.props.model;
    var status = "Running";

    if (model.deployments.length > 0) {
      status = "Deploying";
    } else if (model.instances === 0 && model.tasksRunning === 0) {
      status = "Suspended";
    }

    return status;
  },

  render: function () {
    var model = this.props.model;

    var runningTasksClassSet = classNames({
      "text-warning": model.tasksRunning !== model.instances
    });

    var statusClassSet = classNames({
      "text-warning": model.deployments.length > 0
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
        <td className="text-right">
          <span className={statusClassSet}>
            {statusNameMapping[model.status]}
          </span>
        </td>
      </tr>
    );
  }
});

module.exports = AppComponent;
