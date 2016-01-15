import classNames from "classnames";
import React from "react/addons";
import {Link} from "react-router";

import PathUtil from "../helpers/PathUtil";

const COLLAPSE_BUFFER = 12;
const PADDED_ICON_WIDTH = 24; // 16px icon + 8px padding
const LAST_ITEM_OFFSET = 96; // Difference between scrollWidth and outerWidth

var BreadcrumbComponent = React.createClass({
  displayName: "BreadcrumbComponent",

  propTypes: {
    appId: React.PropTypes.string,
    groupId: React.PropTypes.string,
    taskId: React.PropTypes.string
  },

  getInitialState: function () {
    return {
      collapsed: false,
      availableWidth: null,
      expandedWidth: null,
      mutationObserver: null
    };
  },

  componentDidMount: function () {
    // Avoid referencing window from Node context
    if (global.window != null) {
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("focus", this.handleResize);
      this.startMutationObserver();
    }
  },

  componentDidUpdate: function () {
    this.updateDimensions();
  },

  componentWillUnmount: function () {
    if (global.window != null) {
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("focus", this.handleResize);
      this.stopMutationObserver();
    }
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    if (nextState.availableWidth == null || nextState.expandedWidth == null) {
      this.updateDimensions();
      return false;
    }
    if (this.state.collapsed !== nextState.collapsed) {
      return true;
    }
    return this.didPropsChange(nextProps);
  },

  didPropsChange: function (nextProps) {
    return nextProps.appId !== this.props.appId ||
      nextProps.groupId !== this.props.groupId ||
      nextProps.taskId !== this.props.taskId;
  },

  startMutationObserver: function () {
    if (window.MutationObserver == null) {
      return;
    }
    var mutationObserver = new MutationObserver(this.handleMutation);
    mutationObserver.observe(this.getDOMNode(), {
      attributes: true, childList: true
    });
    this.setState({mutationObserver: mutationObserver});
  },

  stopMutationObserver: function () {
    var mutationObserver = this.state.mutationObserver;
    if (mutationObserver == null) {
      return;
    }
    mutationObserver.disconnect();
  },

  handleMutation: function () {
    var expandedWidth = this.getExpandedWidth();
    this.setState({
      expandedWidth: expandedWidth,
      collapsed: this.shouldCollapse(this.state.availableWidth, expandedWidth)
    });
  },

  handleResize: function () {
    var availableWidth = this.getAvailableWidth();
    this.setState({
      availableWidth: availableWidth,
      collapsed: this.shouldCollapse(availableWidth, this.state.expandedWidth)
    });
  },

  updateDimensions: function () {
    var availableWidth = this.getAvailableWidth();
    var expandedWidth = this.getExpandedWidth();
    this.setState({
      availableWidth: availableWidth,
      expandedWidth: expandedWidth,
      collapsed: this.shouldCollapse(availableWidth, expandedWidth)
    });
  },

  getAvailableWidth: function () {
    return this.getDOMNode().offsetWidth;
  },

  getWidthFromExpandedItem: function (item) {
    return item.offsetWidth;
  },

  getWidthFromCollapsedItem: function (item) {
    var link = item.children[0];
    var textWidth = link.scrollWidth - link.offsetWidth;
    return textWidth + PADDED_ICON_WIDTH;
  },

  getExpandedWidth: function () {
    var listItems = this.getDOMNode().children;
    var collapsed = this.state.collapsed;

    // array/splat casts NodeList to array
    return [...listItems]
      .slice(0, -1)
      .map((item, n) => {
        var isFirstItem = n === 0;
        var isLastItem = n === listItems.length - 1;
        if (!collapsed || isFirstItem || isLastItem) {
          return this.getWidthFromExpandedItem(item);
        }
        return this.getWidthFromCollapsedItem(item);
      })
      .reduce((memo, width) => memo + width, this.getLastItemWidth());
  },

  getLastItemWidth: function () {
    var lastItem = this.getDOMNode().lastChild;
    var lastItemLink = lastItem.firstChild;
    return lastItemLink.scrollWidth + LAST_ITEM_OFFSET;
  },

  shouldCollapse: function (availableWidth, expandedWidth) {
    // Smooth collapse action to prevent flickering between states
    return this.state.collapsed
      ? expandedWidth >= availableWidth - COLLAPSE_BUFFER
      : expandedWidth >= availableWidth + COLLAPSE_BUFFER;
  },

  getGroupLinks: function () {
    var groupId = this.props.groupId;
    if (groupId == null) {
      return null;
    }

    var pathParts = groupId.split("/").slice(0, -1);
    return pathParts.map((name, i) => {
      var id = pathParts.slice(0, i + 1).join("/") + "/";
      return (
        <li key={id}>
          <Link to="group"
              params={{groupId: encodeURIComponent(id)}}
              title={name}>
            {name}
          </Link>
        </li>
      );
    }).slice(1);
  },

  getAppLink: function () {
    var appId = this.props.appId;
    var groupId = this.props.groupId;
    if (appId == null || groupId == null) {
      return null;
    }
    var name = PathUtil.getRelativePath(appId, groupId);

    return (
      <li>
        <Link to="app" params={{appId: encodeURIComponent(appId)}}>
          {name}
        </Link>
      </li>
    );
  },

  getTaskLink: function () {
    var appId = this.props.appId;
    var taskId = this.props.taskId;
    if (taskId == null || appId == null) {
      return null;
    }

    var params = {
      appId: encodeURIComponent(appId),
      view: encodeURIComponent(taskId)
    };

    return (
      <li>
        <Link to="appView" params={params}>
          {taskId}
        </Link>
      </li>
    );
  },

  render: function () {
    var classSet = classNames({
      breadcrumb: true,
      collapsed: this.state.collapsed
    });

    return (
      <ol className={classSet}>
        <li>
          <Link to="apps">Applications</Link>
        </li>
        {this.getGroupLinks()}
        {this.getAppLink()}
        {this.getTaskLink()}
      </ol>
    );
  }
});

export default BreadcrumbComponent;
