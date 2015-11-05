var classNames = require("classnames");
var React = require("react/addons");

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
    return {
      numberOfVisibleLabels: -1
    };
  },

  componentDidMount: function () {
    // Avoid referencing window from Node context
    if (global.window != null) {
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("focus", this.handleResize);
    }
    this.updateNumberOfVisibleLabels();

  },

  componentDidUpdate: function (prevProps) {
    if (this.didPropsChange(prevProps)) {
      this.updateNumberOfVisibleLabels();
    }
  },

  componentWillUnmount: function () {
    if (global.window != null) {
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("focus", this.handleResize);
    }
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    if (nextState.numberOfVisibleLabels === -1 && !this.props.model.isGroup) {
      this.updateNumberOfVisibleLabels();
      return false;
    }

    if (this.state.numberOfVisibleLabels !== nextState.numberOfVisibleLabels) {
      return true;
    }

    return this.didPropsChange(nextProps);
  },

  didPropsChange: function (newProps) {
    return !Util.compareProperties(this.props.model, newProps.model, "status",
      "tasksRunning", "health", "totalMem", "totalCpus", "instances", "labels");
  },

  handleResize: function () {
    requestAnimationFrame(this.updateNumberOfVisibleLabels);
  },

  updateNumberOfVisibleLabels: function () {
    var labels = this.props.model.labels;

    if (labels == null || Object.keys(labels).length === 0) {
      return null;
    }

    let refs = this.refs;

    let cellNode = React.findDOMNode(refs.nameCell);
    let nameNode = React.findDOMNode(refs.nameNode);
    let moreNode = React.findDOMNode(refs.moreLabel);

    let availableWidth = DOMUtil.getInnerWidth(cellNode) -
      DOMUtil.getOuterWidth(nameNode) -
      DOMUtil.getOuterWidth(moreNode);

    let labelsWidth = 0;
    let numberOfVisibleLabels = 0;

    refs.labels.props.children[0].find((label) => {
      labelsWidth += DOMUtil.getOuterWidth(React.findDOMNode(refs[label.ref]));
      if (labelsWidth > availableWidth) {
        return true;
      }
      numberOfVisibleLabels++;
    });

    this.setState({numberOfVisibleLabels: numberOfVisibleLabels});
  },

  getIcon: function () {
    var model = this.props.model;
    if (model.isGroup) {
      return (<i className="icon icon-small group"></i>);
    }
    return (<i className="icon icon-small app" title="Basic"></i>);
  },

  getLabels: function () {
    var labels = this.props.model.labels;

    if (labels == null || Object.keys(labels).length === 0) {
      return null;
    }

    let numberOfVisibleLabels = this.state.numberOfVisibleLabels;
    let nodes = Object.keys(labels).sort().map(function (key, i) {
      if (key == null || Util.isEmptyString(key)) {
        return null;
      }

      let labelText = key;
      if (!Util.isEmptyString(labels[key])) {
        labelText = `${key}:${labels[key]}`;
      }

      let labelClassName = classNames("label", {
        "visible": i < numberOfVisibleLabels
      });

      return (
        <span key={i} className={labelClassName} title={labelText}
            ref={`label${i}`}>
          {labelText}
        </span>
      );
    });

    let moreLabelClassName = classNames("more", {
      "visible": Object.keys(labels).length > numberOfVisibleLabels
    });

    return (
      <div className="labels" ref="labels">
        {nodes}
        <span className={moreLabelClassName}
            onClick={this.handleMoreLabelClick}
            ref="moreLabel">
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
      let query = router.getCurrentQuery();
      let param = {
        groupId: encodeURIComponent(model.id)
      };
      router.transitionTo("group", param, query);
    } else {
      router.transitionTo("app", {appId: encodeURIComponent(model.id)});
    }
  },

  getHealthBar: function () {
    return (
      <td className="text-right health-bar-column">
        <AppHealthComponent model={this.props.model} />
      </td>
    );
  },

  getStatus: function () {
    return (
      <td className="text-right status">
        <AppStatusComponent model={this.props.model} />
      </td>
    );
  },

  render: function () {
    var model = this.props.model;

    var className = classNames({
      "group": model.isGroup,
      "app": !model.isGroup
    });

    var name = PathUtil.getRelativePath(model.id, this.props.currentGroup);

    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr onClick={this.onClick} className={className}>
        <td className="icon-cell">
          {this.getIcon()}
        </td>
        <td className="overflow-ellipsis name-cell" title={model.id}
            ref="nameCell">
          <span className="name" ref="nameNode">{name}</span>
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
        <td className="text-right instances-cell">
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