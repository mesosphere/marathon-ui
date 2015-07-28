var classNames = require("classnames");
var React = require("react/addons");

var AppHealthComponent = require("../components/AppHealthComponent");
var AppStatusComponent = require("../components/AppStatusComponent");

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
      .transitionTo("app", {appId: encodeURIComponent(this.props.model.id)});
  },

  render: function () {
    var model = this.props.model;

    var runningTasksClassSet = classNames({
      "text-warning": model.tasksRunning !== model.instances
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
          <AppStatusComponent model={model} />
        </td>
      </tr>
    );
  }
});

module.exports = AppComponent;
