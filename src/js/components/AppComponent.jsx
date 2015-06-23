var classNames = require("classnames");
var React = require("react/addons");

var AppHealthComponent = require("../components/AppHealthComponent");
var AppStatus = require("../constants/AppStatus");

var statusNameMapping = {};
statusNameMapping[AppStatus.RUNNING] = "Running";
statusNameMapping[AppStatus.DEPLOYING] = "Deploying";
statusNameMapping[AppStatus.SUSPENDED] = "Suspended";

var AppComponent = React.createClass({
  displayName: "AppComponent",

  propTypes: {
    model: React.PropTypes.object.isRequired,
    router: React.PropTypes.object.isRequired
  },

  onClick: function () {
    var props = this.props;

    props.router.navigate(
      "apps/" + encodeURIComponent(props.model.id),
      {trigger: true}
    );
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
