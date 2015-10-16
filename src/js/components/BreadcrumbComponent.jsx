var React = require("react/addons");
var Link = require("react-router").Link;

var ViewHelper = require("../helpers/ViewHelper");

var BreadcrumbComponent = React.createClass({
  displayName: "BreadcrumbComponent",

  propTypes: {
    appId: React.PropTypes.string,
    groupId: React.PropTypes.string,
    taskId: React.PropTypes.string
  },

  shouldComponentUpdate: function (nextProps) {
    return nextProps.app !== this.props.app ||
      nextProps.group !== this.props.group ||
      nextProps.task !== this.props.task;
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
          <Link to="group" params={{groupId: encodeURIComponent(id)}}>
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
    var name = ViewHelper.getRelativePath(appId, groupId);

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
    return (
      <ol className="breadcrumb">
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
