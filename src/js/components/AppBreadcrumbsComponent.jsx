var classNames = require("classnames");
var React = require("react/addons");

var AppBreadcrumbsComponent = React.createClass({
  displayName: "AppBreadcrumbsComponent",

  propTypes: {
    activeTaskId: React.PropTypes.string,
    activeViewIndex: React.PropTypes.number.isRequired,
    model: React.PropTypes.object.isRequired
  },

  getDefaultProps: function () {
    return {
      activeViewIndex: 0
    };
  },

  render: function () {
    var props = this.props;
    var model = props.model;
    var activeViewIndex = props.activeViewIndex;
    var appName = model.id;
    var appUri = "#apps/" + encodeURIComponent(model.id);

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
