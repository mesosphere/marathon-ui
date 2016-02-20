import React from "react/addons";

import AppsStore from "../stores/AppsStore";
import AppsEvents from "../events/AppsEvents";
import FilterTypes from "../constants/FilterTypes";

import QueryParamsMixin from "../mixins/QueryParamsMixin";

/**
 * Health is wealth, peace of mind is happiness.
 */
var SidebarVolumesFilterComponent = React.createClass({
  displayName: "SidebarVolumesFilterComponent",

  mixins: [QueryParamsMixin],

  handleChange: function () {
    var currentState = this.getQueryParamValue(FilterTypes.VOLUMES) === "true"
      ? null
      : true;

    this.setQueryParam(FilterTypes.VOLUMES, currentState);
  },

  getInitialState: function () {
    return {
      appsVolumesCount: ""
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

  onAppsHealthChange: function (filterCounts) {
    this.setState({
      appsVolumesCount: filterCounts.appsVolumesCount
    });
  },

  render: function () {
    var state = this.state;

    var checkboxProps = {
      type: "checkbox",
      id: `volumesFilter`,
      checked: this.getQueryParamValue(FilterTypes.VOLUMES)
    };

    return (
      <ul className="list-group checked-list-box filters">
        <li className="checkbox">
          <input {...checkboxProps}
            onChange={this.handleChange} />
          <label htmlFor={checkboxProps.id}>
            Volumes
            <span className="badge">
              {state.appsVolumesCount.toLocaleString()}
            </span>
          </label>
        </li>
      </ul>
    );
  }

});

export default SidebarVolumesFilterComponent;
