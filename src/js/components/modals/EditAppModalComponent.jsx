import React from "react/addons";
import Util from "../../helpers/Util";

import AppVersionsActions from "../../actions/AppVersionsActions";
import AppVersionsEvents from "../../events/AppVersionsEvents";
import AppVersionsStore from "../../stores/AppVersionsStore";
import DialogActions from "../../actions/DialogActions";
import DialogSeverity from "../../constants/DialogSeverity";

import AppModalComponent from "./AppModalComponent";

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
      AppVersionsStore.getAppConfigVersion(props.appId, props.appVersion)
    );

    // This strips out the depricated ports field,
    // if portDefinitions are set
    if (app.portDefinitions != null && app.ports != null) {
      delete app.ports;
    }

    this.setState({
      app: app
    });
  },

  onRequestAppVersionError: function () {
    var props = this.props;
    DialogActions.alert({
      message: `Error fetching version ${props.appVersion} for ${props.appId}.`,
      severity: DialogSeverity.DANGER,
      title: "Error Loading Configuration"
    });
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
        editMode={true}
        onDestroy={this.props.onDestroy} />
    );
  }
});

export default EditAppModalComponent;
