var React = require("react/addons");

var AppTypes = require("../constants/AppTypes");

var AppListTypeFilterComponent = React.createClass({
  displayName: "AppListTypeFilterComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    onChange: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      selectedTypes: []
    };
  },

  componentDidMount: function () {
    this.updateFilterTypes();
  },

  componentWillReceiveProps: function () {
    this.updateFilterTypes();
  },

  setQueryParam: function (filterTypes) {
    var router = this.context.router;
    var queryParams = router.getCurrentQuery();

    if (filterTypes != null && filterTypes.length !== 0) {
      let encodedFilterTypes = filterTypes.map((key) => {
        return encodeURIComponent(`${key}`);
      });
      Object.assign(queryParams, {
        filterTypes: encodedFilterTypes
      });
    } else {
      delete queryParams.filterTypes;
    }

    router.transitionTo(router.getCurrentPathname(), {}, queryParams);
  },

  handleChange: function (type, event) {
    var state = this.state;
    var selectedTypes = [];

    if (event.target.checked === true) {
      selectedTypes = React.addons.update(state.selectedTypes, {
        $push: [type]
      });
    } else {
      let index = state.selectedTypes.indexOf(type);
      if (index !== -1) {
        selectedTypes = React.addons.update(state.selectedTypes, {
          $splice: [[index, 1]]
        });
      }
    }
    this.setQueryParam(selectedTypes);
  },

  updateFilterTypes: function () {
    var router = this.context.router;
    var state = this.state;
    var queryParams = router.getCurrentQuery();
    var selectedTypes = queryParams.filterTypes;
    var stringify = JSON.stringify;

    if (selectedTypes == null) {
      selectedTypes = [];
    } else {
      selectedTypes = decodeURIComponent(selectedTypes)
        .split(",")
        .filter((type) => {
          return Object.values(AppTypes).indexOf(type) !== -1;
        });
    }

    if (stringify(selectedTypes) !== stringify(state.selectedTypes)) {
      this.setState({
        selectedTypes: selectedTypes
      }, this.props.onChange(selectedTypes));
    }
  },

  getTypeNodes: function () {
    var state = this.state;
    return Object.values(AppTypes).map((type, i) => {
      let checkboxProps = {
        type: "checkbox",
        id: `type-${type}-${i}`,
        checked: state.selectedTypes.indexOf(type) !== -1
      };

      return (
        <li className="checkbox" key={i}>
          <input {...checkboxProps}
            onChange={this.handleChange.bind(this, type)} />
          <label htmlFor={`type-${type}-${i}`}>{type}</label>
        </li>
      );
    });
  },

  render: function () {
    return (
      <ul className="list-group checked-list-box filters">
        {this.getTypeNodes()}
      </ul>
    );
  }

});

module.exports = AppListTypeFilterComponent;
