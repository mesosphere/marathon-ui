var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var States = require("../constants/States");
var AppsStore = require("../stores/AppsStore");
var AppVersionsActions = require("../actions/AppVersionsActions");
var AppsEvents = require("../events/AppsEvents");
var AppVersionsEvents = require("../events/AppVersionsEvents");
var AppVersionsStore = require("../stores/AppVersionsStore");
var AppVersionComponent = require("../components/AppVersionComponent");
var AppVersionListItemComponent =
  require("../components/AppVersionListItemComponent");
var PagedContentComponent = require("../components/PagedContentComponent");
var PagedNavComponent = require("../components/PagedNavComponent");
var util = require("../helpers/util");

var AppVersionListComponent = React.createClass({
  displayName: "AppVersionListComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    var props = this.props;

    return {
      appVersions: AppVersionsStore.getAppVersions(props.appId),
      currentPage: 0,
      itemsPerPage: 8,
      fetchState: States.STATE_LOADING
    };
  },

  componentWillMount: function () {
    AppVersionsStore.on(AppVersionsEvents.CHANGE, this.onAppVersionsChange);
    AppVersionsStore.on(AppVersionsEvents.REQUEST_APP_VERSIONS_ERROR,
      this.onAppVersionsRequestError);
    AppsStore.on(AppsEvents.APPLY_APP, this.onAppApplySettings);
    AppsStore.on(AppsEvents.APPLY_APP_ERROR, this.onAppApplySettingsError);
  },

  componentDidMount: function () {
    AppVersionsActions.requestAppVersions(this.props.appId);
  },

  componentWillUnmount: function () {
    AppVersionsStore.removeListener(
      AppVersionsEvents.CHANGE,
      this.onAppVersionsChange);
    AppVersionsStore.removeListener(
      AppVersionsEvents.REQUEST_APP_VERSIONS_ERROR,
      this.onAppVersionsRequestError
    );
    AppsStore.removeListener(AppsEvents.APPLY_APP, this.onAppApplySettings);
    AppsStore.removeListener(
      AppsEvents.APPLY_APP_ERROR,
      this.onAppApplySettingsError
    );
  },

  onAppVersionsChange: function () {
    this.setState({
      appVersions: AppVersionsStore.getAppVersions(this.props.appId),
      fetchState: States.STATE_SUCCESS
    });
  },

  onAppVersionsRequestError: function () {
    this.setState({
      fetchState: States.STATE_ERROR
    });
  },

  onAppApplySettings: function () {
    AppVersionsActions.requestAppVersions(this.props.appId);
  },

  onAppApplySettingsError: function (errorMessage) {
    util.alert("Could not update to chosen version: " +
      (errorMessage.message || errorMessage));
  },

  handleRefresh: function () {
    AppVersionsActions.requestAppVersions(this.props.appId);
  },

  handlePageChange: function (pageNum) {
    this.setState({currentPage: pageNum});
  },

  getAppVersionList: function (appVersions) {
    var props = this.props;

    return lazy(appVersions).map(function (versionTimestamp) {
      return (
        <AppVersionListItemComponent
          appId={props.appId}
          appVersionTimestamp={versionTimestamp}
          key={versionTimestamp} />
      );
    }).value();
  },

  getPagedNav: function (appVersions) {
    var itemsPerPage = this.state.itemsPerPage;

    // at least two pages
    if (appVersions.length > itemsPerPage) {
      return (
        <PagedNavComponent
          className="pull-right"
          currentPage={this.state.currentPage}
          onPageChange={this.handlePageChange}
          itemsPerPage={itemsPerPage}
          noItems={appVersions.length}
          useArrows={true} />
      );
    }

    return null;
  },

  getAppVersionTable: function () {
    var state = this.state;

    // take out current version, to be displayed seperately
    var appVersions = state.appVersions.slice(1);

    var loadingClassSet = classNames({
      "text-muted text-center": true,
      "hidden": state.fetchState !== States.STATE_LOADING
    });

    var errorClassSet = classNames({
      "text-danger text-center": true,
      "hidden": state.fetchState === States.STATE_LOADING ||
        state.fetchState === States.STATE_SUCCESS
    });

    // at least one older version
    if (appVersions.length > 0) {
      return (
        <div className="panel-group">
          <div className="panel panel-header panel-inverse">
            <div className="panel-heading">
              Older versions
              {this.getPagedNav(appVersions)}
            </div>
          </div>
          <PagedContentComponent
              currentPage={state.currentPage}
              itemsPerPage={state.itemsPerPage}>
            <p className={loadingClassSet}>Loading versions...</p>
            <p className={errorClassSet}>Error fetching app versions</p>
            {this.getAppVersionList(appVersions)}
          </PagedContentComponent>
        </div>
      );
    }

    return null;
  },

  render: function () {
    return (
      <div>
        <h5>
          Current Version
          <button className="btn btn-sm btn-info pull-right"
              onClick={this.handleRefresh}>
            ↻ Refresh
          </button>
        </h5>
        <AppVersionComponent
          appVersion={AppsStore.getCurrentApp(this.props.appId)}
          currentVersion={true} />
        {this.getAppVersionTable()}
      </div>
    );
  }
});

module.exports = AppVersionListComponent;
