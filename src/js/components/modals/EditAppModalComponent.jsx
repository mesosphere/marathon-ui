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
      attributes: null
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

    let attributes = Object.assign({},
      AppVersionsStore.getAppVersion(props.appId, props.appVersion)
    );

    this.setState({
      attributes: attributes
    });
  },

  onRequestAppVersionError: function () {
    var props = this.props;
    DialogActions.alert(`Could not fetch app '${props.appId}' version`
      + `for editing: ${props.appVersion}`);
    props.onDestroy();
  },

  render: function () {
    var state = this.state;

    if (state.attributes == null) {
      return null;
    }

    return (
      <AppModalComponent
        attributes={state.attributes}
        edit={true}
        onDestroy={this.props.onDestroy} />
    );
  }
});

module.exports = EditAppModalComponent;
