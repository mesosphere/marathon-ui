var _ = require("underscore");
var React = require("react/addons");
var Link = require("react-router").Link;

var CollapsibleLinkComponent = require("./CollapsibleLinkComponent");
var PathUtil = require("../helpers/PathUtil");

var BreadcrumbComponent = React.createClass({
  displayName: "BreadcrumbComponent",

  propTypes: {
    appId: React.PropTypes.string,
    groupId: React.PropTypes.string,
    taskId: React.PropTypes.string
  },

  getInitialState: function () {
    return {
      collapsed: false
    };
  },

  componentDidMount: function () {
    // Avoid referencing window from Node context
    if (global.window != null) {
      window.addEventListener("resize", this.handleResize);
    }
    this.handleResize();
  },

  componentDidUpdate: function () {
    this.measureOffsetWidth();
    this.measureInnerWidth();
  },

  componentWillUnmount: function () {
    if (global.window != null) {
      window.removeEventListener("resize", this.handleResize);
    }
  },

  shouldComponentUpdate: function (nextProps) {
    var state = this.state;
    if (state.innerWidth == null || state.offsetWidth == null) {
      this.measureOffsetWidth();
      this.measureInnerWidth();
    }
    var collapsed = state.innerWidth > state.offsetWidth;
    if (collapsed !== state.collapsed) {
      this.setState({collapsed: collapsed});
      return true;
    }
    return this.didPropsChange(nextProps);
  },

  didPropsChange: function (nextProps) {
    return nextProps.appId !== this.props.appId ||
      nextProps.groupId !== this.props.groupId ||
      nextProps.taskId !== this.props.taskId;
  },

  handleResize: _.debounce(function () {
    this.measureOffsetWidth();
  }, 50),

  measureOffsetWidth: function () {
    var domNode = this.getDOMNode();
    this.setState({
      offsetWidth: domNode.offsetWidth
    });
  },

  measureInnerWidth: function () {
    if (this.state.collapsed) {
      return;
    }
    var domNode = this.getDOMNode();
    var listItems = domNode.children;
    var innerWidth = Object.values(listItems)
      .map((item) => item.offsetWidth)
      .reduce((memo, width) => memo + width, 0);

    this.setState({
      innerWidth: innerWidth
    });
  },

  getGroupLinks: function (collapse, collapseLast) {
    var groupId = this.props.groupId;
    if (groupId == null) {
      return null;
    }

    var pathParts = groupId.split("/").slice(0, -1);
    return pathParts.map((name, i) => {
      var id = pathParts.slice(0, i + 1).join("/") + "/";
      var isLast = i === pathParts.length - 1;
      var collapseLink = isLast
        ? collapse && collapseLast
        : collapse;

      return (
        <li key={id}>
          <CollapsibleLinkComponent to="group"
              params={{groupId: encodeURIComponent(id)}}
              collapse={collapseLink}>
            {name}
          </CollapsibleLinkComponent>
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
    var state = this.state;
    var collapseLastGroup = state.app != null || state.task != null;

    return (
      <ol className="breadcrumb">
        <li>
          <Link to="apps">Applications</Link>
        </li>
        {this.getGroupLinks(state.collapsed, collapseLastGroup)}
        {this.getAppLink()}
        {this.getTaskLink()}
      </ol>
    );
  }
});

module.exports = BreadcrumbComponent;
