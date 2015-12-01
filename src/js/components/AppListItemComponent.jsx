var classNames = require("classnames");
var React = require("react/addons");

var AppHealthComponent = require("../components/AppHealthComponent");
var AppListItemLabelsComponent =
  require("../components/AppListItemLabelsComponent");
var AppListViewTypes = require("../constants/AppListViewTypes");
var AppStatusComponent = require("../components/AppStatusComponent");
var BreadcrumbComponent = require("../components/BreadcrumbComponent");
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
    model: React.PropTypes.object.isRequired,
    viewType: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      viewType: AppListViewTypes.GROUPED_LIST
    };
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

  didPropsChange: function (nextProps) {
    var props = this.props;

    return props.viewType !== nextProps.viewType ||
      !Util.compareProperties(props.model, nextProps.model, "status",
      "tasksRunning", "health", "totalMem", "totalCpus", "instances", "labels");
  },

  handleResize: function () {
    requestAnimationFrame(this.updateNumberOfVisibleLabels);
  },

  updateNumberOfVisibleLabels: function () {
    var labels = this.props.model.labels;

    if (labels == null || Object.keys(labels).length === 0) {
      this.setState({numberOfVisibleLabels: 0});
      return;
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
    let labelNodes = React.findDOMNode(refs.labels).querySelectorAll(".label");

    // labelNodes is not an Array, but a NodeList
    [...labelNodes].forEach(label => {
      labelsWidth += DOMUtil.getOuterWidth(label);
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
    return (<i className="icon icon-small app" title="Application"></i>);
  },

  getLabels: function () {
    var labels = this.props.model.labels;
    if (labels == null || Object.keys(labels).length === 0) {
      return null;
    }

    var moreLabelClassName = classNames("badge more", {
      "visible": Object.keys(labels).length > this.state.numberOfVisibleLabels
    });

    return (
     <AppListItemLabelsComponent ref="labels"
          labels={this.props.model.labels}
          numberOfVisibleLabels={this.state.numberOfVisibleLabels}>
        <span className={moreLabelClassName} ref="moreLabel">
          &hellip;
        </span>
     </AppListItemLabelsComponent>
    );
  },

  handleBreadcrumbClick: function (event) {
    event.stopPropagation();
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

  getAppName: function () {
    var props = this.props;
    var model = props.model;

    if (props.viewType === AppListViewTypes.APP_LIST) {
      var groupId = model.id;
      var appName = PathUtil.getAppName(model.id);

      return (
        <td className="overflow-ellipsis name-cell global-app-list"
            title={model.id} ref="nameCell">
          <span className="name" ref="nameNode">
            {appName}
          </span>
          {this.getLabels()}
          <span className="group-id" onClick={this.handleBreadcrumbClick}>
            <span className="lead-in">in</span>
            <BreadcrumbComponent groupId={groupId} />
          </span>
        </td>
      );
    }

    let relativeAppName =
      PathUtil.getRelativePath(model.id, props.currentGroup);
    return (
      <td className="overflow-ellipsis name-cell"
          title={model.id} ref="nameCell">
        <span className="name" ref="nameNode">{relativeAppName}</span>
        {this.getLabels()}
      </td>
    );
  },

  render: function () {
    var props = this.props;
    var model = props.model;

    var className = classNames({
      "group": model.isGroup,
      "app": !model.isGroup
    });

    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr onClick={this.onClick} className={className}>
        <td className="icon-cell">
          {this.getIcon()}
        </td>
        {this.getAppName()}
        <td className="text-right total cpu-cell">
          {parseFloat(model.totalCpus).toFixed(1)}
        </td>
        <td className="text-right total ram">
          <span title={`${model.totalMem} MiB`}>
            {`${Util.filesize(model.totalMem * Math.pow(1024, 2), 0)}`}
          </span>
        </td>
        {this.getStatus()}
        <td className="text-right instances-cell" colSpan="2">
          <span>
            {model.tasksRunning}
          </span> of {model.instances}
        </td>
        {this.getHealthBar()}
      </tr>
    );
  }
});

module.exports = AppListItemComponent;
