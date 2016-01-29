import classNames from "classnames";
import React from "react/addons";
import Util from "../../helpers/Util";

import AppsActions from "../../actions/AppsActions";
import AppConfigEditFormComponent from "../AppConfigEditFormComponent";
import AppConfigJSONEditorComponent from "../AppConfigJSONEditorComponent";
import AppsEvents from "../../events/AppsEvents";
import AppFormErrorMessages from "../../constants/AppFormErrorMessages";
import AppFormStore from "../../stores/AppFormStore";
import AutolinkComponent from "../AutolinkComponent";
import AppsStore from "../../stores/AppsStore";
import ModalComponent from "../../components/ModalComponent";

var AppModalComponent = React.createClass({
  displayName: "AppModalComponent",

  propTypes: {
    app: React.PropTypes.object,
    onDestroy: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      app: null,
      onDestroy: Util.noop
    };
  },

  getInitialState: function () {
    let app = this.props.app;

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
      this.setState({error: AppFormStore.responseErrors});
    }
  },

  handleSubmit: function (event) {
    event.preventDefault();

    if (this.state.appIsValid) {
      const app = AppFormStore.getApp();

      if (this.props.app != null) {
        AppsActions.applySettingsOnApp(app.id, app, true, this.state.force);
      } else {
        AppsActions.createApp(app);
      }
    }
  },

  getGeneralErrorBlock: function () {
    let error = this.state.error;

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
    var submitButtonTitle = "+ Create";
    if (this.props.app != null && this.props.app.version != null) {
      submitButtonTitle = "Change and deploy configuration";
    }

    var classSet = classNames({
      "btn btn-success": true,
      "disabled": !this.state.appIsValid
    });

    return (
      <input type="submit"
        className={classSet}
        value={submitButtonTitle} />
    );
  },

  handleModeToggle: function (event) {
    event.preventDefault();
    if (event.metaKey || event.ctrlKey) {
      this.setState({jsonMode: !this.state.jsonMode});
    }
  },

  handleAppConfigChange: function (app, isValid = true) {
    this.setState({app: app, appIsValid: isValid});
  },

  handleAppConfigError: function (error) {
    this.setState({error: error});
  },

  render: function () {
    var props = this.props;
    var state = this.state;

    var modalTitle = "New Application";

    if (props.app != null && props.app.version != null) {
      modalTitle = "Edit Application";
    }

    var appConfigProps = {
      app: state.app,
      onChange: this.handleAppConfigChange,
      onError: this.handleAppConfigError
    };
    var appConfigEditor = state.jsonMode
      ? <AppConfigJSONEditorComponent {...appConfigProps} />
      : <AppConfigEditFormComponent {...appConfigProps} />;

    var cancelButton = (
      <button className="btn btn-default"
          type="button"
          onClick={this.destroy}>
        Cancel
      </button>
    );

    return (
      <ModalComponent dismissOnClickOutside={false}
          ref="modalComponent"
          size="md"
          onDestroy={this.props.onDestroy}>
        <form method="post" role="form" onSubmit={this.handleSubmit}>
          <div className="modal-header">
            <button type="button" className="close"
              aria-hidden="true" onClick={this.destroy}>&times;</button>
            <h3 className="modal-title" onClick={this.handleModeToggle}>
              {modalTitle}
            </h3>
          </div>
          <div className="modal-body reduced-padding">
            {appConfigEditor}
            <div className="modal-controls">
              {this.getGeneralErrorBlock()}
              {this.getSubmitButton()} {cancelButton}
            </div>
          </div>
        </form>
      </ModalComponent>
    );
  }
});

export default AppModalComponent;
