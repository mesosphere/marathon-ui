var classNames = require("classnames");
var React = require("react/addons");
var AppStatus = require("../constants/AppStatus");
var HealthStatus = require("../constants/HealthStatus");

function roundWorkaround(x) {
  return Math.floor(x * 1000) / 1000;
}

var healthNameMap = {
  [HealthStatus.HEALTHY]: "healthy",
  [HealthStatus.UNHEALTHY]: "unhealthy",
  [HealthStatus.UNKNOWN]: "running",
  [HealthStatus.STAGED]: "staged",
  [HealthStatus.OVERCAPACITY]: "over-capacity",
  [HealthStatus.UNSCHEDULED]: "unscheduled"
};

var AppHealthBarComponent = React.createClass({
  displayName: "AppHealthBarComponent",

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  getInternalBars: function () {
    var props = this.props;
    var {health, status} = props.model;

    if (status === AppStatus.DEPLOYING) {
      return (
        <div className="loading-bar" />
      );
    }

    // normalize quantities to add up to 100%. Cut off digits at
    // third decimal to work around rounding error leading to more than 100%.
    var dataSum = health.reduce(function (a, x) {
      return a + x.quantity;
    }, 0);

    let allZeroWidthBefore = true;
    return health.map(function (d, i) {
      var name = healthNameMap[d.state];
      var width = roundWorkaround(d.quantity * 100 / dataSum);
      var classSet = {
        // set health-bar-inner class for bars in the stack which have a
        // non-zero-width left neightbar
        "health-bar-inner": width !== 0 && !allZeroWidthBefore,
        "progress-bar": true
      };
      // add health bar name
      classSet["health-bar-" + name] = true;

      if (width !== 0) {
        allZeroWidthBefore = false;
      }

      return (
        <div
          className={classNames(classSet)}
          style={{width: width + "%"}}
          key={i} />
      );
    });
  },

  render: function () {
    return (
      <div className="progress health-bar">
       {this.getInternalBars()}
      </div>
    );
  }

});

module.exports = AppHealthBarComponent;
