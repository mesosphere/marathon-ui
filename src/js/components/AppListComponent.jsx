var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var AppListViewTypes = require("../constants/AppListViewTypes");
var AppStatus = require("../constants/AppStatus");
var Messages = require("../constants/Messages");
var States = require("../constants/States");
var AppListItemComponent = require("./AppListItemComponent");

var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");

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
      groupHealth.find(groupHealthState => {
        return groupHealthState.state === appHealthState.state;
      });

    if (groupHealthState == null) {
      return Object.assign({}, appHealthState);
    }

    groupHealthState.quantity += appHealthState.quantity;

    return groupHealthState;
  });
}

function initGroupNode(groupId, app) {
  return {
    id: groupId,
    instances: app.instances,
    status: getGroupStatus(null, app.status),
    health: getGroupHealth(null, app.health),
    tasksRunning: app.tasksRunning,
    totalCpus: app.totalCpus,
    totalMem: app.totalMem,
    isGroup: true
  };
}

function updateGroupNode(group, app) {
  group.instances += app.instances;
  group.tasksRunning += app.tasksRunning;
  group.totalCpus += app.totalCpus;
  group.totalMem += app.totalMem;
  group.status = getGroupStatus(group.status, app.status);
  group.health = getGroupHealth(group.health, app.health);
  return group;
}

var AppListComponent = React.createClass({
  displayName: "AppListComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    currentGroup: React.PropTypes.string.isRequired,
    filterLabels: React.PropTypes.array,
    filterStatus: React.PropTypes.array,
    filterText: React.PropTypes.string,
    filterTypes: React.PropTypes.array,
    viewType: React.PropTypes.oneOf(Object.values(AppListViewTypes))
  },

  getDefaultProps: function () {
    return {
      viewType: AppListViewTypes.LIST
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

  getGroupedNodes: function (appsSequence) {
    var currentGroup = this.props.currentGroup;

    return appsSequence
      .filter(app => app.id.startsWith(currentGroup))
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

  getAppNodes: function () {
    var state = this.state;
    var sortKey = state.sortKey;
    var props = this.props;

    var appsSequence = lazy(state.apps);

    if (props.filterText != null && props.filterText !== "") {
      appsSequence = appsSequence
        .filter(function (app) {
          return app.id.indexOf(props.filterText) !== -1;
        });
    }

    if (props.filterLabels != null && props.filterLabels.length > 0) {
      appsSequence = appsSequence.filter(function (app) {
        let labels = app.labels;
        if (labels == null || Object.keys(labels).length === 0) {
          return false;
        }

        return lazy(props.filterLabels).some(function (label) {
          let [key, value] = label;
          return labels[key] === value;
        });
      });
    }

    if (props.filterStatus != null && props.filterStatus.length > 0) {
      appsSequence = appsSequence.filter(function (app) {
        if (app.status == null) {
          return false;
        }
        let appStatus = app.status.toString();

        return lazy(props.filterStatus).some(function (status) {
          return appStatus === status;
        });
      });
    }

    if (props.filterTypes != null && props.filterTypes.length > 0) {
      appsSequence = appsSequence.filter(function (app) {
        return lazy(props.filterTypes).some(function (type) {
          return app.type === type;
        });
      });
    }

    appsSequence
      // Alphabetically presort
      .sortBy((app) => {
        return app.id;
      }, state.sortDescending);

    let sortDirection = state.sortDescending ? 1 : -1;

    return this.getGroupedNodes(appsSequence)
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
      })
      .map((app) => {
        switch (props.viewType) {
          case AppListViewTypes.LIST:
            return (
              <AppListItemComponent key={app.id}
                model={app}
                currentGroup={props.currentGroup} />
            );
          default:
            return null;
        }
      });
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
    var appNodes = this.getAppNodes();

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
          <col className="actions-col" />
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
            <th className="text-right instances-cell" colSpan="3">
              <span onClick={this.sortBy.bind(null, "tasksRunning")}
                  className={headerClassSet}>
                {this.getCaret("tasksRunning")} Running Instances
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
