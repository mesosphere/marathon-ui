import classNames from "classnames";
import lazy from "lazy.js";
import React from "react/addons";
import OnClickOutsideMixin from "react-onclickoutside";

var SidebarLabelsFilterDropdownComponent = React.createClass({
  displayName: "SidebarLabelsFilterDropdownComponent",

  mixins: [OnClickOutsideMixin],

  propTypes: {
    availableLabels: React.PropTypes.array,
    handleChange: React.PropTypes.func,
    selectedLabels: React.PropTypes.array
  },

  getInitialState: function () {
    return {
      isVisible: false,
      filterText: ""
    };
  },

  componentDidUpdate: function () {
    if (this.state.isVisible) {
      React.findDOMNode(this.refs.filterText).focus();
    }
  },

  handleClickOutside: function () {
    this.setState({
      isVisible: false
    });
  },

  getDropdownButton: function () {
    var props = this.props;

    let selectedLabelsText = props.selectedLabels.length > 0
      ? this.getSelectedLabelsText(props.selectedLabels.length)
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
    var props = this.props;
    var state = this.state;
    var availableLabels = props.availableLabels.slice();

    if (availableLabels == null || availableLabels.length === 0) {
      return null;
    }

    let options = availableLabels
      .sort((a, b) => {
        var isSelectedA = lazy(props.selectedLabels).find(a) != null;
        var isSelectedB = lazy(props.selectedLabels).find(b) != null;

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

        var isSelected = lazy(props.selectedLabels).find(label) != null;

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
      "hidden": !state.isVisible
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

  getSelectedLabelsText: function (count = 1) {
    var labelIndicator = "Label";
    if (count > 1) {
      labelIndicator = labelIndicator + "s";
    }
    return `${count} ${labelIndicator} Selected`;
  },

  handleChange: function (label, event) {
    this.props.handleChange(label, event.target.checked);
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
      isVisible: !this.state.isVisible,
      filterText: ""
    });
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

module.exports = SidebarLabelsFilterDropdownComponent;
