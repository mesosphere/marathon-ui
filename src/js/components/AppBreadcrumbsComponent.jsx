var React = require("react/addons");

var AppBreadcrumbsComponent = React.createClass({
  displayName: "AppBreadcrumbsComponent",

  propTypes: {
    activeTaskId: React.PropTypes.string,
    activeViewIndex: React.PropTypes.number.isRequired,
    appId: React.PropTypes.string.isRequired
  },

  getDefaultProps: function () {
    return {
      activeViewIndex: 0
    };
  },

  getAppName: function () {
    var props = this.props;
    var activeViewIndex = props.activeViewIndex;
    var appName = props.appId;
    var appUri = "#apps/" + encodeURIComponent(props.appId);

    if (activeViewIndex === 1) {
      return (
        <li>
          <a href={appUri}>
            {appName}
          </a>
        </li>
      );
    }

    return (
      <li className="active">
        {appName}
      </li>
    );
  },

  getTaskName: function () {
    var props = this.props;
    var activeViewIndex = props.activeViewIndex;

    if (activeViewIndex === 0) {
      return null;
    }

    let taskName;
    if (activeViewIndex === 1 && props.activeTaskId != null) {
      taskName = props.activeTaskId;
    }
    return (
      <li className="active">{taskName}</li>
    );
  },

  render: function () {
    return (
      <ol className="breadcrumb">
        <li>
          <a href="#apps">Apps</a>
        </li>
        {this.getAppName()}
        {this.getTaskName()}
      </ol>
    );
  }
});

module.exports = AppBreadcrumbsComponent;
