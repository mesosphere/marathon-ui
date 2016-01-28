import React from "react/addons";

import AppListComponent from "../components/AppListComponent";
import BreadcrumbComponent from "../components/BreadcrumbComponent";
import DeploymentsListComponent from "../components/DeploymentsListComponent";
import FilterTypes from "../constants/FilterTypes";
import SidebarComponent from "../components/SidebarComponent";
import TabPaneComponent from "../components/TabPaneComponent";
import TogglableTabsComponent from "../components/TogglableTabsComponent";
import Util from "../helpers/Util";
import tabs from "../constants/tabs";

import QueryParamsMixin from "../mixins/QueryParamsMixin";

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
            <SidebarComponent groupId={state.currentGroup} />
            <main>
              <div className="contextual-bar">
                {this.getContextualBar()}
              </div>
              <AppListComponent currentGroup={state.currentGroup} />
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

export default TabPanesComponent;
