var React = require("react/addons");

var AppTypes = require("../constants/AppTypes");

const appTypesNameMapping = {
  "DEFAULT": "Default",
  "DOCKER": "Docker"
};

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
    this.updateFilterType();
  },

  componentWillReceiveProps: function () {
    this.updateFilterType();
  },

  setQueryParam: function (filterType) {
    var router = this.context.router;
    var queryParams = router.getCurrentQuery();

    if (filterType != null && filterType.length !== 0) {
      let encodedFilterType = filterType.map((key) => {
        return encodeURIComponent(`${key}`);
      });
      Object.assign(queryParams, {
        filterType: encodedFilterType
      });
    } else {
      delete queryParams.filterType;
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

  updateFilterType: function () {
    var router = this.context.router;
    var state = this.state;
    var queryParams = router.getCurrentQuery();
    var selectedTypes = queryParams.filterType;
    var stringify = JSON.stringify;

    if (selectedTypes == null) {
      selectedTypes = [];
    } else {
      selectedTypes = decodeURIComponent(selectedTypes)
        .split(",")
        .filter((type) => {
          let existingType = AppTypes.indexOf(type);
          return existingType !== -1;
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
    return AppTypes.map((type, i) => {
      let checkboxProps = {
        type: "checkbox",
        id: `type-${type}-${i}`,
        checked: state.selectedTypes.indexOf(type) !== -1
      };

      return (
        <li className="checkbox" key={i}>
          <input {...checkboxProps}
            onChange={this.handleChange.bind(this, type)} />
          <label htmlFor={`type-${type}-${i}`}>
            {appTypesNameMapping[type]}
          </label>
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
