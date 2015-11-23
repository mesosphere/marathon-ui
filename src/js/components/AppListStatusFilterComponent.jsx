var React = require("react/addons");

var AppStatus = require("../constants/AppStatus");
var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");
var FilterTypes = require("../constants/FilterTypes");

var QueryParamsMixin = require("../mixins/QueryParamsMixin");

/* TODO extract from AppStatusComponent */
var statusNameMapping = {
  [AppStatus.RUNNING]: "Running",
  [AppStatus.DEPLOYING]: "Deploying",
  [AppStatus.SUSPENDED]: "Suspended",
  [AppStatus.DELAYED]: "Delayed",
  [AppStatus.WAITING]: "Waiting"
};

var AppListStatusFilterComponent = React.createClass({
  displayName: "AppListStatusFilterComponent",

  mixins: [QueryParamsMixin],

  propTypes: {
    onChange: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      appsStatusesCount: {},
      selectedStatus: []
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.UPDATE_APPS_STATUSES_COUNT,
      this.onAppsStatusesChange);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.UPDATE_APPS_STATUSES_COUNT,
      this.onAppsStatusesChange);
  },

  componentDidMount: function () {
    this.updateFilterStatus();
  },

  componentWillReceiveProps: function () {
    this.updateFilterStatus();
  },

  onAppsStatusesChange: function (appsStatusesCount) {
    this.setState({
      appsStatusesCount: appsStatusesCount
    });
  },

  handleChange: function (statusKey, event) {
    var state = this.state;
    var selectedStatus = [];
    var status = statusKey.toString();

    if (event.target.checked === true) {
      selectedStatus = React.addons.update(state.selectedStatus, {
        $push: [status]
      });
    } else {
      let index = state.selectedStatus.indexOf(status);
      if (index !== -1) {
        selectedStatus = React.addons.update(state.selectedStatus, {
          $splice: [[index, 1]]
        });
      }
    }

    this.setQueryParam(FilterTypes.STATUS, selectedStatus);
  },

  updateFilterStatus: function () {
    var state = this.state;
    var selectedStatus = this.getQueryParamValue(FilterTypes.STATUS);
    var stringify = JSON.stringify;

    if (selectedStatus == null) {
      selectedStatus = [];
    } else {
      selectedStatus = decodeURIComponent(selectedStatus)
        .split(",")
        .filter((statusKey) => {
          let status = statusKey.toString();
          let existingStatus = Object.keys(statusNameMapping).indexOf(status);
          return existingStatus !== -1;
        });
    }

    if (stringify(selectedStatus) !== stringify(state.selectedStatus)) {
      this.setState({
        selectedStatus: selectedStatus
      }, this.props.onChange(selectedStatus));
    }
  },

  getStatusNodes: function () {
    var state = this.state;

    return Object.keys(statusNameMapping).map((key, i) => {
      let optionText = statusNameMapping[key];

      let checkboxProps = {
        type: "checkbox",
        id: `status-${key}-${i}`,
        checked: state.selectedStatus.indexOf(key) !== -1
      };

      return (
        <li className="checkbox" key={i}>
          <input {...checkboxProps}
            onChange={this.handleChange.bind(this, key)} />
          <label htmlFor={`status-${key}-${i}`}>
            {optionText} ({state.appsStatusesCount[key] || 0})
          </label>
        </li>
      );
    });
  },

  render: function () {
    return (
      <ul className="list-group checked-list-box filters">
        {this.getStatusNodes()}
      </ul>
    );
  }

});

module.exports = AppListStatusFilterComponent;
