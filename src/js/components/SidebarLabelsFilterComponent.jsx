import lazy from "lazy.js";
import React from "react/addons";

import AppsStore from "../stores/AppsStore";
import AppsEvents from "../events/AppsEvents";
import FilterTypes from "../constants/FilterTypes";

import QueryParamsMixin from "../mixins/QueryParamsMixin";

import SidebarLabelsFilterDropdownComponent
  from "./SidebarLabelsFilterDropdownComponent";

var SidebarLabelsFilterComponent = React.createClass({
  displayName: "SidebarLabelsFilterComponent",

  mixins: [QueryParamsMixin],

  getInitialState: function () {
    return {
      availableLabels: this.getAvailableLabels(),
      selectedLabels: []
    };
  },

  componentDidMount: function () {
    this.updateFilterLabels();
  },

  componentWillReceiveProps: function () {
    this.updateFilterLabels();
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CHANGE, this.onAppsChange);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CHANGE, this.onAppsChange);
  },

  getAvailableLabels: function () {
    var apps = AppsStore.apps;
    if (apps.length === 0) {
      return [];
    }

    return lazy(apps)
      .filter((app) => {
        return app.labels != null && Object.keys(app.labels).length > 0;
      })
      .reduce((memo, app) => {
        Object.keys(app.labels).forEach((key) => {
          let label = [key, app.labels[key]];
          if (lazy(memo).find(label) == null) {
            memo.push(label);
          }
        });
        return memo;
      }, [])
      .sort();
  },

  onAppsChange: function () {
    this.setState({
      availableLabels: this.getAvailableLabels()
    }, this.updateFilterLabels);
  },

  updateFilterLabels: function () {
    var state = this.state;
    var selectedLabels = this.getQueryParamValue(FilterTypes.LABELS);
    var stringify = JSON.stringify;

    if (selectedLabels == null) {
      selectedLabels = [];
    } else {
      selectedLabels = selectedLabels
        .map(label => this.decodeQueryParamArray(label))
        .filter(label => lazy(state.availableLabels).find(label) != null);
    }

    if (stringify(selectedLabels) !== stringify(state.selectedLabels)) {
      this.setState({
        selectedLabels: selectedLabels
      });
    }
  },

  handleChange: function (label, isSelected) {
    var state = this.state;
    var selectedLabels = [];
    var update = React.addons.update;

    var labelIndex = state.selectedLabels.findIndex(currentLabel => {
      return currentLabel[0] === label[0] && currentLabel[1] === label[1];
    });

    if (isSelected) {
      if (labelIndex === -1) {
        selectedLabels = update(state.selectedLabels, {$push: [label]});
      }
    } else {
      if (labelIndex > -1) {
        selectedLabels = update(state.selectedLabels,
          {$splice: [[labelIndex, 1]]}
        );
      }
    }

    this.setQueryParam(FilterTypes.LABELS, selectedLabels);
  },

  render: function () {
    var state = this.state;

    if (state.availableLabels.length === 0) {
      return null;
    }

    return (
      <div>
        <div className="flex-row">
          <h3 className="small-caps">Label</h3>
          {this.getClearLinkForFilter(FilterTypes.LABELS)}
        </div>
        <SidebarLabelsFilterDropdownComponent
          handleChange={this.handleChange}
          availableLabels={state.availableLabels}
          selectedLabels={state.selectedLabels} />
      </div>
    );
  }

});

export default SidebarLabelsFilterComponent;
