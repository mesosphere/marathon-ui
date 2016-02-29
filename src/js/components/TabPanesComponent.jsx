import {Link} from "react-router";
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
      currentGroup: "/"
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
    var filters = this.getQueryParamObject();

    if (filters[FilterTypes.TEXT] == null ||
        Util.isStringAndEmpty(filters[FilterTypes.TEXT])) {
      return <BreadcrumbComponent groupId={state.currentGroup} />;
    }

    return (
        <p className="breadcrumb">
          <span>
            {`Search results for "${filters[FilterTypes.TEXT]}"`}
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
    var path = this.context.router.getCurrentPathname();
    var state = this.state;
    var groupId = state.currentGroup;

    var newAppModalQuery = {
      modal: "new-app"
    };

    var newGroupModalQuery = {
      modal: "new-group"
    };

    if (groupId != null && groupId !== "/") {
      newAppModalQuery.groupId = groupId;
      newGroupModalQuery.groupId = groupId;
    }

    return (
      <TogglableTabsComponent activeTabId={this.getTabId()}
          className="container-fluid content">
        <TabPaneComponent id={tabs[0].id} className="flex-container">
          <div className="wrapper">
            <SidebarComponent groupId={state.currentGroup} />
            <main>
              <div className="contextual-bar">
                {this.getContextualBar()}
                <ul className="list-unstyled list-inline">
                  <li>
                    <Link to={path}
                        query={newGroupModalQuery}
                        className="btn btn-default create-group"
                        activeClassName="create-group-active">
                      Create Group
                    </Link>
                  </li>
                  <li>
                    <Link to={path}
                        query={newAppModalQuery}
                        className="btn btn-success create-app"
                        activeClassName="create-app-active">
                      Create Application
                    </Link>
                  </li>
                </ul>
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
