import classNames from "classnames";
import {Link} from "react-router";
import React from "react/addons";
import {score} from "fuzzaldrin";

import AppListViewTypes from "../constants/AppListViewTypes";
import AppStatus from "../constants/AppStatus";
import ExternalLinks from "../constants/ExternalLinks";
import FilterTypes from "../constants/FilterTypes";
import HealthStatus from "../constants/HealthStatus";
import Messages from "../constants/Messages";
import States from "../constants/States";
import AppListItemComponent from "./AppListItemComponent";
import CenteredInlineDialogComponent from "./CenteredInlineDialogComponent";
import TooltipComponent from "../components/TooltipComponent";

import AppsActions from "../actions/AppsActions";
import AppsStore from "../stores/AppsStore";
import AppsEvents from "../events/AppsEvents";
import QueryParamsMixin from "../mixins/QueryParamsMixin";

import Util from "../helpers/Util";
import SortUtil from "../helpers/SortUtil";

function getGroupStatus(groupStatus, appStatus) {
  if (appStatus === AppStatus.DEPLOYING ||
      appStatus === AppStatus.DELAYED ||
      appStatus === AppStatus.WAITING) {
    if (appStatus > groupStatus) {
      return appStatus;
    }
  }

  return groupStatus;
}

function getGroupHealth(groupHealth, appHealth) {
  if (groupHealth == null) {
    groupHealth = [];
  }

  if (appHealth == null) {
    return groupHealth;
  }

  return appHealth.map(appHealthState => {
    var groupHealthState =
      groupHealth.find(healthState => {
        return healthState.state === appHealthState.state;
      });

    if (groupHealthState == null) {
      return Object.assign({}, appHealthState);
    }

    groupHealthState.quantity += appHealthState.quantity;

    return groupHealthState;
  });
}

function getInitialFilterCounts(object) {
  return Object.values(object).reduce(function (memo, name) {
    memo[name] = 0;
    return memo;
  }, {});
}

function initGroupNode(groupId, app) {
  return {
    health: getGroupHealth(null, app.health),
    healthWeight: app.healthWeight,
    id: groupId,
    instances: app.instances,
    isGroup: true,
    status: getGroupStatus(null, app.status),
    tasksRunning: app.tasksRunning,
    totalCpus: app.totalCpus,
    totalMem: app.totalMem
  };
}

function updateGroupNode(group, app) {
  group.health = getGroupHealth(group.health, app.health);
  group.healthWeight += app.healthWeight;
  group.instances += app.instances;
  group.status = getGroupStatus(group.status, app.status);
  group.tasksRunning += app.tasksRunning;
  group.totalCpus += app.totalCpus;
  group.totalMem += app.totalMem;
  return group;
}

