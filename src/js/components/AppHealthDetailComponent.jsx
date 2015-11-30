var classNames = require("classnames");
var React = require("react/addons");

var AppHealthDetailComponent = React.createClass({
  displayName: "AppHealthDetailComponent",

  propTypes: {
    className: React.PropTypes.string,
    fields: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    model: React.PropTypes.object.isRequired
  },

  getHealth: function (state) {
    var model = this.props.model;
    var health = model.health.find((item) => item.state === state);
    if (health == null) {
      return {quantity: 0};
    }
    return health;
  },

  renderItem: function (field) {
    var health = this.getHealth(field.state);
    var totalInstances = this.props.model.instances;
    var instances = health.quantity;
    var percentage = Math.round((instances / totalInstances) * 100);
    var key = field.key;
    var itemClasses = classNames(
      "health-breakdown-item",
      `health-breakdown-item-${key}`,
      {"health-breakdown-item-empty": isNaN(percentage) || percentage === 0}
    );
    var healthDotClasses = classNames(["health-dot", `health-dot-${key}`]);

    return (
      <li className={itemClasses} key={key}>
        <span className={healthDotClasses}></span>
        {instances} {field.label}
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
