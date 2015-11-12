var Link = require("react-router").Link;
var React = require("react/addons");

var AppListLabelsFilterComponent =
  require("../components/AppListLabelsFilterComponent");
var AppListStatusFilterComponent =
  require("../components/AppListStatusFilterComponent");

var SidebarComponent = React.createClass({
  displayName: "SidebarComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    groupId: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      filters: {
        filterLabels: [],
        filterStatus: []
      }
    };
  },

  updateFilterLabels: function (filterLabels) {
    var state = this.state;

    this.setState(Object.assign(state.filters, {
      filterLabels: filterLabels
    }), this.props.onChange(state.filters));
  },

  updateFilterStatus: function (filterStatus) {
    var state = this.state;

    this.setState(Object.assign(state.filters, {
      filterStatus: filterStatus
    }), this.props.onChange(state.filters));
  },

  getClearLinkForFilter: function (filterQueryParamKey) {
    var state = this.state;

    if (state.filters[filterQueryParamKey].length === 0) {
      return null;
    }

    let router = this.context.router;
    let currentPathname = router.getCurrentPathname();
    let query = Object.assign({}, router.getCurrentQuery());
    let params = router.getCurrentParams();

    if (query[filterQueryParamKey] != null) {
      delete query[filterQueryParamKey];
    }

    return (
      <Link to={currentPathname} query={query} params={params}>
        Clear
      </Link>
    );
  },

  render: function () {
    var path = this.context.router.getCurrentPathname();
    var props = this.props;

    var newAppModalQuery = {
      modal: "new-app"
    };

    if (props.groupId != null && props.groupId !== "/") {
      newAppModalQuery.groupId = props.groupId;
    }

    return (
      <nav className="sidebar">
        <Link to={path}
          query={newAppModalQuery}
          className="btn btn-success create-app"
          activeClassName="create-app-active">
          Create
        </Link>
        <div className="flex-row">
          <h3 className="small-caps">Status</h3>
          {this.getClearLinkForFilter("filterStatus")}
        </div>
        <AppListStatusFilterComponent
          onChange={this.updateFilterStatus} />
        <div className="flex-row">
          <h3 className="small-caps">Label</h3>
          {this.getClearLinkForFilter("filterLabels")}
        </div>
        <AppListLabelsFilterComponent
          onChange={this.updateFilterLabels} />
      </nav>
    );
  }
});

module.exports = SidebarComponent;