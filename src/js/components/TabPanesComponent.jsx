var Link = require("react-router").Link;
var React = require("react/addons");

var AppListFilterComponent = require("../components/AppListFilterComponent");
var AppListComponent = require("../components/AppListComponent");
var BreadcrumbComponent = require("../components/BreadcrumbComponent");
var DeploymentsListComponent =
  require("../components/DeploymentsListComponent");
var SidebarComponent = require("../components/SidebarComponent");
var TabPaneComponent = require("../components/TabPaneComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");
var Util = require("../helpers/Util");
var tabs = require("../constants/tabs");

var TabPanesComponent = React.createClass({
  displayName: "TabPanesComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      currentGroup: "/",
      filters: {}
    };
  },

  componentWillReceiveProps: function () {
    this.updateCurrentGroup();
  },

  componentWillMount: function () {
    this.updateCurrentGroup();
  },

  getContextualBar: function () {
    var state = this.state;

    if (state.filters.filterText == null ||
        Util.isEmptyString(state.filters.filterText)) {
      return <BreadcrumbComponent groupId={state.currentGroup} />;
    }

    let router = this.context.router;
    let currentPathname = router.getCurrentPathname();
    let query = Object.assign({}, router.getCurrentQuery());
    let params = router.getCurrentParams();

    delete query.filterText;

    return (
        <p className="breadcrumb">
          <span>{`Search results for "${state.filters.filterText}"`}</span>
          <Link className="clear"
              to={currentPathname}
              query={query}
              params={params}>
            Clear search
          </Link>
        </p>
    );
  },

  updateCurrentGroup: function () {
    var {groupId} = this.context.router.getCurrentParams();
    if (groupId == null) {
      groupId = "/";
    }
    groupId = decodeURIComponent(groupId);
    if (!groupId.endsWith("/")) {
      groupId += "/";
    }

    this.setState({
      currentGroup: groupId
    });
  },

  updateFilters: function (filters) {
    var updatedFilters = Object.assign({}, this.state.filters, filters);
    this.setState({
      filters: updatedFilters
    });
  },

  getTabId: function () {
    var path = this.context.router.getCurrentPathname();

    var hasTab = tabs.find(tab => tab.id === path);

    if (hasTab) {
      return path;
    }

    return tabs[0].id;
  },

  render: function () {
    var state = this.state;

    return (
      <TogglableTabsComponent activeTabId={this.getTabId()}
          className="container-fluid content">
        <TabPaneComponent id={tabs[0].id} className="flex-container">
          <div className="wrapper">
            <SidebarComponent groupId={state.currentGroup}
              onChange={this.updateFilters} />
            <main>
              <div className="contextual-bar">
                {this.getContextualBar()}
                <div className="app-list-controls">
                  <AppListFilterComponent onChange={this.updateFilters} />
                </div>
              </div>
              <AppListComponent currentGroup={state.currentGroup}
                filters={state.filters} />
            </main>
          </div>
        </TabPaneComponent>
        <TabPaneComponent id={tabs[1].id}>
          <DeploymentsListComponent />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  }
});

module.exports = TabPanesComponent;
