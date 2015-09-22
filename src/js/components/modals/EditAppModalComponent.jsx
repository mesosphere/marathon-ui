var React = require("react/addons");
var Util = require("../../helpers/Util");

var AppVersionsActions = require("../../actions/AppVersionsActions");
var AppVersionsEvents = require("../../events/AppVersionsEvents");
var AppVersionsStore = require("../../stores/AppVersionsStore");
var DialogActions = require("../../actions/DialogActions");

var AppModalComponent = require("./AppModalComponent");

var EditAppModalComponent = React.createClass({
  displayName: "EditAppModalComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired,
    appVersion: React.PropTypes.string.isRequired,
    onDestroy: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      onDestroy: Util.noop
    };
  },

  getInitialState: function () {
    return {
      app: null
    };
  },

  componentDidMount: function () {
    var props = this.props;

    AppVersionsStore.on(
      AppVersionsEvents.CHANGE,
      this.onRequestAppVersion
    );
    AppVersionsStore.on(
      AppVersionsEvents.REQUEST_ONE_ERROR,
      this.onRequestAppVersionError
    );

    AppVersionsActions.requestAppVersion(props.appId, props.appVersion);
  },

  componentWillUnmount: function () {
    AppVersionsStore.removeListener(
      AppVersionsEvents.CHANGE,
      this.onRequestAppVersion
    );
    AppVersionsStore.removeListener(
      AppVersionsEvents.REQUEST_ONE_ERROR,
      this.onRequestAppVersionError
    );
  },

  onRequestAppVersion: function (versionTimestamp) {
    var props = this.props;

    if (versionTimestamp !== props.appVersion) {
      return null;
    }

    let app = Object.assign({},
      AppVersionsStore.getAppVersion(props.appId, props.appVersion)
    );

    this.setState({
      app: app
    });
  },

  onRequestAppVersionError: function () {
    var props = this.props;
    DialogActions.alert(`Could not fetch app '${props.appId}' version` +
      `for editing: ${props.appVersion}`);
    props.onDestroy();
  },

  render: function () {
    var state = this.state;

    if (state.app == null) {
      return null;
    }

    return (
      <AppModalComponent
        app={state.app}
        onDestroy={this.props.onDestroy} />
    );
  }
});

module.exports = EditAppModalComponent;
