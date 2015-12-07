var classNames = require("classnames");
var React = require("react/addons");

var HealthStatus = require("../constants/HealthStatus");

var healthStatusLabels = {
  [HealthStatus.HEALTHY]: "Healthy",
  [HealthStatus.UNHEALTHY]: "Unhealthy",
  [HealthStatus.UNKNOWN]: "Unknown",
  [HealthStatus.STAGED]: "Staged",
  [HealthStatus.OVERCAPACITY]: "Over Capacity",
  [HealthStatus.UNSCHEDULED]: "Unscheduled"
};

var AppHealthDetailComponent = React.createClass({
  displayName: "AppHealthDetailComponent",

  propTypes: {
    className: React.PropTypes.string,
    fields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    model: React.PropTypes.object.isRequired,
    permanentFields: React.PropTypes.arrayOf(React.PropTypes.string)
  },

  getDefaultProps: function () {
    return {
      permanentFields: [
        HealthStatus.HEALTHY,
        HealthStatus.UNHEALTHY,
        HealthStatus.UNKNOWN
      ]
    };
  },

  getHealth: function (state) {
    var model = this.props.model;
    var health = model.health.find((item) => item.state === state);
    if (health == null) {
      return {quantity: 0};
    }
    return health;
  },

  renderItem: function (state) {
    var health = this.getHealth(state);
    var totalInstances = this.props.model.instances;
    var instances = health.quantity;
    var percentage = Math.round((instances / totalInstances) * 100);
    var label = healthStatusLabels[state];
    var isEmpty = isNaN(percentage) || percentage === 0;
    var isPermanent = this.props.permanentFields.indexOf(state) > -1;

    var itemClasses = classNames(
      "health-breakdown-item",
      `health-breakdown-item-${state}`,
      {
        "health-breakdown-item-empty": isEmpty,
        "health-breakdown-item-impermanent": !isPermanent
      }
    );
    var healthDotClasses = classNames(["health-dot", `health-dot-${state}`]);

    return (
      <li className={itemClasses} key={state}>
        <span className={healthDotClasses}></span>
        {instances} {label}
        <span className="health-percentage">
          ({percentage}%)
        </span>
      </li>
    );
  },

  render: function () {
    var items = this.props.fields.map(this.renderItem);
    var ulClassNames = classNames("health-breakdown", this.props.className);
    return (
      <ul className={ulClassNames}>
        {items}
      </ul>
    );
  }

});

module.exports = AppHealthDetailComponent;
