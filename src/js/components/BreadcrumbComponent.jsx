var React = require("react/addons");
var Link = require("react-router").Link;

var ViewHelper = require("../helpers/ViewHelper");

var BreadcrumbComponent = React.createClass({
  displayName: "BreadcrumbComponent",

  propTypes: {
    app: React.PropTypes.string,
    group: React.PropTypes.string,
    task: React.PropTypes.string
  },

  shouldComponentUpdate: function (nextProps) {
    return nextProps.app !== this.props.app ||
      nextProps.group !== this.props.group ||
      nextProps.task !== this.props.task;
  },

  getGroupLinks: function () {
    var group = this.props.group;
    if (group == null) {
      return null;
    }

    var pathParts = group.split("/").slice(0, -1);
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
    var app = this.props.app;
    var group = this.props.group;
    if (app == null || group == null) {
      return null;
    }
    var name = ViewHelper.getRelativePath(app, group);

    return (
      <li>
        <Link to="app" params={{appId: encodeURIComponent(app)}}>
          {name}
        </Link>
      </li>
    );
  },

  getTaskLink: function () {
    var app = this.props.app;
    var group = this.props.group;
    var task = this.props.task;
    if (task == null || app == null || group == null) {
      return null;
    }

    var params = {
      appId: encodeURIComponent(app),
      view: encodeURIComponent(task)
    };

    return (
      <li>
        <Link to="appView" params={params}>
          {task}
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
