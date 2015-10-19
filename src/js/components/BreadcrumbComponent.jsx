var _ = require("underscore");
var classNames = require("classnames");
var React = require("react/addons");
var Link = require("react-router").Link;

var PathUtil = require("../helpers/PathUtil");

var PADDED_ICON_WIDTH = 24; // 16px icon + 8px padding

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

  handleMutation: _.throttle(function () {
    this.updateDimensions(false, true);
  }),

  handleResize: _.throttle(function () {
    this.updateDimensions(true, false);
  }, 50),

  updateDimensions: function (updateAvailableWidth = true,
                              updateExpandedWidth = true) {
    var state = this.state;
    var availableWidth = updateAvailableWidth
      ? this.getAvailableWidth()
      : state.availableWidth;
    var expandedWidth = updateExpandedWidth
      ? this.getExpandedWidth()
      : state.expandedWidth;

    // combine state updates for best performance
    this.setState({
      availableWidth: availableWidth,
      expandedWidth: expandedWidth,
      collapsed: expandedWidth >= availableWidth
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

    return Object.values(listItems)
      .map((item, n) => {
        var isFirstItem = n === 0;
        var isLastItem = n === listItems.length - 1;
        if (!collapsed || isFirstItem || isLastItem) {
          return this.getWidthFromExpandedItem(item);
        }
        return this.getWidthFromCollapsedItem(item);
      })
      .reduce((memo, width) => memo + width, 0);
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

module.exports = BreadcrumbComponent;
