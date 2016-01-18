import classNames from "classnames";
import React from "react/addons";
import OnClickOutsideMixin from "react-onclickoutside";

import AppActionsHandlerMixin from "../mixins/AppActionsHandlerMixin";
import AppHealthBarWithTooltipComponent
  from "./AppHealthBarWithTooltipComponent";
import AppListItemLabelsComponent
  from "../components/AppListItemLabelsComponent";
import AppListViewTypes from "../constants/AppListViewTypes";
import AppStatus from "../constants/AppStatus";
import AppStatusComponent from "../components/AppStatusComponent";
import BreadcrumbComponent from "../components/BreadcrumbComponent";
import Util from "../helpers/Util";
import PathUtil from "../helpers/PathUtil";
import PopoverComponent from "./PopoverComponent";
import DOMUtil from "../helpers/DOMUtil";

var AppListItemComponent = React.createClass({
  displayName: "AppListItemComponent",

  mixins: [
    AppActionsHandlerMixin,
    OnClickOutsideMixin
  ],

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
      isActionsDropdownActivated: false,
      numberOfVisibleLabels: -1,
      actionsDropdownTopAligned: false
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

    if (this.state.isActionsDropdownActivated !==
        nextState.isActionsDropdownActivated) {
      return true;
    }

    if (this.state.actionsDropdownTopAligned !==
        nextState.actionsDropdownTopAligned) {
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

  handleActionsClick: function (event) {
    event.stopPropagation();
    event.preventDefault();

    this.setState({
      isActionsDropdownActivated: !this.state.isActionsDropdownActivated
    });
  },

  handleAppRowClick: function () {
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

  handleBreadcrumbClick: function (event) {
    event.stopPropagation();
  },

  handleClickOutside: function () {
    this.setState({
      isActionsDropdownActivated: false
    });
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
    let labelNodes = React.findDOMNode(refs.labels).querySelectorAll(".badge");

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

  getActionsCell: function () {
    return (
      <td className="actions-cell" title="More Actions"
          onClick={this.handleActionsClick}>
        <i className="icon icon-mini dots"></i>
        {this.getDropdownMenu()}
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

  getDropdownMenu: function () {
    let model = this.props.model;

    let disabledClassSet = classNames({
      "disabled": model.instances < 1
    });

    let resetDelayClassSet = classNames({
      "hidden": model.status !== AppStatus.DELAYED
    });

    if (this.props.model.isGroup) {
      return (
        <PopoverComponent visible={this.state.isActionsDropdownActivated}
            className="dropdown" ref="dropdown">
          <ul className="dropdown-menu" ref="dropdown-menu">
            <li className={disabledClassSet}>
              <a href="#" onClick={this.handleScaleGroup}>
                Scale By
              </a>
            </li>
            <li className={disabledClassSet}>
              <a href="#" onClick={this.handleSuspendGroup}>
                Suspend
              </a>
            </li>
            <li>
              <a href="#" onClick={this.handleDestroyGroup}>
                <span className="text-danger">Destroy</span>
              </a>
            </li>
          </ul>
        </PopoverComponent>
      );
    }

    return (
      <PopoverComponent visible={this.state.isActionsDropdownActivated}
          className="dropdown" ref="dropdown">
        <ul className="dropdown-menu" ref="dropdown-menu">
          <li>
            <a href="#" onClick={this.handleScaleApp}>
              Scale
            </a>
          </li>
          <li>
            <a href="#" onClick={this.handleRestartApp}>
              Restart
            </a>
          </li>
          <li className={disabledClassSet}>
            <a href="#" onClick={this.handleSuspendApp}>
              Suspend
            </a>
          </li>
          <li className={resetDelayClassSet}>
            <a href="#" onClick={this.handleResetDelay}>
              Reset Delay
            </a>
          </li>
          <li>
            <a href="#" onClick={this.handleDestroyApp}>
              <span className="text-danger">Destroy</span>
            </a>
          </li>
        </ul>
      </PopoverComponent>
    );
  },

  getHealthBar: function () {
    return (
      <td className="text-right health-bar-column">
        <AppHealthBarWithTooltipComponent model={this.props.model} />
      </td>
    );
  },

  getIcon: function () {
    var model = this.props.model;
    if (model.isGroup) {
      return <i className="icon icon-small group"></i>;
    }
    return <i className="icon icon-small app" title="Application"></i>;
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

  getStatus: function () {
    return (
      <td className="text-right status">
        <AppStatusComponent model={this.props.model} />
      </td>
    );
  },

  render: function () {
    var props = this.props;
    var model = props.model;

    var rowTypeClassName = classNames({
      "group": model.isGroup,
      "app": !model.isGroup
    });

    return (
      <tr onClick={this.handleAppRowClick} className={rowTypeClassName}>
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
        <td className="text-right instances-cell">
          <span>
            {model.tasksRunning}
          </span> of {model.instances}
        </td>
        {this.getHealthBar()}
        {this.getActionsCell()}
      </tr>
    );
  }
});

export default AppListItemComponent;
