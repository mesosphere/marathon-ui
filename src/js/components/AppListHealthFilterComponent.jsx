var classNames = require("classnames");
var React = require("react/addons");

var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");
var FilterTypes = require("../constants/FilterTypes");
var HealthStatus = require("../constants/HealthStatus");

var QueryParamsMixin = require("../mixins/QueryParamsMixin");

var healthNameMapping = {
  [HealthStatus.HEALTHY]: "Healthy",
  [HealthStatus.UNHEALTHY]: "Unhealthy",
  [HealthStatus.UNKNOWN]: "Unknown"
};

/**
 * Health is wealth, peace of mind is happiness.
 */
var AppListHealthFilterComponent = React.createClass({
  displayName: "AppListHealthFilterComponent",

  mixins: [QueryParamsMixin],

  propTypes: {
    onChange: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      appsHealthCount: {},
      selectedHealth: []
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.UPDATE_APPS_FILTER_COUNT,
      this.onAppsHealthChange);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.UPDATE_APPS_FILTER_COUNT,
      this.onAppsHealthChange);
  },

  componentDidMount: function () {
    this.updateFilterStatus();
  },

  componentWillReceiveProps: function () {
    this.updateFilterStatus();
  },

  onAppsHealthChange: function (filterCounts) {
    this.setState({
      appsHealthCount: filterCounts.appsHealthCount
    });
  },

  handleChange: function (healthKey, event) {
    var state = this.state;
    var selectedHealth = [];
    var health = healthKey.toString();

    if (event.target.checked === true) {
      selectedHealth = React.addons.update(state.selectedHealth, {
        $push: [health]
      });
    } else {
      let index = state.selectedHealth.indexOf(health);
      if (index !== -1) {
        selectedHealth = React.addons.update(state.selectedHealth, {
          $splice: [[index, 1]]
        });
      }
    }

    this.setQueryParam(FilterTypes.HEALTH, selectedHealth);
  },

  updateFilterStatus: function () {
    var state = this.state;
    var selectedHealth = this.getQueryParamValue(FilterTypes.HEALTH);
    var stringify = JSON.stringify;

    if (selectedHealth == null) {
      selectedHealth = [];
    } else {
      selectedHealth = decodeURIComponent(selectedHealth)
        .split(",")
        .filter((healthKey) => {
          let health = healthKey.toString();
          let existingHealth = Object.keys(healthNameMapping).indexOf(health);
          return existingHealth !== -1;
        });
    }

    if (stringify(selectedHealth) !== stringify(state.selectedHealth)) {
      this.setState({
        selectedHealth: selectedHealth
      }, this.props.onChange(selectedHealth));
    }
  },

  getHealthCountBadge: function (id, appHealth) {
    var state = this.state;

    if (!state.appsHealthCount[appHealth]) {
      return null;
    }

    return (
      <span className="badge">
        {state.appsHealthCount[appHealth].toLocaleString()}
      </span>
    );
  },

  getHealthNodes: function () {
    var state = this.state;

    return Object.keys(healthNameMapping).map((key, i) => {
      var optionText = healthNameMapping[key];

      var checkboxProps = {
        type: "checkbox",
        id: `health-${key}-${i}`,
        checked: this.state.selectedHealth.indexOf(key) !== -1
      };

      var labelClassName = classNames({
        "text-muted": !state.appsHealthCount[key]
      });

      return (
        <li className="checkbox" key={i}>
          <input {...checkboxProps}
            onChange={this.handleChange.bind(this, key)} />
          <label htmlFor={`health-${key}-${i}`} className={labelClassName}>
            {optionText}
            {this.getHealthCountBadge(`health-${key}-${i}`, key)}
          </label>
        </li>
      );
    });
  },

  render: function () {
    return (
      <ul className="list-group checked-list-box filters">
        {this.getHealthNodes()}
      </ul>
    );
  }

});

module.exports = AppListHealthFilterComponent;
