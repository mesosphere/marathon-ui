var _ = require("underscore");
var classNames = require("classnames");
var React = require("react/addons");

var AppTypes = require("../constants/AppTypes");
var AppHealthComponent = require("../components/AppHealthComponent");
var AppStatusComponent = require("../components/AppStatusComponent");
var Util = require("../helpers/Util");
var PathUtil = require("../helpers/PathUtil");
var DOMUtil = require("../helpers/DOMUtil");

var AppListItemComponent = React.createClass({
  displayName: "AppListItemComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    currentGroup: React.PropTypes.string.isRequired,
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {numVisibleLabels: -1};
  },

  componentDidMount: function () {
    // Avoid referencing window from Node context
    if (global.window != null) {
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("focus", this.handleResize);
    }
    this.updateNumVisibleLabels();

  },

  componentDidUpdate: function (prevProps) {
    if (!_.isEqual(this.props, prevProps)) {
      this.updateNumVisibleLabels();
    }
  },

  componentWillUnmount: function () {
    if (global.window != null) {
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("focus", this.handleResize);
    }
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    if (nextState.numVisibleLabels === -1 && !this.props.model.isGroup) {
      this.updateNumVisibleLabels();
      return false;
    }
    return !_.isEqual(this.props, nextProps) ||
      !_.isEqual(this.state, nextState);
  },

  handleResize: function () {
    requestAnimationFrame(this.updateNumVisibleLabels);
  },

  updateNumVisibleLabels: function () {
    var labels = this.props.model.labels;
    if (labels == null || Object.keys(labels).length === 0) {
      return null;
    }
    let cellNode = this.getDOMNode().querySelector(".name-cell");
    let nameNode = cellNode.querySelector(".name");
    let moreNode = cellNode.querySelector(".more");
    let labelNodes = Array.prototype.slice.call(
      cellNode.querySelectorAll(".label"));
    let availableWidth = DOMUtil.getInnerWidth(cellNode);
    availableWidth -= DOMUtil.getOuterWidth(nameNode);
    availableWidth -= DOMUtil.getOuterWidth(moreNode);
    let labelsWidth = 0;
    let numVisibleLabels = 0;
    for (var i = 0, length = labelNodes.length; i < length; i++) {
      labelsWidth += DOMUtil.getOuterWidth(labelNodes[i]);
      if (labelsWidth > availableWidth) {
        break;
      }
      numVisibleLabels += 1;
    }
    this.setState({numVisibleLabels: numVisibleLabels});
  },

  getIcon: function () {
    var model = this.props.model;
    if (model.isGroup) {
      return (<i className="icon icon-small group"></i>);
    }
    if (model.type === AppTypes.DOCKER) {
      return (<i className="icon icon-small app-docker"></i>);
    }
    return (<i className="icon icon-small app-basic"></i>);
  },

  getLabels: function () {
    var labels = this.props.model.labels;
    if (labels == null || Object.keys(labels).length === 0) {
      return null;
    }
    let numVisibleLabels = this.state.numVisibleLabels;
    let nodes = Object.keys(labels).sort().map(function (key, i) {
      if (key == null || Util.isEmptyString(key)) {
        return null;
      }
      let labelText = key;
      if (!Util.isEmptyString(labels[key])) {
        labelText = `${key}:${labels[key]}`;
      }
      let labelClassName = classNames("label", {
        "visible": i < numVisibleLabels
      });
      return (
        <span key={i} className={labelClassName} title={labelText}>
          {labelText}
        </span>
      );
    });
    let moreLabelClassName = classNames("more", {
      "visible": Object.keys(labels).length > numVisibleLabels
    });
    return (
      <div className="labels">
        {nodes}
        <span className={moreLabelClassName}
          onClick={this.handleMoreLabelClick}>
          &hellip;
        </span>
      </div>
    );
  },

  handleMoreLabelClick: function (event) {
    event.stopPropagation();  // Prevent this.onClick being called
    this.context.router.transitionTo("appView", {
      appId: encodeURIComponent(this.props.model.id),
      view: "configuration"
    });
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
    var name = PathUtil.getRelativePath(model.id, this.props.currentGroup);

    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr onClick={this.onClick} className={className}>
        <td className="icon-cell">
          {this.getIcon()}
        </td>
        <td className="overflow-ellipsis name-cell" title={model.id}>
          <span className="name">{name}</span>
          {this.getLabels()}
        </td>
        <td className="text-right total cpu-cell">
          {parseFloat(model.totalCpus).toFixed(1)}
        </td>
        <td className="text-right total ram">
          <span title={`${model.totalMem} MiB`}>
            {`${Util.filesize(model.totalMem * Math.pow(1024, 2), 0)}`}
          </span>
        </td>
        {this.getStatus()}
        <td className="text-right instances-cell" colSpan={colSpan}>
          <span>
            {model.tasksRunning}
          </span> of {model.instances}
        </td>
        {this.getHealthBar()}
        <td className="text-right actions-cell">&hellip;</td>
      </tr>
    );
  }
});

module.exports = AppListItemComponent;
