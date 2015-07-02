var classNames = require("classnames");
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

  render: function () {
    var props = this.props;
    var activeViewIndex = props.activeViewIndex;
    var appName = props.appId;
    var appUri = "#apps/" + encodeURIComponent(props.appId);

    var taskName;
    if (activeViewIndex === 1 && props.activeTaskId != null) {
      taskName = props.activeTaskId;
    }

    var activeAppClassSet = classNames({
      "active": true,
      "hidden": activeViewIndex === 1
    });
    var inactiveAppClassSet = classNames({
      "hidden": activeViewIndex === 0
    });
    var taskClassSet = classNames({
      "active": true,
      "hidden": activeViewIndex === 0
    });

    return (
      <ol className="breadcrumb">
        <li>
          <a href="#apps">Apps</a>
        </li>
        <li className={activeAppClassSet}>
          {appName}
        </li>
        <li className={inactiveAppClassSet}>
          <a href={appUri}>
            {appName}
          </a>
        </li>
        <li className={taskClassSet}>
          {taskName}
        </li>
      </ol>
    );
  }
});

module.exports = AppBreadcrumbsComponent;
