import classNames from "classnames";
import lazy from "lazy.js";
import OnClickOutsideMixin from "react-onclickoutside";
import React from "react/addons";

import AppsStore from "../stores/AppsStore";
import AppsEvents from "../events/AppsEvents";
import FilterTypes from "../constants/FilterTypes";

import QueryParamsMixin from "../mixins/QueryParamsMixin";

var SidebarLabelsFilterComponent = React.createClass({
  displayName: "SidebarLabelsFilterComponent",

  mixins: [OnClickOutsideMixin, QueryParamsMixin],

  getInitialState: function () {
    var labels = this.getAvailableLabels();

    return {
      activated: false,
      availableLabels: labels,
      selectedLabels: [],
      filterText: ""
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

  componentDidUpdate: function () {
    if (this.state.activated) {
      React.findDOMNode(this.refs.filterText).focus();
    }
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

  handleClickOutside: function () {
    this.setState({
      activated: false
    });
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

  handleChange: function (label, event) {
    var state = this.state;
    var selectedLabels = [];
    var update = React.addons.update;

    var labelIndex = state.selectedLabels.findIndex(currentLabel => {
      return currentLabel[0] === label[0] && currentLabel[1] === label[1];
    });

    if (event.target.checked === true) {
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

  handleFilterTextChange: function (event) {
    var filterText = event.target.value;
    this.setState({
      filterText: filterText
    });
  },

  handleKeyDown: function (event) {
    if (event.key === "Escape") {
      event.target.blur();
      this.setState({
        filterText: ""
      });
    }
  },

  toggleActivatedState: function () {
    this.setState({
      activated: !this.state.activated,
      filterText: ""
    });
  },

  getSelectedLabelsText: function (count = 1) {
    var labelIndicator = "Label";
    if (count > 1) {
      labelIndicator = labelIndicator + "s";
    }
    return `${count} ${labelIndicator} Selected`;
  },

  getDropdownButton: function () {
    var state = this.state;
    if (state.availableLabels == null || state.availableLabels.length === 0) {
      return (
        <button className="btn btn-default dropdown-toggle" disabled>
          No labels
        </button>
      );
    }

    let selectedLabelsText = state.selectedLabels.length > 0
      ? this.getSelectedLabelsText(state.selectedLabels.length)
      : "Select";

    return (
      <div className="btn btn-default dropdown-toggle"
          type="button"
          onClick={this.toggleActivatedState}>
        <div>{selectedLabelsText}</div>
        <span className="caret" />
      </div>
    );
  },

  getOptions: function () {
    var state = this.state;
    var availableLabels = state.availableLabels.slice();

    if (availableLabels == null || availableLabels.length === 0) {
      return null;
    }

    let options = availableLabels
      .sort((a, b) => {
        var isSelectedA = lazy(state.selectedLabels).find(a) != null;
        var isSelectedB = lazy(state.selectedLabels).find(b) != null;

        if (isSelectedA && isSelectedB) {
          return a[0].localeCompare(b[0]);
        }

        if (!isSelectedA && isSelectedB) {
          return 1;
        }

        if (isSelectedA && !isSelectedB) {
          return -1;
        }
      })
      .map((label, i) => {
        var [key, value] = label;
        var optionText = key;
        var filterText = state.filterText;

        if (value != null && value !== "") {
          optionText = `${key}:${value}`;
        }

        if (filterText !== "" &&
          optionText.search(new RegExp(filterText, "i")) === -1) {
          return null;
        }

        var isSelected = lazy(state.selectedLabels).find(label) != null;

        var checkboxProps = {
          type: "checkbox",
          id: `label-${optionText}-${i}`,
          checked: isSelected
        };

        return (
          <li className="checkbox" key={i}>
            <input {...checkboxProps}
              onChange={this.handleChange.bind(this, label)} />
            <label htmlFor={`label-${optionText}-${i}`} title={optionText}>
              <span>{optionText}</span>
            </label>
          </li>
        );
      });

    let dropdownClassSet = classNames({
      "hidden": !this.state.activated
    }, "dropdown-menu list-group filters");

    return (
      <ul className={dropdownClassSet}>
        <li className="search">
          <input type="text"
            ref="filterText"
            value={state.filterText}
            placeholder="Filter labels"
            onChange={this.handleFilterTextChange}
            onKeyDown={this.handleKeyDown} />
        </li>
        {options}
      </ul>
    );
  },

  render: function () {
    return (
      <div className="dropdown">
        {this.getDropdownButton()}
        {this.getOptions()}
      </div>
    );
  }

});

export default SidebarLabelsFilterComponent;
