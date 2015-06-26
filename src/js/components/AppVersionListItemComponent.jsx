var classNames = require("classnames");
var React = require("react/addons");

var AppVersionsActions = require("../actions/AppVersionsActions");
var AppVersionsEvents = require("../events/AppVersionsEvents");
var AppVersionsStore = require("../stores/AppVersionsStore");
var AppVersionComponent = require("../components/AppVersionComponent");
var States = require("../constants/States");

var AppVersionListItemComponent = React.createClass({
  displayName: "AppVersionListItemComponent",

  propTypes: {
    app: React.PropTypes.object.isRequired,
    appVersionTimestamp: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    var props = this.props;

    return {
      open: false,
      fetchState: States.STATE_LOADING,
      appVersion: AppVersionsStore.getAppVersion(
        props.app.id,
        props.appVersionTimestamp
      )
    };
  },

  componentWillMount: function () {
    AppVersionsStore.on(AppVersionsEvents.CHANGE, this.onAppVersionChange);
    AppVersionsStore.on(AppVersionsEvents.REQUEST_APP_VERSION_ERROR,
      this.onAppVersionRequestError);
  },

  componentDidMount: function () {
    var props = this.props;

    if (this.state.open) {
      AppVersionsActions.requestAppVersion(
        props.app.id,
        props.appVersionTimestamp
      );
    }
  },

  componentWillUnmount: function () {
    AppVersionsStore.removeListener(AppVersionsEvents.CHANGE,
      this.onAppVersionChange);
    AppVersionsStore.removeListener(
      AppVersionsEvents.REQUEST_APP_VERSION_ERROR,
      this.onAppVersionRequestError
    );
  },

  onAppVersionChange: function () {
    var props = this.props;

    this.setState({
      appVersion: AppVersionsStore.getAppVersion(
        props.app.id,
        props.appVersionTimestamp
      ),
      fetchState: States.STATE_SUCCESS
    });
  },

  onAppVersionRequestError: function () {
    this.setState({
      fetchState: States.STATE_ERROR
    });
  },

  handleDetailsClick: function (event) {
    var props = this.props;
    var state = this.state;

    if (event.target.type === "radio") {
      // handled by other functions
      return;
    }
    event.preventDefault();

    if (state.fetchState !== States.STATE_SUCCESS) {
      AppVersionsActions.requestAppVersion(
        props.app.id,
        props.appVersionTimestamp
      );
    }
    this.setState({open: !state.open});
  },

  getAppVersionComponent: function () {
    var props = this.props;
    var state = this.state;

    if (state.fetchState !== States.STATE_LOADING &&
        state.fetchState !== States.STATE_ERROR) {
      return (
        <AppVersionComponent
          className="dl-unstyled"
          app={props.app}
          appVersion={state.appVersion} />
      );
    }

    return null;
  },

  getAppVersion: function () {
    var state = this.state;

    var loadingClassSet = classNames({
      "text-center text-muted": true,
      "hidden": state.fetchState !== States.STATE_LOADING
    });

    var errorClassSet = classNames({
      "text-center text-danger": true,
      "hidden": state.fetchState !== States.STATE_ERROR
    });

    if (this.state.open) {
      return (
        <div className="panel-body">
          <p className={loadingClassSet}>
            Loading version details...
          </p>
          <p className={errorClassSet}>
            Error fetching version details. Refresh the list to try again.
          </p>
          {this.getAppVersionComponent()}
        </div>
      );
    }

    return null;
  },

  render: function () {
    var versionDate = new Date(this.props.appVersionTimestamp);
    var versionDateISOString = versionDate.toISOString();

    var caretClassSet = classNames({
      "clickable text-right col-xs-2": true,
      "dropup": this.state.open
    });

    return (
      <div className="panel panel-inverse">
        <div className="panel-heading clickable"
            onClick={this.handleDetailsClick}>
          <div className="row">
            <div className="col-xs-10">
              <time dateTime={versionDateISOString}
                  title={versionDateISOString}>
                {versionDate.toLocaleString()}
              </time>
            </div>
            <div className={caretClassSet}>
              <span className="caret"></span>
            </div>
          </div>
        </div>
        {this.getAppVersion()}
      </div>
    );
  }
});

module.exports = AppVersionListItemComponent;
