var classNames = require("classnames");
var React = require("react/addons");

var AppHealthComponent = require("../components/AppHealthComponent");
var AppStatusComponent = require("../components/AppStatusComponent");
var Util = require("../helpers/Util");

var AppComponent = React.createClass({
  displayName: "AppComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  getLabels: function () {
    var labels = this.props.model.labels;
    if (labels == null) {
      return null;
    }

    let nodes = Object.keys(labels).sort().map(function (key) {
      if (key == null || Util.isEmptyString(key)) {
        return null;
      }

      let labelText = key;
      if (!Util.isEmptyString(labels[key])) {
        labelText = `${key}:${labels[key]}`;
      }

      return (
        <span className="label label-default">{labelText}</span>
      );
    });

    return (
      <div className="labels">
        {nodes}
      </div>
    );
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
        <td className="overflow-ellipsis appid" title={model.id}>
          {model.id}
          {this.getLabels()}
        </td>
        <td className="text-right total ram">
          {model.totalMem}
        </td>
        <td className="text-right total cpu">
          {model.totalCpus}
        </td>
        <td className="text-right running tak">
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
