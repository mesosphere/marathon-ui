var _ = require("underscore");
var classNames = require("classnames");
var React = require("react/addons");
var Link = require("react-router").Link;

var PathUtil = require("../helpers/PathUtil");
var StyleDimensions = require("../constants/StyleDimensions");
var PADDED_ICON_WIDTH = StyleDimensions.ICON_SIDE +
  StyleDimensions.BASE_SPACING_UNIT;

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
      expandedWidth: null
    };
  },

  componentDidMount: function () {
    // Avoid referencing window from Node context
    if (global.window != null) {
      window.addEventListener("resize", this.handleResize);
      window.addEventListener("focus", this.handleResize);
    }
  },

  componentDidUpdate: function () {
    this.updateDimensions();
  },

  componentWillUnmount: function () {
    if (global.window != null) {
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("focus", this.handleResize);
    }
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    if (nextState.availableWidth == null || nextState.expandedWidth == null) {
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

  handleResize: _.throttle(function () {
    var availableWidth = this.getAvailableWidth();
    // no need to update expanded width
    var expandedWidth = this.state.expandedWidth;
    this.setState({
      availableWidth: availableWidth,
      collapsed: expandedWidth >= availableWidth
    });
  }, 50),

  updateDimensions: function () {
    var availableWidth = this.getAvailableWidth();
    var expandedWidth = this.getExpandedWidth();
    // combine state updates where possible for performance
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

    // Hacky, but ensures that the dimension measurements are up-to-date
    _.defer(this.updateDimensions);

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
