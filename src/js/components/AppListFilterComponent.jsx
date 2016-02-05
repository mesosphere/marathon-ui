import classNames from "classnames";
import React from "react/addons";
import Mousetrap from "mousetrap";

import FilterTypes from "../constants/FilterTypes";

import QueryParamsMixin from "../mixins/QueryParamsMixin";

var AppListFilterComponent = React.createClass({
  displayName: "AppListFilterComponent",

  mixins: [QueryParamsMixin],

  getInitialState: function () {
    return {
      activated: false,
      filterText: "",
      focused: false
    };
  },

  componentDidMount: function () {
    this.updateFilterText();

    Mousetrap.bind("s", function () {
      if (this.getQueryParamValue("modal") != null) {
        return null;
      }
      React.findDOMNode(this.refs.filterText).focus();
    }.bind(this), "keyup");
  },

  componentWillUnmount: function () {
    Mousetrap.unbind("s");
  },

  componentWillReceiveProps: function () {
    this.updateFilterText();
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    return this.state.filterText !== nextState.filterText ||
      this.state.activated !== nextState.activated;
  },

  updateFilterText: function () {
    var state = this.state;
    var filterText = this.getQueryParamValue(FilterTypes.TEXT);

    if (filterText == null) {
      filterText = "";
    } else {
      filterText = decodeURIComponent(filterText);
    }

    if (filterText !== this.state.filterText) {
      this.setState({
        filterText: filterText,
        activated: filterText !== "" || state.focused
      });
    }
  },

  updateFilters: function (key, value) {
    var router = this.context.router;
    var params = router.getCurrentParams();
    var query = router.getCurrentQuery();

    if (key != null && value != null) {
      if (value === "") {
        delete query[key];
      } else {
        query[key] = value;
      }
    }

    if (params != null) {
      router.transitionTo("apps", params, query);
    }
  },

  handleClearFilterText: function () {
    this.updateFilters(FilterTypes.TEXT, "");
  },

  handleFilterTextChange: function (event) {
    var filterText = event.target.value;
    this.setState({filterText}, () => {
      if (filterText == null || filterText === "") {
        this.handleClearFilterText();
      }
    });
  },

  handleSubmit: function (event) {
    event.preventDefault();
    var filterText = this.state.filterText;
    this.updateFilters(FilterTypes.TEXT, filterText);
  },

  handleKeyDown: function (event) {
    switch (event.key) {
      case "Escape":
        event.target.blur();
        this.handleClearFilterText();
        break;
      case "Enter":
        this.handleSubmit(event);
        break;
    }
  },

  focusInputGroup: function () {
    this.setState({
      focused: true,
      activated: true
    });
  },

  blurInputGroup: function () {
    this.setState({
      focused: false,
      activated: this.state.filterText !== ""
    });
  },

  render: function () {
    var state = this.state;

    var filterBoxClassSet = classNames({
      "input-group": true,
      "filter-box": true,
      "filter-box-activated": !!state.activated
    });

    var searchIconClassSet = classNames("icon ion-search", {
      "clickable": state.filterText !== ""
    });

    return (
      <div className={filterBoxClassSet}>
        <span className="input-group-addon" />
        <input className="form-control"
          onBlur={this.blurInputGroup}
          onChange={this.handleFilterTextChange}
          onFocus={this.focusInputGroup}
          onKeyDown={this.handleKeyDown}
          placeholder="Search all applications"
          type="text"
          ref="filterText"
          value={state.filterText} />
        <span className="input-group-addon search-icon-container">
          <i className={searchIconClassSet} onClick={this.handleSubmit} />
        </span>
      </div>
    );
  }
});

export default AppListFilterComponent;
