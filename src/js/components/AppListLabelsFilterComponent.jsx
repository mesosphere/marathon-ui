var classNames = require("classnames");
var lazy = require("lazy.js");
var OnClickOutsideMixin = require("react-onclickoutside");
var React = require("react/addons");

var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");

var AppListLabelsFilterComponent = React.createClass({
  displayName: "AppListLabelsFilterComponent",

  mixins: [OnClickOutsideMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    onChange: React.PropTypes.func.isRequired
  },

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

  setQueryParam: function (filterLabels) {
    var router = this.context.router;
    var queryParams = router.getCurrentQuery();

    if (filterLabels != null && filterLabels.length !== 0) {
      let encodedFilterLabels = filterLabels.map((label) => {
        return encodeURIComponent(label.join(":"));
      });
      Object.assign(queryParams, {
        filterLabels: encodedFilterLabels
      });
    } else {
      delete queryParams.filterLabels;
    }

    router.transitionTo(router.getCurrentPathname(), {}, queryParams);
  },

  updateFilterLabels: function () {
    var router = this.context.router;
    var state = this.state;
    var queryParams = router.getCurrentQuery();
    var selectedLabels = queryParams.filterLabels;
    var stringify = JSON.stringify;

    if (selectedLabels == null) {
      selectedLabels = [];
    } else {
      selectedLabels = decodeURIComponent(selectedLabels)
        .split(",")
        .map((label) => {
          return label.split(":");
        })
        .filter((label) => {
          return lazy(state.availableLabels).find(label) != null;
        });
    }

    if (stringify(selectedLabels) !== stringify(state.selectedLabels)) {
      this.setState({
        selectedLabels: selectedLabels
      }, this.props.onChange(selectedLabels));
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

    this.setQueryParam(selectedLabels);
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
      activated: !this.state.activated
    });
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

    let selectedLabelsText = state.selectedLabels.reduce((memo, label) => {
      let [key, value] = label;
      let labelText = key;
      if (value != null) {
        labelText = `${key}:${value}`;
      }

      if (memo.length === 0) {
        memo = labelText;
        return memo;
      }

      memo = `${memo}, ${labelText}`;
      return memo;
    }, "");

    if (selectedLabelsText === "") {
      selectedLabelsText = "Select";
    }

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
    if (state.availableLabels == null || state.availableLabels.length === 0) {
      return null;
    }

    let options = state.availableLabels.map((label, i) => {
      let [key, value] = label;
      let optionText = key;
      let filterText = state.filterText;

      if (value != null && value !== "") {
        optionText = `${key}:${value}`;
      }

      if (filterText !== "" &&
        optionText.search(new RegExp(filterText, "i")) === -1) {
        return null;
      }

      let checkboxProps = {
        type: "checkbox",
        id: `label-${optionText}-${i}`,
        checked: lazy(state.selectedLabels).find(label) != null
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

module.exports = AppListLabelsFilterComponent;
