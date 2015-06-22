var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var States = require("../constants/States");
var AppVersionsActions = require("../actions/AppVersionsActions");
var AppVersionsEvents = require("../events/AppVersionsEvents");
var AppVersionsStore = require("../stores/AppVersionsStore");
var AppVersionComponent = require("../components/AppVersionComponent");
var AppVersionListItemComponent =
  require("../components/AppVersionListItemComponent");
var PagedContentComponent = require("../components/PagedContentComponent");
var PagedNavComponent = require("../components/PagedNavComponent");

var AppVersionListComponent = React.createClass({
  displayName: "AppVersionListComponent",

  propTypes: {
    app: React.PropTypes.object.isRequired,
    onRollback: React.PropTypes.func
  },

  getInitialState: function () {
    var props = this.props;

    return {
      appVersions: AppVersionsStore.getAppVersions(props.app.id),
      currentPage: 0,
      itemsPerPage: 8,
      fetchState: States.STATE_LOADING
    };
  },

  componentWillMount: function () {
    AppVersionsStore.on(AppVersionsEvents.CHANGE, this.onAppVersionsChange);
    AppVersionsStore.on(AppVersionsEvents.REQUEST_APP_VERSIONS_ERROR,
      this.onAppVersionsRequestError);
  },

  componentDidMount: function () {
    AppVersionsActions.requestAppVersions(this.props.app.id);
  },

  componentWillUnmount: function () {
    AppVersionsStore.removeListener(AppVersionsEvents.CHANGE,
      this.onAppVersionsChange);
    AppVersionsStore.removeListener(
      AppVersionsEvents.REQUEST_APP_VERSIONS_ERROR,
      this.onAppVersionsRequestError
    );
  },

  onAppVersionsChange: function () {
    this.setState({
      appVersions: AppVersionsStore.getAppVersions(this.props.app.id),
      fetchState: States.STATE_SUCCESS
    });
  },

  onAppVersionsRequestError: function () {
    this.setState({
      fetchState: States.STATE_ERROR
    });
  },

  handleRefresh: function () {
    AppVersionsActions.requestAppVersions(this.props.app.id);
  },

  handlePageChange: function (pageNum) {
    this.setState({currentPage: pageNum});
  },

  getAppVersionList: function (appVersions) {
    var props = this.props;

    return lazy(appVersions).map(function (versionTimestamp) {
      return (
        <AppVersionListItemComponent
          app={props.app}
          appVersionTimestamp={versionTimestamp}
          key={versionTimestamp}
          onRollback={props.onRollback} />
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
          app={this.props.app}
          appVersion={this.props.app}
          currentVersion={true} />
          {this.getAppVersionTable()}
      </div>
    );
  }
});

module.exports = AppVersionListComponent;
