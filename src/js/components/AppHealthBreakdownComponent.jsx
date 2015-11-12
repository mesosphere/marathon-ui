var classNames = require("classnames");
var React = require("react/addons");

var HealthStatus = require("../constants/HealthStatus");

var AppHealthBreakdownComponent = React.createClass({
  displayName: "AppHealthBreakdownComponent",

  propTypes: {
    fields: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
    model: React.PropTypes.object.isRequired
  },

  getHealth: function (key) {
    var model = this.props.model;
    var state = HealthStatus[key.toUpperCase()];
    var health = model.health.find((item) => item.state === state);
    if (health == null) {
      return {quantity: 0};
    }
    return health;
  },

  renderItem: function (field) {
    // Capitalise, eg healthy -> Healthy
    var fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);
    var health = this.getHealth(field);
    var totalInstances = this.props.model.instances;
    var instances = health.quantity;
    var percentage = Math.round((instances / totalInstances) * 100);
    var itemClasses = classNames([
      "health-breakdown-item", `health-breakdown-item-${field}`
    ]);
    var healthDotClasses = classNames(["health-dot", `health-dot-${field}`]);
    var percentageClasses = classNames({
      "health-percentage": true,
      "hidden": isNaN(percentage) || percentage === 0
    });

    return (
      <li className={itemClasses} key={field}>
        <span className={healthDotClasses}></span>
        {instances} {fieldLabel}
        <span className={percentageClasses}>
          ({percentage}%)
        </span>
      </li>
    );
  },

  render: function () {
    var items = this.props.fields.map(this.renderItem);
    return (
      <ul className="health-breakdown list-inline">
        {items}
      </ul>
    );
  }

});

module.exports = AppHealthBreakdownComponent;
