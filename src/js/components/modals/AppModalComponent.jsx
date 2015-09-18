var classNames = require("classnames");
var React = require("react/addons");
var Util = require("../../helpers/Util");

var AppsActions = require("../../actions/AppsActions");
var AppsEvents = require("../../events/AppsEvents");
var AppFormErrorMessages = require("../../constants/AppFormErrorMessages");
var AppFormStore = require("../../stores/AppFormStore");
var AppsStore = require("../../stores/AppsStore");
var CollapsiblePanelComponent =
  require("../../components/CollapsiblePanelComponent");
var ContainerSettingsComponent =
  require("../../components/ContainerSettingsComponent");
var FormActions = require("../../actions/FormActions");
var FormEvents = require("../../events/FormEvents");
var ModalComponent = require("../../components/ModalComponent");
var OptionalEnvironmentComponent =
  require("../../components/OptionalEnviromentComponent");
var OptionalSettingsComponent =
  require("../../components/OptionalSettingsComponent");
var FormGroupComponent =
  require("../../components/FormGroupComponent");

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
    var app = this.props.app;
    AppFormStore.initAndReset();

    if (app != null) {
      AppFormStore.populateFieldsFromAppDefinition(app);
    }

    return {
      fields: AppFormStore.fields,
      errorIndices: {},
      responseErrorMessages: {}
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
    AppFormStore.on(FormEvents.CHANGE, this.onFormChange);
    AppFormStore.on(FormEvents.FIELD_VALIDATION_ERROR,
      this.onFieldValidationError);
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
    AppFormStore.removeListener(FormEvents.CHANGE, this.onFormChange);
    AppFormStore.removeListener(FormEvents.FIELD_VALIDATION_ERROR,
      this.onFieldValidationError);
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

    } else {
      this.setState({
        responseErrorMessages: AppFormStore.responseErrors
      });
    }
  },

  onFieldValidationError: function () {
    this.setState({
      fields: AppFormStore.fields,
      errorIndices: AppFormStore.validationErrorIndices
    });
  },

  onFormChange: function () {
    this.setState({
      fields: AppFormStore.fields,
      errorIndices: AppFormStore.validationErrorIndices
    });
  },

  handleFieldUpdate: function (fieldId, value) {
    FormActions.update(fieldId, value);
  },

  handleSubmit: function (event) {
    event.preventDefault();

    if (!Object.keys(this.state.errorIndices).length) {
      let app = AppFormStore.app;

      if (this.props.app != null) {
        AppsActions.applySettingsOnApp(app.id, app, true);
      } else {
        AppsActions.createApp(app);
      }
    }
  },

  getErrorMessage: function (fieldId) {
    var state = this.state;
    var errorIndex = state.errorIndices[fieldId];
    if (errorIndex != null && !Util.isArray(errorIndex)) {
      return AppFormErrorMessages.getMessage(fieldId, errorIndex);
    }
    if (state.responseErrorMessages[fieldId] != null) {
      return state.responseErrorMessages[fieldId];
    }
    return null;
  },

  getGeneralErrorBlock: function () {
    var error = this.getErrorMessage("general");

    if (error == null) {
      return null;
    }

    return (
      <p className="text-danger">
        <strong>{error}</strong>
      </p>
    );
  },

  getSubmitButton: function () {
    var submitButtonTitle = this.props.app != null
      ? "Change and deploy configuration"
      : "+ Create";

    var classSet = classNames({
      "btn btn-success": true,
      "disabled": !!Object.keys(this.state.errorIndices).length
    });

    return (
      <input type="submit"
        className={classSet}
        value={submitButtonTitle} />
    );
  },

  render: function () {
    var props = this.props;
    var state = this.state;

    var modalTitle = "New Application";

    if (props.app != null) {
      modalTitle = "Edit Application";
    }

    var cancelButton = (
      <button className="btn btn-default"
          type="button"
          onClick={this.destroy}>
        Cancel
      </button>
    );

    return (
      <ModalComponent
        dismissOnClickOutside={false}
        ref="modalComponent"
        size="md"
        onDestroy={this.props.onDestroy}>
        <form method="post" role="form" onSubmit={this.handleSubmit}>
          <div className="modal-header">
            <button type="button" className="close"
              aria-hidden="true" onClick={this.destroy}>&times;</button>
            <h3 className="modal-title">{modalTitle}</h3>
          </div>
          <div className="modal-body reduced-padding">
            <FormGroupComponent
                errorMessage={this.getErrorMessage("appId")}
                fieldId="appId"
                value={state.fields.appId}
                label="ID"
                onChange={this.handleFieldUpdate}>
              <input autoFocus />
            </FormGroupComponent>
            <div className="row">
              <div className="col-sm-3">
                <FormGroupComponent
                    errorMessage={this.getErrorMessage("cpus")}
                    fieldId="cpus"
                    label="CPUs"
                    value={state.fields.cpus}
                    onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number" />
                </FormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent
                    fieldId="mem"
                    label="Memory (MB)"
                    errorMessage={this.getErrorMessage("mem")}
                    value={state.fields.mem}
                    onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number" />
                </FormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent
                    fieldId="disk"
                    label="Disk Space (MB)"
                    errorMessage={this.getErrorMessage("disk")}
                    value={state.fields.disk}
                    onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number"/>
                </FormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent
                    fieldId="instances"
                    label="Instances"
                    errorMessage={this.getErrorMessage("instances")}
                    value={state.fields.instances}
                    onChange={this.handleFieldUpdate}>
                  <input min="0" step="1" type="number" />
                </FormGroupComponent>
              </div>
            </div>
            <FormGroupComponent
              errorMessage={this.getErrorMessage("cmd")}
              fieldId="cmd"
              label="Command"
              help="May be left blank if a container image is supplied"
              value={state.fields.cmd}
              onChange={this.handleFieldUpdate}>
              <textarea style={{resize: "vertical"}} />
            </FormGroupComponent>
            <div className="row full-bleed">
              <CollapsiblePanelComponent title="Docker container settings">
                <ContainerSettingsComponent
                  errorIndices={state.errorIndices}
                  fields={state.fields}
                  getErrorMessage={this.getErrorMessage} />
              </CollapsiblePanelComponent>
            </div>
            <div className="row full-bleed">
              <CollapsiblePanelComponent title="Environment variables">
                <OptionalEnvironmentComponent
                  errorIndices={state.errorIndices.env}
                  generalError={this.getErrorMessage("env")}
                  rows={state.fields.env} />
              </CollapsiblePanelComponent>
            </div>
            <div className="row full-bleed">
              <CollapsiblePanelComponent title="Optional settings">
                <OptionalSettingsComponent
                  errorIndices={state.errorIndices}
                  fields={state.fields}
                  getErrorMessage={this.getErrorMessage} />
              </CollapsiblePanelComponent>
            </div>
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

module.exports = AppModalComponent;
