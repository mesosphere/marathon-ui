var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var States = require("../constants/States");
var AppComponent = require("../components/AppComponent");

var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");

var AppListComponent = React.createClass({
  displayName: "AppListComponent",

  propTypes: {
    filterText: React.PropTypes.string
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

  onAppsRequestError: function () {
    this.setState({
      fetchState: States.STATE_ERROR
    });
  },

  sortBy: function (sortKey) {
    var state = this.state;

    this.setState({
      sortKey: sortKey,
      sortDescending: state.sortKey === sortKey && !state.sortDescending
    });
  },

  getAppNodes: function () {
    var state = this.state;
    var sortKey = state.sortKey;
    var props = this.props;

    return lazy(state.apps)
      .sortBy(function (app) {
        return app[sortKey];
      }, state.sortDescending)
      .filter(function (app) {
        return app.id.indexOf(props.filterText || "") !== -1;
      })
      .map(function (app) {
        return (
          <AppComponent key={app.id} model={app} />
        );
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
    var noAppsOnPage = state.apps.length === 0;

    var loadingClassSet = classNames({
      "hidden": !pageIsLoading
    });

    var noAppsClassSet = classNames({
      "hidden": pageIsLoading || !noAppsOnPage
    });

    var noRunningAppsClassSet = classNames({
      "hidden": noAppsOnPage || appNodes.length > 0
    });

    var errorClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_ERROR
    });

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !state.sortDescending
    });

    var tableClassSet = classNames({
      "table table-fixed": true,
      "table-hover table-selectable":
        state.apps.length !== 0 &&
        state.fetchState !== States.STATE_LOADING
    });

    return (
      <table className={tableClassSet}>
        <colgroup>
          <col style={{width: "28%"}} />
          <col style={{width: "14%"}} />
          <col style={{width: "14%"}} />
          <col style={{width: "14%"}} />
          <col style={{width: "14%"}} />
          <col style={{width: "16%"}} />
        </colgroup>
        <thead>
          <tr>
            <th>
              <span onClick={this.sortBy.bind(null, "id")}
                  className={headerClassSet}>
                ID {this.getCaret("id")}
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortBy.bind(null, "mem")}
                  className={headerClassSet}>
                {this.getCaret("mem")} Memory (MB)
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortBy.bind(null, "cpus")}
                  className={headerClassSet}>
                {this.getCaret("cpus")} CPUs
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortBy.bind(null, "instances")}
                  className={headerClassSet}>
                {this.getCaret("instances")} Tasks / Instances
              </span>
            </th>
            <th className="text-right">
              <span className={headerClassSet}>
                Health
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortBy.bind(null, "status")}
                  className={headerClassSet}>
                {this.getCaret("status")} Status
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className={loadingClassSet}>
            <td className="text-center text-muted" colSpan="6">
              Loading apps...
            </td>
          </tr>
          <tr className={noAppsClassSet}>
            <td className="text-center" colSpan="6">No running apps.</td>
          </tr>
          <tr className={noRunningAppsClassSet}>
            <td className="text-center" colSpan="6">No apps match your query.</td>
          </tr>
          <tr className={errorClassSet}>
            <td className="text-center text-danger" colSpan="6">
              Error fetching apps. Refresh to try again.
            </td>
          </tr>
          {appNodes}
        </tbody>
      </table>
    );
  }
});

module.exports = AppListComponent;
