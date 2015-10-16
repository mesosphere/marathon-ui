var classNames = require("classnames");
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
    currentGroup: React.PropTypes.string.isRequired,
    model: React.PropTypes.object.isRequired
  },

  getLabels: function () {
    var labels = this.props.model.labels;
    if (labels == null || Object.keys(labels).length === 0) {
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
        <span key={i} className="label" title={labelText}>
          {labelText}
        </span>
      );
    });

    return (
      <div className="labels">
        {nodes}
        <span className="label more">&hellip;</span>
      </div>
    );
  },

  onClick: function () {
    var model = this.props.model;
    var router = this.context.router;
    if (model.isGroup) {
      router.transitionTo("group", {groupId: encodeURIComponent(model.id)});
    } else {
      router.transitionTo("app", {appId: encodeURIComponent(model.id)});
    }
  },

  getHealthBar: function () {
    var model = this.props.model;
    if (model.isGroup) {
      return null;
    }

    return (
      <td className="text-right health-bar-column">
        <AppHealthComponent model={model} />
      </td>
    );
  },

  getStatus: function () {
    var model = this.props.model;
    if (model.isGroup) {
      return null;
    }

    return (
      <td className="text-right status">
        <AppStatusComponent model={model} />
      </td>
    );
  },

  render: function () {
    var model = this.props.model;
    var className = classNames({
      "group": model.isGroup,
      "app": !model.isGroup
    });
    var colSpan = model.isGroup ? 3 : 1;
    var name = ViewHelper.getRelativePath(model.id, this.props.currentGroup);

    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr onClick={this.onClick} className={className}>
        <td className="overflow-ellipsis name" title={model.id}>
          <span>{name}</span>
          {this.getLabels()}
        </td>
        <td className="text-right total cpu">
          {parseFloat(model.totalCpus).toFixed(1)}
        </td>
        <td className="text-right total ram">
          <span title={`${model.totalMem} MiB`}>
            {`${Util.filesize(model.totalMem * Math.pow(1024, 2), 0)}`}
          </span>
        </td>
        {this.getStatus()}
        <td className="text-right running tasks" colSpan={colSpan}>
          <span>
            {model.tasksRunning}
          </span> of {model.instances}
        </td>
        {this.getHealthBar()}
        <td className="text-right actions">&hellip;</td>
      </tr>
    );
  }
});

module.exports = AppListItemComponent;
