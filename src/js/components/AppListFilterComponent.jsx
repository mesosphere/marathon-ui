var classNames = require("classnames");
var React = require("react/addons");
var Mousetrap = require("mousetrap");

var QueryParamsMixin = require("../mixins/QueryParamsMixin");

var AppListFilterComponent = React.createClass({
  displayName: "AppListFilterComponent",

  mixins: [QueryParamsMixin],

  propTypes: {
    onChange: React.PropTypes.func.isRequired
  },

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
    var filterText = this.getQueryParamsValue("filterText");

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
      this.props.onChange({filterText});
    }
  },

  handleClearFilterText: function () {
    this.setQueryParam("filterText", "");
    this.props.onChange({filterText: ""});
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
    this.setQueryParam("filterText", filterText);
    this.props.onChange({filterText});
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

module.exports = AppListFilterComponent;
