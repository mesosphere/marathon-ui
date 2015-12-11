var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var AppListViewTypes = require("../constants/AppListViewTypes");
var AppStatus = require("../constants/AppStatus");
var FilterTypes = require("../constants/FilterTypes");
var Messages = require("../constants/Messages");
var States = require("../constants/States");
var AppListItemComponent = require("./AppListItemComponent");

var AppsActions = require("../actions/AppsActions");
var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");

var Util = require("../helpers/Util");

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

function getInitialAppStatusesCount() {
  return Object.values(AppStatus).reduce(function (memo, status) {
    memo[status] = 0;
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
    router: React.PropTypes.func
  },

  propTypes: {
    currentGroup: React.PropTypes.string.isRequired,
    filters: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      filters: {}
    };
  },

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
    return Object.values(this.props.filters).some(filter => {
      return filter != null &&
        (Util.isArray(filter) && filter.length > 0) ||
        (Util.isString(filter) && filter !== "");
    });
  },

  filterNodes: function (nodesSequence, appsStatusesCount) {
    var props = this.props;
    var currentGroup = props.currentGroup;
    var filters = props.filters;

    var filterText = filters[FilterTypes.TEXT];
    var filterLabels = filters[FilterTypes.LABELS];
    var filterStatus = filters[FilterTypes.STATUS];

    if (filterText != null && filterText !== "") {
      nodesSequence = nodesSequence
        .filter(app => app.id.indexOf(filterText) !== -1);
    } else if (currentGroup !== "/") {
      nodesSequence = nodesSequence
          .filter(app => app.id.startsWith(currentGroup));
    }

    nodesSequence.each(app => {
      appsStatusesCount[app.status]++;
    });

    if (filterLabels != null && filterLabels.length > 0) {
      nodesSequence = nodesSequence.filter(app => {
        let labels = app.labels;
        if (labels == null || Object.keys(labels).length === 0) {
          return false;
        }

        return filterLabels.some(label => {
          let [key, value] = label;
          return labels[key] === value;
        });
      });
    }

    if (filterStatus != null && filterStatus.length > 0) {
      nodesSequence = nodesSequence.filter(app => {
        if (app.status == null) {
          return false;
        }
        let appStatus = app.status.toString();

        return filterStatus.some(status => appStatus === status);
      });
    }

    return nodesSequence;
  },

  getGroupedNodes: function (apps, appsStatusesCount) {
    var currentGroup = this.props.currentGroup;

    var appsInGroup = apps.filter(app => app.id.startsWith(currentGroup));

    appsInGroup.forEach(app => {
      appsStatusesCount[app.status]++;
    });

    return appsInGroup
      .reduce((memo, app) => {
        let relativePath = app.id.substring(currentGroup.length);
        let pathParts = relativePath.split("/");
        let isGroup = pathParts.length > 1;

        if (!isGroup) {
          memo.push(app);
        } else {
          let groupId = currentGroup + pathParts[0];
          let group = memo.find(item => {
            return item.id === groupId;
          });

          if (group == null) {
            group = initGroupNode(groupId, app);
            memo.push(group);
          } else {
            updateGroupNode(group, app);
          }
        }
        return memo;
      }, []);
  },

  getAppListItems: function () {
    var state = this.state;
    var sortKey = state.sortKey;
    var props = this.props;
    var appListViewType = AppListViewTypes.GROUPED_LIST;

    var sortDirection = state.sortDescending ? 1 : -1;

    var nodesSequence;

    var appsStatusesCount = getInitialAppStatusesCount();

    // Global search view - only display filtered apps
    if (this.hasFilters()) {
      appListViewType = AppListViewTypes.APP_LIST;
      nodesSequence = this.filterNodes(lazy(state.apps), appsStatusesCount)
        .sortBy((app) => {
          return app[sortKey];
        }, state.sortDescending);

    // Grouped node view
    } else {
      nodesSequence = lazy(this.getGroupedNodes(state.apps, appsStatusesCount))
        // Alphabetically presort
        .sortBy((app) => {
          return app.id;
        }, state.sortDescending)
        // Hoist groups to top of the app list and sort everything by sortKey
        .sort((a, b) => {
          if (a.isGroup && !b.isGroup) {
            return -1;
          } else if (b.isGroup && !a.isGroup) {
            return 1;
          } else {
            return a[sortKey] > b[sortKey]
              ? -1 * sortDirection
              : 1 * sortDirection;
          }
        });
    }

    var appListItems = nodesSequence
      .map(app => {
        return (
          <AppListItemComponent key={app.id}
            model={app}
            currentGroup={props.currentGroup}
            viewType={appListViewType} />
        );
      })
      .value();

    AppsActions.emitAppStatusesCount(appsStatusesCount);

    return appListItems;
  },

  getCaret: function (sortKey) {
    if (sortKey === this.state.sortKey) {
      return (
        <span className="caret"></span>
      );
    }
    return null;
  },

  render: function () {
    var state = this.state;
    var appNodes = this.getAppListItems();

    var pageIsLoading = state.fetchState === States.STATE_LOADING;
    var pageHasApps = state.apps.length > 0;

    var loadingClassSet = classNames({
      "hidden": !pageIsLoading
    });

    var noAppsClassSet = classNames({
      "hidden": pageIsLoading || pageHasApps ||
        state.fetchState === States.STATE_UNAUTHORIZED ||
        state.fetchState === States.STATE_FORBIDDEN
    });

    var noRunningAppsClassSet = classNames({
      "hidden": !pageHasApps || appNodes.length > 0
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

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !state.sortDescending
    });

    var tableClassSet = classNames({
      "table table-fixed app-list": true,
      "table-hover table-selectable":
        state.apps.length !== 0 &&
        state.fetchState !== States.STATE_LOADING
    });

    return (
      <table className={tableClassSet}>
        <colgroup>
          <col className="icon-col" />
          <col className="name-col" />
          <col className="cpu-col" />
          <col className="ram-col" />
          <col className="status-col" />
          <col className="instances-col" />
          <col className="health-col" />
        </colgroup>
        <thead>
          <tr>
            <th className="text-left name-cell" colSpan="2">
              <span onClick={this.sortBy.bind(null, "id")}
                  className={headerClassSet}>
                Name {this.getCaret("id")}
              </span>
            </th>
            <th className="text-right cpu-cell">
              <span onClick={this.sortBy.bind(null, "totalCpus")}
                  className={headerClassSet}>
                {this.getCaret("totalCpus")} CPU
              </span>
            </th>
            <th className="text-right ram-cell">
              <span onClick={this.sortBy.bind(null, "totalMem")}
                    className={headerClassSet}>
                {this.getCaret("totalMem")} Memory
              </span>
            </th>
            <th className="status-cell">
              <span onClick={this.sortBy.bind(null, "status")}
                    className={headerClassSet}>
                Status {this.getCaret("status")}
              </span>
            </th>
            <th className="text-right instances-cell">
              <span onClick={this.sortBy.bind(null, "tasksRunning")}
                  className={headerClassSet}>
                {this.getCaret("tasksRunning")} Running Instances
              </span>
            </th>
            <th className="health-cell">
              <span onClick={this.sortBy.bind(null, "healthWeight")}
                  className={headerClassSet}>
                {this.getCaret("healthWeight")} Health
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className={loadingClassSet}>
            <td className="text-center text-muted" colSpan="8">
              Loading apps...
            </td>
          </tr>
          <tr className={noAppsClassSet}>
            <td className="text-center" colSpan="8">No running apps.</td>
          </tr>
          <tr className={noRunningAppsClassSet}>
            <td className="text-center" colSpan="8">
              No apps match your query.
            </td>
          </tr>
          <tr className={errorClassSet}>
            <td className="text-center text-danger" colSpan="8">
              {`Error fetching apps. ${Messages.RETRY_REFRESH}`}
            </td>
          </tr>
          <tr className={unauthorizedClassSet}>
            <td className="text-center text-danger" colSpan="8">
              {`Error fetching apps. ${Messages.UNAUTHORIZED}`}
            </td>
          </tr>
          <tr className={forbiddenClassSet}>
            <td className="text-center text-danger" colSpan="8">
              {`Error fetching apps. ${Messages.FORBIDDEN}`}
            </td>
          </tr>
          {appNodes}
        </tbody>
      </table>
    );
  }
});

module.exports = AppListComponent;
