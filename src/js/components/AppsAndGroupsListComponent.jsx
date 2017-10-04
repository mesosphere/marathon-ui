import React from "react/addons";

import QueryParamsMixin from "../mixins/QueryParamsMixin";
import {Link} from "react-router";
import SidebarComponent from "../components/SidebarComponent";
import AppListComponent from "../components/AppListComponent";
import BreadcrumbComponent from "../components/BreadcrumbComponent";
import FilterTypes from "../constants/FilterTypes";
import Util from "../helpers/Util";

var AppsAndGroupsListComponent = React.createClass({
  displayName: "AppsAndGroupsListComponent",

  mixins: [QueryParamsMixin],

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

  getContextualBar: function () {
    var groupId = "/";
    var filters = this.getQueryParamObject();

    if (filters[FilterTypes.TEXT] == null ||
        Util.isStringAndEmpty(filters[FilterTypes.TEXT])) {
      return <BreadcrumbComponent groupId={groupId} />;
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

  render: function () {
    var path = this.getCurrentPathname();
    var groupId = this.state.currentGroup;

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
          <div className="app-list-wrapper">
            <SidebarComponent groupId={groupId} />
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
              <AppListComponent currentGroup={groupId} />
            </main>
          </div>
    );
  }

});

export default AppsAndGroupsListComponent;
