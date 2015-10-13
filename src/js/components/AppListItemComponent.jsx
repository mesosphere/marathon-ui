var React = require("react/addons");

var AppHealthComponent = require("../components/AppHealthComponent");
var AppStatusComponent = require("../components/AppStatusComponent");
var Util = require("../helpers/Util");
var ViewHelper = require("../helpers/ViewHelper");

var AppListItemComponent = React.createClass({
  displayName: "AppListItemComponent",

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

    let nodes = Object.keys(labels).sort().map(function (key, i) {
      if (key == null || Util.isEmptyString(key)) {
        return null;
      }

      let labelText = key;
      if (!Util.isEmptyString(labels[key])) {
        labelText = `${key}:${labels[key]}`;
      }

      return (
        <span key={i} className="label label-default" title={labelText}>
          {labelText}
        </span>
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

  getHealthBar: function () {
    var model = this.props.model;
    return (
      <td className="text-right health-bar-column">
        <AppHealthComponent model={model} />
      </td>
    );
  },

  getStatus: function () {
    var model = this.props.model;
    return (
      <td className="text-right status">
        <AppStatusComponent model={model} />
      </td>
    );
  },

  render: function () {
    var model = this.props.model;
    var status = null;
    var healthBar = null;
    var colSpan = 3;
    var className = "group";

    if (model.isGroup !== true) {
      className = "app";
      status = this.getStatus();
      healthBar = this.getHealthBar();
      colSpan = 1;
    }

    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr onClick={this.onClick} className={className}>
        <td className="overflow-ellipsis name" title={model.id}>
          <span>{model.id}</span>
          {this.getLabels()}
        </td>
        <td className="text-right total cpu">
          {parseFloat(model.totalCpus).toFixed(1)}
        </td>
        <td className="text-right total ram">
          <span title={`${model.totalMem}MB`}>
            {`${ViewHelper.convertMegabytesToString(model.totalMem)}`}
          </span>
        </td>
        {status}
        <td className="text-right running tasks" colSpan={colSpan}>
          <span>
            {model.tasksRunning}
          </span> of {model.instances}
        </td>
        {healthBar}
        <td className="text-right actions">&hellip;</td>
      </tr>
    );
  }
});

module.exports = AppListItemComponent;
