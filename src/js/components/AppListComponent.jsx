var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var States = require("../constants/States");
var AppComponent = require("../components/AppComponent");
var BackboneMixin = require("../mixins/BackboneMixin");

var AppsStore = require("../stores/AppsStore");
var AppsEvents = require("../events/AppsEvents");

var AppListComponent = React.createClass({
  displayName: "AppListComponent",

  propTypes: {
    router: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      apps: [],
      fetchState: States.STATE_LOADING
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CHANGE, this.onAppsChange);
    AppsStore.on(AppsEvents.REQUEST_APPS_ERROR, this.onAppsRequestError);
  },

  componentWillUnmount: function () {
    DeploymentStore.removeListener(AppsEvents.CHANGE,
      this.onAppsChange);
    DeploymentStore.removeListener(AppsEvents.REQUEST_APPS_ERROR,
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

  sortCollectionBy: function (comparator) {
    var collection = this.props.collection;
    comparator =
      collection.sortKey === comparator && !collection.sortReverse ?
      "-" + comparator :
      comparator;
    collection.setComparator(comparator);
    collection.sort();
  },

  getAppNodes: function () {
    var state = this.state;

    return lazy(state.apps)
      .map(function (app) {
        return (
          <AppComponent key={app.id} model={app} router={this.props.router} />
        );
      })
      .value();
  },

  render: function () {
    var state = this.state;
    var sortKey = this.props.collection.sortKey;

    var loadingClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_LOADING
    });

    var noAppsClassSet = classNames({
      "hidden": state.apps.length !== 0
    });

    var errorClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_ERROR
    });

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": this.props.collection.sortReverse
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
              <span onClick={this.sortCollectionBy.bind(null, "id")} className={headerClassSet}>
                ID {sortKey === "id" ? <span className="caret"></span> : null}
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortCollectionBy.bind(null, "mem")} className={headerClassSet}>
                {sortKey === "mem" ? <span className="caret"></span> : null} Memory (MB)
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortCollectionBy.bind(null, "cpus")} className={headerClassSet}>
                {sortKey === "cpus" ? <span className="caret"></span> : null} CPUs
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortCollectionBy.bind(null, "instances")} className={headerClassSet}>
                {sortKey === "instances" ? <span className="caret"></span> : null} Tasks / Instances
              </span>
            </th>
            <th className="text-right">
              <span className={headerClassSet}>
                Health
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortCollectionBy.bind(null, "isDeploying")} className={headerClassSet}>
                {sortKey === "isDeploying" ? <span className="caret"></span> : null} Status
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
          <tr className={errorClassSet}>
            <td className="text-center text-danger" colSpan="6">
              Error fetching apps. Refresh to try again.
            </td>
          </tr>
          {this.getAppNodes()}
        </tbody>
      </table>
    );
  }
});

module.exports = AppListComponent;
