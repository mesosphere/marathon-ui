var classNames = require("classnames");
var React = require("react/addons");

var AppListFilterComponent = React.createClass({
  displayName: "AppListFilterComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    onChange: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      filterText: "",
      activated: false,
      focused: false
    };
  },

  componentDidMount: function () {
    this.updateFilterText();
  },

  componentWillReceiveProps: function () {
    this.updateFilterText();
  },

  setQueryParam: function (filterText) {
    var router = this.context.router;

    var queryParams = router.getCurrentQuery();

    if (filterText != null && filterText !== "") {
      Object.assign(queryParams, {
        filterText: encodeURIComponent(filterText)
      });
    } else {
      delete queryParams.filterText;
    }

    router.transitionTo(router.getCurrentPathname(), {}, queryParams);
  },

  updateFilterText: function () {
    var router = this.context.router;
    var state = this.state;
    var queryParams = router.getCurrentQuery();
    var filterText = queryParams.filterText;

    if (filterText == null) {
      filterText = "";
    } else {
      filterText = decodeURIComponent(filterText);
    }

    var filterBoxClassSet = {
      "input-group": true,
      "filter-box": true,
      "pull-right": true,
      "filter-box-activated": !!state.activated
    };

    if (filterText !== this.state.filterText) {
      this.setState({
        filterText: filterText,
        activated: filterText !== "" || state.focused
      });
      this.props.onChange(filterText);
    }
  },

  handleClearFilterText: function () {
    this.setQueryParam("");
  },

  handleFilterTextChange: function (event) {
    var filterText = event.target.value;

    this.setQueryParam(filterText);
  },

  handleKeyDown: function (event) {
    if (event.key === "Escape") {
      event.target.blur();
      this.handleClearFilterText();
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

  getFilterBox: function () {
    var state = this.state;

    var filterBoxClassSet = classNames({
      "input-group": true,
      "filter-box": true,
      "filter-box-activated": !!state.activated
    });

    var clearIconClassSet = classNames({
      "icon ion-close-circled clickable filter-box-clear": true,
      "hidden": state.filterText === ""
    });

    return (
      <div className={filterBoxClassSet}>
        <span className="input-group-addon search-icon-container">
          <i className="icon ion-search"></i>
        </span>
        <input className="form-control"
          onBlur={this.blurInputGroup}
          onChange={this.handleFilterTextChange}
          onFocus={this.focusInputGroup}
          onKeyDown={this.handleKeyDown}
          placeholder="Filter list"
          type="text"
          value={state.filterText} />
        <span className="input-group-addon">
          <i className={clearIconClassSet}
            onClick={this.handleClearFilterText}></i>
        </span>
      </div>
    );
  },

  render: function () {
    return this.getFilterBox();
  }

});

module.exports = AppListFilterComponent;
