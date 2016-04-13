import classNames from "classnames";
import React from "react/addons";
import Util from "../../helpers/Util";
import Mousetrap from "mousetrap";

import AppsActions from "../../actions/AppsActions";
import AppConfigEditFormComponent from "../AppConfigEditFormComponent";
import AppConfigJSONEditorComponent from "../AppConfigJSONEditorComponent";
import AppsEvents from "../../events/AppsEvents";
import AppFormErrorMessages from "../../constants/AppFormErrorMessages";
import AppFormStore from "../../stores/AppFormStore";
import AutolinkComponent from "../AutolinkComponent";
import AppsStore from "../../stores/AppsStore";
import AppVersionStore from "../../stores/AppVersionsStore";
import InfoActions from "../../actions/InfoActions";
import InfoEvents from "../../events/InfoEvents";
import InfoStore from "../../stores/InfoStore";
import ModalComponent from "../../components/ModalComponent";

var AppModalComponent = React.createClass({
  displayName: "AppModalComponent",

  propTypes: {
    app: React.PropTypes.object,
    editMode: React.PropTypes.bool,
    onDestroy: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      app: null,
      editMode: false,
      onDestroy: Util.noop
    };
  },

  getInitialState: function () {
    // We don't want to trigger changes in the app until the submit button
    // is clicked, therefore it is held in the modal state rather than props
    return {
      app: this.props.app,
      appIsValid: false,
      error: null,
      force: false,
      info: InfoStore.info,
      jsonMode: false
    };
  },

  destroy: function () {
    // This will also call `this.props.onDestroy` since it is passed as the
    // callback for the modal's `onDestroy` prop.
    this.refs.modalComponent.destroy();
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CREATE_APP, this.onCreateApp);
    AppsStore.on(AppsEvents.CREATE_APP_ERROR, this.onCreateAppError);
    AppsStore.on(AppsEvents.APPLY_APP, this.onCreateApp);
    AppsStore.on(AppsEvents.APPLY_APP_ERROR, this.onApplyAppError);
    Mousetrap.bind(["command+enter", "ctrl+enter"], () => this.handleSubmit());

    if (!this.hasInfoObject()) {
      InfoStore.once(InfoEvents.CHANGE, this.onInfoChange);
      InfoActions.requestInfo();
    }
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CREATE_APP, this.onCreateApp);
    AppsStore.removeListener(AppsEvents.CREATE_APP_ERROR,
      this.onCreateAppError);
    AppsStore.removeListener(AppsEvents.APPLY_APP, this.onCreateApp);
    AppsStore.removeListener(AppsEvents.APPLY_APP_ERROR, this.onApplyAppError);
    InfoStore.removeListener(InfoEvents.CHANGE, this.onInfoChange);
    Mousetrap.unbind(["command+enter", "ctrl+enter"]);
  },

  onApplyAppError: function (error, isEditing, status) {
    if (!isEditing) {
      return;
    }
    this.onCreateAppError(error, status);
  },

  onCreateApp: function () {
    this.destroy();
  },

  onCreateAppError: function (data, status) {
    // All status below 300 are actually not an error
    if (status != null && status < 300) {
      this.onCreateApp();
    } else if (status === 409 && data.deployments != null) {
      // a 409 error without deployments is a field conflict
      this.setState({
        error: AppFormErrorMessages.getGeneralMessage("appLocked"),
        force: true
      });
    } else {
      this.setState({
        appIsValid: false,
        error: AppFormStore.responseErrors
      });
    }
  },

  onInfoChange: function () {
    this.setState({
      info: InfoStore.info
    });
  },

  handleSubmit: function (event) {
    if (event) {
      event.preventDefault();
    }

    if (this.state.appIsValid) {
      const app = this.state.app;

      if (this.props.editMode) {
        let appDiff = AppVersionStore.getAppConfigDiff(app.id, app);
        AppsActions.applySettingsOnApp(app.id, appDiff, true, this.state.force);
      } else {
        AppsActions.createApp(app);
      }
    }
  },

  hasInfoObject: function () {
    return !!Object.keys(this.state.info).length;
  },

  getGeneralErrorBlock: function () {
    var error = this.state.error;

    if (error == null) {
      return null;
    }

    if (Util.isObject(error)) {
      error = Object.keys(error).map(key => {
        return `${key}: ${error[key]}`;
      });
    }

    if (Util.isArray(error)) {
      error = error.map((message, index) =>
        <li key={index}><AutolinkComponent text={message} /></li>
      );
    } else {
      error = <li><AutolinkComponent text={error} /></li>;
    }

    return (
      <div className="text-danger app-error-block">
        <i className="icon icon-mini warning-danger" />
        There was a problem with your configuration
        <ul>
          {error}
        </ul>
      </div>
    );
  },

  getSubmitButton: function () {
    var submitButtonText = this.props.editMode
      ? "Change and deploy configuration"
      : "Create Application";

    var classSet = classNames({
      "btn btn-success": true,
      "disabled": !this.state.appIsValid
    });

    return (
      <button type="submit" className={classSet}>
        {submitButtonText}
      </button>
    );
  },

  handleModeToggle: function (event) {
    event.preventDefault();
    this.setState({jsonMode: !this.state.jsonMode});
  },

  handleAppConfigChange: function (app) {
    if (app == null) {
      return;
    }

    // At present we assume that the supplied app config is valid.
    // We may wish to pass invalid (eg incomplete) configs in the future.
    this.setState({
      app: app,
      error: null,
      appIsValid: true
    });
  },

  handleAppConfigError: function (error) {
    if (error != null ||
        Object.keys(AppFormStore.validationErrorIndices).length) {
      this.setState({
        error: error,
        appIsValid: false
      });
    }
  },

  onJSONToggleChange: function (event) {
    this.setState({jsonMode: event.target.checked});
  },

  render: function () {
    if (!this.hasInfoObject()) {
      return null;
    }

    var props = this.props;
    var state = this.state;

    var modalTitle = props.editMode
      ? "Edit Application"
      : "New Application";

    var features = state.info["marathon_config"] != null
      ? state.info["marathon_config"].features
      : null;

    var appConfigProps = {
      app: state.app,
      features: features,
      onChange: this.handleAppConfigChange,
      onError: this.handleAppConfigError,
      handleModeToggle: this.handleModeToggle
    };

    var appConfigEditor = state.jsonMode
      ? <AppConfigJSONEditorComponent {...appConfigProps} />
      : <AppConfigEditFormComponent {...appConfigProps} />;
    var classSet = classNames("app-modal", {
      "json-mode": state.jsonMode
    });
    var cancelButton = (
      <button className="btn btn-link"
          type="button"
          onClick={this.destroy}>
        Cancel
      </button>
    );

    return (
      <ModalComponent dismissOnClickOutside={false}
          ref="modalComponent"
          size="md"
          onDestroy={props.onDestroy}
          className={classSet}>
        <form method="post" role="form" onSubmit={this.handleSubmit}>
          <button onClick={event => event.preventDefault()}
            style={{display: "none"}} />
          <div className="modal-header">
            <input id="json-toggle" type="checkbox" name="checkbox"
              checked={state.jsonMode}
              className="toggle" onChange={this.onJSONToggleChange} />
            <label htmlFor="json-toggle">JSON Mode</label>
            <h2 className="modal-title">
              {modalTitle}
            </h2>
          </div>
          {this.getGeneralErrorBlock()}
          <div className="modal-body">
            {appConfigEditor}
          </div>
          <div className="modal-footer">
            <div className="modal-controls">
            {cancelButton} {this.getSubmitButton()}
            </div>
          </div>
        </form>
      </ModalComponent>
    );
  }
});

export default AppModalComponent;
