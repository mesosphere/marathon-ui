var React = require("react/addons");

var AppListFilterComponent = require("../components/AppListFilterComponent");
var AppListComponent = require("../components/AppListComponent");
var BreadcrumbComponent = require("../components/BreadcrumbComponent");
var DeploymentsListComponent =
  require("../components/DeploymentsListComponent");
var FilterTypes = require("../constants/FilterTypes");
var SidebarComponent = require("../components/SidebarComponent");
var TabPaneComponent = require("../components/TabPaneComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");
var Util = require("../helpers/Util");
var tabs = require("../constants/tabs");

var QueryParamsMixin = require("../mixins/QueryParamsMixin");

var TabPanesComponent = React.createClass({
  displayName: "TabPanesComponent",

  mixins: [QueryParamsMixin],

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

    if (state.filters[FilterTypes.TEXT] == null ||
        Util.isStringAndEmpty(state.filters[FilterTypes.TEXT])) {
      return <BreadcrumbComponent groupId={state.currentGroup} />;
    }

    return (
        <p className="breadcrumb">
          <span>
            {`Search results for "${state.filters[FilterTypes.TEXT]}"`}
          </span>
          {this.getClearLinkForFilter(FilterTypes.TEXT,
            "Clear search",
            "clear")}
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
    this.setState(function (prevState) {
      return {
        filters: Object.assign({}, prevState.filters, filters)
      };
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
