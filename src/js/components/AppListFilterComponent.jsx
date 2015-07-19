var classNames = require("classnames");
var React = require("react/addons");

var AppListFilterComponent = React.createClass({
  displayName: "AppListFilterComponent",

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

  updateFilterText: function (event) {
    var filterText = event.target.value;
    this.setState({
      filterText: filterText,
      activated: filterText !== "" || this.state.focused
    });
    this.props.onChange(filterText);
  },

  clearFilterText: function () {
    this.setState({
      filterText: "",
      activated: false
    });
    this.props.onChange("");
  },

  getFilterBox: function () {
    var state = this.state;

    var filterBoxClassSet = {
      "input-group": true,
      "filter-box": true,
      "filter-box-activated": !!state.activated
    };

    return (
      <div className={classNames(filterBoxClassSet)}>
        <span className="input-group-addon search-icon-container" ref="iconContainer">
          <i className="icon ion-search"></i>
        </span>
        <input className="form-control"
               type="text"
               onChange={this.updateFilterText}
               value={this.state.filterText}
               placeholder="Filter list"
               onFocus={this.focusInputGroup}
               onBlur={this.blurInputGroup}/>
        <span className="input-group-addon" ref="clearContainer">
          <i className="icon ion-close-circled clickable filter-box-clear"
             style={{color: "#5e646c"}}
             onClick={this.clearFilterText}></i>
        </span>
      </div>
    );
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
    return this.getFilterBox();
  }

});

module.exports = AppListFilterComponent;