var AppListComponent = React.createClass({
  displayName: "AppListComponent",

  contextTypes: {
    router: React.PropTypes.oneOfType([
      React.PropTypes.func,
      // This is needed for the tests, the context differs there.
      React.PropTypes.object
    ])
  },

  propTypes: {
    currentGroup: React.PropTypes.string.isRequired
  },

  mixins: [QueryParamsMixin],

  getInitialState: function () {
    var fetchState = States.STATE_LOADING;
    var apps = AppsStore.apps;

    if (apps.length > 0) {
      fetchState = States.STATE_SUCCESS;
    }

    return {
      apps: apps,
      fetchState: fetchState,
      sortKey: "id",
      sortDescending: false
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CHANGE, this.onAppsChange);
    AppsStore.on(AppsEvents.REQUEST_APPS_ERROR, this.onAppsRequestError);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CHANGE,
      this.onAppsChange);
    AppsStore.removeListener(AppsEvents.REQUEST_APPS_ERROR,
      this.onAppsRequestError);
  },

  onAppsChange: function () {
    this.setState({
      apps: AppsStore.apps,
      fetchState: States.STATE_SUCCESS
    });
  },

  onAppsRequestError: function (message, statusCode) {
    var fetchState = States.STATE_ERROR;

    switch (statusCode) {
      case 401:
        fetchState = States.STATE_UNAUTHORIZED;
        break;
      case 403:
        fetchState = States.STATE_FORBIDDEN;
        break;
    }

    this.setState({
      fetchState: fetchState
    });
  },

  sortBy: function (sortKey) {
    var state = this.state;

    this.setState({
      sortKey: sortKey,
      sortDescending: state.sortKey === sortKey && !state.sortDescending
    });
  },

  hasFilters: function () {
    var filters = this.getQueryParamObject();

    filters = Object.values(FilterTypes)
      .reduce((returnObject, key) => {
        var filter = filters[key];
        if (filter != null) {
          returnObject[key] = filter;
        }
        return returnObject;
      }, {});

    return Object.values(filters).some(filterValue => {
      return filterValue != null &&
        (Util.isArray(filterValue) && filterValue.length > 0) ||
        (Util.isString(filterValue) && filterValue !== "");
    });
  },

  getGroupsFromApps: function (apps) {
    var groups = [];

    apps.filter(app => !app.isGroup)
      .forEach(app => {
        var pathParts = app.id.split("/");

        // Remove app name
        pathParts.pop();

        // Create groups
        pathParts.forEach((pathPart, index, pathParts) => {
          // Ignore the first part as all app/group ids that begin with a slash
          if (index === 0) {
            return;
          }

          let groupId = pathParts.slice(0, index + 1).join("/");
          let group = groups.find(item => {
            return item.id === groupId;
          });

          if (group == null) {
            group = initGroupNode(groupId, app);
            groups.push(group);
          } else {
            updateGroupNode(group, app);
          }
        });
      });

    return groups;
  },

  filterItems: function (items, filterCounts) {

    var props = this.props;
    var currentGroup = props.currentGroup;
    var filters = this.getQueryParamObject();

    var filterHealth = filters[FilterTypes.HEALTH];
    var filterText = filters[FilterTypes.TEXT];
    var filterLabels = filters[FilterTypes.LABELS];
    var filterStatus = filters[FilterTypes.STATUS];
    var filterVolumes = filters[FilterTypes.VOLUMES];

    if (filterText != null && filterText !== "") {
      items = items.filter(item => {
        var id = item.id;
        if (item.isGroup) {
          id = item.id.split("/").pop();
        }

        return score(id, filterText) > 0.004;
      });

    } else if (currentGroup !== "/") {
      items = items.filter(app => app.id.startsWith(currentGroup));
    }

    items.each(item => {
      if (item.isGroup) {
        return;
      }
      filterCounts.appsStatusesCount[item.status]++;
      if (item.container != null &&
        item.container.volumes.filter(item => item.persistent != null)
          .length > 0) {
        filterCounts.appsVolumesCount++;
      }
      item.health.forEach(health => {
        if (health.quantity) {
          filterCounts.appsHealthCount[health.state]++;
        }
      });
    });

    if (filterLabels != null && filterLabels.length > 0) {
      items = items.filter(item => {
        var labels = item.labels;
        if (item.isGroup || labels == null ||
            Object.keys(labels).length === 0) {
          return false;
        }

        return filterLabels.some(label => {
          var [key, value] = this.decodeQueryParamArray(label);
          return labels[key] === value;
        });
      });
    }

    if (filterStatus != null && filterStatus.length > 0) {
      items = items.filter(item => {
        if (item.isGroup || item.status == null) {
          return false;
        }
        let appStatus = item.status.toString();

        return filterStatus.some(status => appStatus === status);
      });
    }

    if (filterHealth != null && filterHealth.length > 0) {
      items = items.filter(item => {
        if (item.isGroup || item.health == null) {
          return false;
        }

        return filterHealth.some(healthFilter => {
          return item.health.some(health =>
            health.state === healthFilter && health.quantity > 0
          );
        });
      });
    }

    if (filterVolumes != null) {
      items = items.filter(item => {
        if (item.container == null || item.container.volumes == null) {
          return false;
        }

        return item.container.volumes.filter(item => item.persistent != null)
          .length > 0;
      });
    }

    return items;
  },

  groupItems: function (items, currentGroup, filterCounts) {
    return items.filter(item => {

      //  Exclude groups and items that are not in the current group
      if (!item.id.startsWith(currentGroup)) {
        return false;
      }

      // Update filter counts
      if (!item.isGroup) {
        filterCounts.appsStatusesCount[item.status]++;
        if (item.container != null &&
          item.container.volumes.filter(item => item.persistent != null)
            .length > 0) {
          filterCounts.appsVolumesCount++;
        }
        item.health.forEach(health => {
          if (health.quantity) {
            filterCounts.appsHealthCount[health.state]++;
          }
        });
      }

      // Exclude items that are in a sub group
      let relativePath = item.id.substring(currentGroup.length);
      let pathParts = relativePath.split("/");

      return pathParts.length < 2;
    });
  },

  sortItems: function (items, compareFunction) {
    // Hoist groups to top and sort items using the compare function
    return items.sort((a, b) => {
      var score = 0;

      if (a.isGroup && !b.isGroup) {
        score = -1;
      } else if (b.isGroup && !a.isGroup) {
        score =  1;
      }

      return score + compareFunction(a, b) / 2;
    });
  },

  getAppListItems: function () {
    var appListViewType = AppListViewTypes.GROUPED_LIST;
    var props = this.props;
    var state = this.state;
    var sortKey = state.sortKey;
    var sortDirection = state.sortDescending ? -1 : 1;

    var filterCounts = {
      appsStatusesCount: getInitialFilterCounts(AppStatus),
      appsHealthCount: getInitialFilterCounts(HealthStatus),
      appsVolumesCount: 0
    };

    var items = state.apps.reduce((apps, item) => {
      apps[item.id] = item;
      return apps;
    }, {});
    this.getGroupsFromApps(state.apps).forEach(item => {
      Object.assign(items[item.id] || {}, item);
    });

    items = Object.keys(items).map(key => items[key]);

    if (this.hasFilters()) {
      // Global search view
      appListViewType = AppListViewTypes.APP_LIST;
      items = this.filterItems(items, filterCounts);
    }
    else {
      // Grouped view
      items = this.groupItems(items,  props.currentGroup, filterCounts);
    }

    let filterText = this.getQueryParamValue(FilterTypes.TEXT);
    if (filterText != null && sortKey === "id") {
      items = this.sortItems(items, (itemA, itemB) => {
        var scoreItemA = score(itemA.id, filterText);
        var scoreItemB = score(itemB.id, filterText);
        if (scoreItemA < scoreItemB) {
          return 1;
        }
        if (scoreItemA > scoreItemB) {
          return -1;
        }
        return 0;
      });
    } else {
      items = this.sortItems(items,
        (a, b) => SortUtil.compareValues(a[sortKey], b[sortKey]) * sortDirection
      );
    }

    var appListItems = items.map(app => {
      return (
        <AppListItemComponent key={app.id}
          model={app}
          currentGroup={props.currentGroup}
          sortKey={sortKey}
          viewType={appListViewType}/>
      );
    });

    AppsActions.emitFilterCounts(filterCounts);

    return appListItems;
  },

  getCaret: function (sortKey) {
    var filterText = this.getQueryParamValue([FilterTypes.TEXT]);

    if (sortKey === this.state.sortKey &&
        (sortKey !== "id" || filterText == null || filterText === "")) {
      return (
        <span className="caret"></span>
      );
    }
    return null;
  },

  pageHasFilters: function () {
    return Object.keys(this.getQueryParamObject())
        .filter(queryParam => ["modal", "groupId"].indexOf(queryParam) === -1)
        .length > 0;
  },

  getInlineDialog: function (appNodes = []) {
    var state = this.state;
    var {currentGroup} = this.props;

    var path = this.getCurrentPathname();

    var pageIsLoading = state.fetchState === States.STATE_LOADING;
    var pageHasApps = state.apps.length > 0;
    var pageHasFilters = this.pageHasFilters();
    var pageHasNoRunningApps = !pageIsLoading &&
      !pageHasApps &&
      state.fetchState !== States.STATE_UNAUTHORIZED &&
      state.fetchState !== States.STATE_FORBIDDEN &&
      state.fetchState !== States.STATE_ERROR;
    var pageHasNoMatchingApps = pageHasApps &&
      appNodes.length === 0 &&
      pageHasFilters;
    var pageHasEmptyGroup = !pageIsLoading &&
      appNodes.length === 0 &&
      !pageHasFilters;

    var newAppModalQuery = {
      modal: "new-app"
    };

    if (currentGroup != null && currentGroup !== "/") {
      newAppModalQuery.groupId = currentGroup;
    }

    if (pageIsLoading) {
      let message = "Please wait while applications are being retrieved";
      let title = "Loading Applications...";

      return (
        <CenteredInlineDialogComponent>
          <div>
            <i className="icon icon-large loading"></i>
            <h3 className="h3">{title}</h3>
            <p className="muted">{message}</p>
          </div>
        </CenteredInlineDialogComponent>
      );
    }

    if (pageHasNoRunningApps) {
      let message = "Do more with Marathon by creating and organizing " +
        "your applications.";
      return (
        <CenteredInlineDialogComponent additionalClasses="muted"
            title="No Applications Created"
            message={message}>
          <Link className="btn btn-lg btn-success"
              to={path}
              query={newAppModalQuery}>
            Create Application
          </Link>
        </CenteredInlineDialogComponent>
      );
    }

    if (pageHasNoMatchingApps) {
      return (
        <CenteredInlineDialogComponent title="No Applications Found"
            message="No applications match your criteria.">
          <Link className="btn btn-lg btn-success"
              to="apps">
            Show all Applications
          </Link>
        </CenteredInlineDialogComponent>
      );
    }

    if (pageHasEmptyGroup) {
      let message = "No Applications in this Group.";
      return (
        <CenteredInlineDialogComponent additionalClasses="muted"
          title="No Applications Created"
          message={message}>
          <Link className="btn btn-lg btn-success"
            to={path}
            query={newAppModalQuery}>
            Create Application
          </Link>
        </CenteredInlineDialogComponent>
      );
    }

    return null;
  },

  render: function () {
    var state = this.state;
    var appNodes = this.getAppListItems();

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !state.sortDescending
    });

    var errorClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_ERROR
    });

    var unauthorizedClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_UNAUTHORIZED
    });

    var forbiddenClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_FORBIDDEN
    });

    var tableClassSet = classNames({
      "table table-fixed app-list": true,
      "table-hover table-selectable":
        state.apps.length !== 0 &&
        state.fetchState !== States.STATE_LOADING
    });

    var idClassSet = classNames("text-left name-cell", {
      "cell-highlighted": state.sortKey === "id"
    });

    var cpuClassSet = classNames("text-right cpu-cell", {
      "cell-highlighted": state.sortKey === "totalCpus"
    });

    var memClassSet = classNames("text-right ram-cell", {
      "cell-highlighted": state.sortKey === "totalMem"
    });

    var statusClassSet = classNames("status-cell", {
      "cell-highlighted": state.sortKey === "status"
    });

    var tasksClassSet = classNames("text-right instances-cell", {
      "cell-highlighted": state.sortKey === "tasksRunning"
    });

    var healthClassSet = classNames("health-cell", {
      "cell-highlighted": state.sortKey === "healthWeight"
    });

    var totalColumnSpan = 8;

    var statusTooltipMessage = (
      <span>
        At-a-glance overview of the global application or group state.
        <a href={ExternalLinks.DOCS_STATUS} target="_blank">Read more</a>.
      </span>
    );

    var healthTooltipMessage = (
      <span>
        General health condition of the application tasks.
        <a href={ExternalLinks.DOCS_HEALTH} target="_blank">Read more</a>.
      </span>
    );

    return (
      <div>
        <table className={tableClassSet}>
          <colgroup>
            <col className="icon-col" />
            <col className="name-col" />
            <col className="cpu-col" />
            <col className="ram-col" />
            <col className="status-col" />
            <col className="instances-col" />
            <col className="health-col" />
            <col className="actions-col" />
          </colgroup>
          <thead>
            <tr>
              <th className={idClassSet} colSpan="2">
                <span onClick={this.sortBy.bind(null, "id")}
                    className={headerClassSet}>
                  Name {this.getCaret("id")}
                </span>
              </th>
              <th className={cpuClassSet}>
                <span onClick={this.sortBy.bind(null, "totalCpus")}
                    className={headerClassSet}>
                  {this.getCaret("totalCpus")} CPU
                </span>
              </th>
              <th className={memClassSet}>
                <span onClick={this.sortBy.bind(null, "totalMem")}
                    className={headerClassSet}>
                  {this.getCaret("totalMem")} Memory
                </span>
              </th>
              <th className={statusClassSet}>
                <div onClick={this.sortBy.bind(null, "status")}
                    className={headerClassSet}>
                  <div>Status</div>
                  <TooltipComponent message={statusTooltipMessage}>
                    <i className="icon icon-xs help" />
                  </TooltipComponent>
                  {this.getCaret("status")}
                </div>
              </th>
              <th className={tasksClassSet}>
                <span onClick={this.sortBy.bind(null, "tasksRunning")}
                    className={headerClassSet}>
                  {this.getCaret("tasksRunning")} Running Instances
                </span>
              </th>
              <th className={healthClassSet} colSpan="2">
                <div onClick={this.sortBy.bind(null, "healthWeight")}
                    className={headerClassSet}>
                  <div>Health</div>
                  <TooltipComponent message={healthTooltipMessage}>
                    <i className="icon icon-xs help" />
                  </TooltipComponent>
                  {this.getCaret("healthWeight")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className={errorClassSet}>
              <td className="text-center text-danger" colSpan={totalColumnSpan}>
                {`Error fetching apps. ${Messages.RETRY_REFRESH}`}
              </td>
            </tr>
            <tr className={unauthorizedClassSet}>
              <td className="text-center text-danger" colSpan={totalColumnSpan}>
                {`Error fetching apps. ${Messages.UNAUTHORIZED}`}
              </td>
            </tr>
            <tr className={forbiddenClassSet}>
              <td className="text-center text-danger" colSpan={totalColumnSpan}>
                {`Error fetching apps. ${Messages.FORBIDDEN}`}
              </td>
            </tr>
            {appNodes}
          </tbody>
        </table>
        {this.getInlineDialog(appNodes)}
      </div>
    );
  }
});

export default AppListComponent;
