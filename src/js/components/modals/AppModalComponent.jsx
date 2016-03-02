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
    var app = this.props.app;

    // We don't want to trigger changes in the app until the submit button
    // is clicked, therefore it is held in the modal state rather than props
    return {
      app: app,
      appIsValid: true,
      error: null,
      force: false,
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
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CREATE_APP,
      this.onCreateApp);
    AppsStore.removeListener(AppsEvents.CREATE_APP_ERROR,
      this.onCreateAppError);
    AppsStore.removeListener(AppsEvents.APPLY_APP,
      this.onCreateApp);
    AppsStore.removeListener(AppsEvents.APPLY_APP_ERROR,
      this.onApplyAppError);
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
    if (status < 300) {
      this.onCreateApp();
    } else if (status === 409 && data.deployments != null) {
      // a 409 error without deployments is a field conflict
      this.setState({
        error: AppFormErrorMessages.getGeneralMessage("appLocked"),
        force: true
      });
    } else {
      this.setState({
        error: AppFormStore.responseErrors["general"]
      });
    }
  },

  handleSubmit: function (event) {
    if (event) {
      event.preventDefault();
    }

    if (this.state.appIsValid) {
      const app = this.state.app;

      if (this.props.app != null) {
        let appDiff = AppVersionStore.getAppConfigDiff(app.id, app);
        AppsActions.applySettingsOnApp(app.id, appDiff, true, this.state.force);
      } else {
        AppsActions.createApp(app);
      }
    }
  },

  getGeneralErrorBlock: function () {
    var error = this.state.error;

    if (error == null) {
      return null;
    }

    return (
      <p className="text-danger">
        <AutolinkComponent text={error} />
      </p>
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
    if (event.metaKey || event.ctrlKey ||
        event.currentTarget.className.split(" ").includes("json-link")) {
      this.setState({jsonMode: !this.state.jsonMode});
    }
  },

  handleAppConfigChange: function (app) {
    // At present we assume that the supplied app config is valid.
    // We may wish to pass invalid (eg incomplete) configs in the future.
    this.setState({
      app: app,
      error: null,
      appIsValid: true
    });
  },

  handleAppConfigError: function (error) {
    this.setState({error: error, appIsValid: false});
  },

  onJSONToggleChange: function (event) {
    this.setState({jsonMode:event.target.checked});
  },

  render: function () {
    var props = this.props;
    var state = this.state;

    var modalTitle = props.editMode
      ? "Edit Application"
      : "New Application";

    var appConfigProps = {
      app: state.app,
      onChange: this.handleAppConfigChange,
      onError: this.handleAppConfigError,
      handleModeToggle: this.handleModeToggle
    };

    var appConfigEditor = state.jsonMode
      ? <AppConfigJSONEditorComponent {...appConfigProps} />
      : <AppConfigEditFormComponent {...appConfigProps} />;

    var cancelButton = (
      <button className="btn btn-default btn-inverse"
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
          className="app-modal">
        <form method="post" role="form" onSubmit={this.handleSubmit}>
          <button onClick={event => event.preventDefault()}
            style={{display: "none"}} />
          <div className="modal-header">
            <input id="json-toggle" type="checkbox" name="checkbox"
              className="toggle" onChange={this.onJSONToggleChange} />
            <label htmlFor="json-toggle">JSON Mode</label>
            <h2 className="modal-title" onClick={this.handleModeToggle}>
              {modalTitle}
            </h2>
          </div>
          <div className="modal-body">
            {appConfigEditor}
          </div>
          <div className="modal-footer">
            <div className="modal-controls">
            {this.getGeneralErrorBlock()}
            {cancelButton} {this.getSubmitButton()}
            </div>
          </div>
        </form>
      </ModalComponent>
    );
  }
});

export default AppModalComponent;
