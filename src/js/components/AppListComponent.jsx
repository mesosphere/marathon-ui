var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var Messages = require("../constants/Messages");
var States = require("../constants/States");
var AppListItemComponent = require("./AppListItemComponent");

var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");

var AppListViewTypes = require("../constants/AppListViewTypes");

function createGroup(groupId, app) {
  return {
    id: groupId,
    instances: app.instances,
    tasksRunning: app.tasksRunning,
    totalCpus: app.totalCpus,
    totalMem: app.totalMem,
    isGroup: true
  };
}

function updateGroup(group, app) {
  group.instances += app.instances;
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
    filterLabels: React.PropTypes.array,
    filterStatus: React.PropTypes.array,
    filterText: React.PropTypes.string,
    filterType: React.PropTypes.array,
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

  getAppsInGroup: function () {
    var apps = this.state.apps;
    var currentGroup = this.props.currentGroup;

    return lazy(apps)
      .filter((app) => app.id.startsWith(currentGroup))
      .reduce((memo, app) => {
        let relativePath = app.id.substring(currentGroup.length);
        let pathParts = relativePath.split("/");
        let isGroup = pathParts.length > 1;

        if (!isGroup) {
          memo.push(app);
        } else {
          let groupId = currentGroup + pathParts[0];
          let group = memo.find((item) => {
            return item.id === groupId;
          });

          if (group == null) {
            group = createGroup(groupId, app);
            memo.unshift(group);
          } else {
            updateGroup(group, app);
          }
        }
        return memo;
      }, []);
  },

  getAppNodes: function () {
    var state = this.state;
    var sortKey = state.sortKey;
    var props = this.props;

    var appsSequence = lazy(this.getAppsInGroup());

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
          let [key, value] = lazy(label).toArray()[0];
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

    return appsSequence
      .sortBy((app) => {
        return app[sortKey];
      }, state.sortDescending)
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
      })
      .value();
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
          <col className="name" />
          <col className="cpu" />
          <col className="ram" />
          <col className="status" />
          <col className="tasks" />
          <col className="health" />
          <col className="actions" />
        </colgroup>
        <thead>
          <tr>
            <th className="text-left appid">
              <span onClick={this.sortBy.bind(null, "id")}
                  className={headerClassSet}>
                Name {this.getCaret("id")}
              </span>
            </th>
            <th className="text-right cpu">
              <span onClick={this.sortBy.bind(null, "totalCpus")}
                  className={headerClassSet}>
                {this.getCaret("totalCpus")} CPU
              </span>
            </th>
            <th className="text-right ram">
              <span onClick={this.sortBy.bind(null, "totalMem")}
                    className={headerClassSet}>
                {this.getCaret("totalMem")} Memory
              </span>
            </th>
            <th className="status">
              <span onClick={this.sortBy.bind(null, "status")}
                    className={headerClassSet}>
                {this.getCaret("status")} Status
              </span>
            </th>
            <th className="text-right tasks" colSpan="2">
              <span onClick={this.sortBy.bind(null, "instances")}
                  className={headerClassSet}>
                {this.getCaret("instances")} Running Tasks
              </span>
            </th>
            <th className="text-center actions"></th>
          </tr>
        </thead>
        <tbody>
          <tr className={loadingClassSet}>
            <td className="text-center text-muted" colSpan="7">
              Loading apps...
            </td>
          </tr>
          <tr className={noAppsClassSet}>
            <td className="text-center" colSpan="7">No running apps.</td>
          </tr>
          <tr className={noRunningAppsClassSet}>
            <td className="text-center" colSpan="7">
              No apps match your query.
            </td>
          </tr>
          <tr className={errorClassSet}>
            <td className="text-center text-danger" colSpan="7">
              {`Error fetching apps. ${Messages.RETRY_REFRESH}`}
            </td>
          </tr>
          <tr className={unauthorizedClassSet}>
            <td className="text-center text-danger" colSpan="7">
              {`Error fetching apps. ${Messages.UNAUTHORIZED}`}
            </td>
          </tr>
          <tr className={forbiddenClassSet}>
            <td className="text-center text-danger" colSpan="7">
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
