import React from "react/addons";
import Util from "../helpers/Util";

import AppsEvents from "../events/AppsEvents";
import AppFormErrorMessages from "../constants/AppFormErrorMessages";
import AppFormStore from "../stores/AppFormStore";
import AppsStore from "../stores/AppsStore";
import CollapsiblePanelComponent
  from "../components/CollapsiblePanelComponent";
import ContainerSettingsComponent
  from "../components/ContainerSettingsComponent";
import FormActions from "../actions/FormActions";
import FormEvents from "../events/FormEvents";
import HealthChecksComponent from "../components/HealthChecksComponent";
import OptionalEnvironmentComponent
  from "../components/OptionalEnviromentComponent";
import OptionalLabelsComponent from "../components/OptionalLabelsComponent";
import OptionalPortsAndServiceDiscoveryComponent
  from "../components/OptionalPortsAndServiceDiscoveryComponent";
import OptionalSettingsComponent
  from "../components/OptionalSettingsComponent";
import OptionalVolumesComponent
  from "../components/OptionalVolumesComponent";
import FormGroupComponent from "../components/FormGroupComponent";

var AppConfigEditFormComponent = React.createClass({
  displayName: "AppConfigEditFormComponent",

  propTypes: {
    app: React.PropTypes.object,
    handleModeToggle: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onError: React.PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return {
      app: null
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
      errorIndices: AppFormStore.validationErrorIndices,
      responseErrorMessages: AppFormStore.responseErrors,
      isVolumesOpen: false
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CREATE_APP_ERROR, this.onCreateAppError);
    AppsStore.on(AppsEvents.APPLY_APP_ERROR, this.onApplyAppError);
    AppFormStore.on(FormEvents.CHANGE, this.onFormChange);
    AppFormStore.on(FormEvents.FIELD_VALIDATION_ERROR,
      this.onFieldValidationError);
  },

  componentDidMount: function () {
    this.setCursorToEndOfAppIdInput();
  },

  setCursorToEndOfAppIdInput: function () {
    var appIdInput = React.findDOMNode(this.refs.appId);
    appIdInput.focus();
    var valueLength = appIdInput.value.length;
    appIdInput.setSelectionRange(valueLength, valueLength);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CREATE_APP_ERROR,
      this.onCreateAppError);
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

  onCreateAppError: function (data, status) {
    if (!(status === 409 && data.deployments != null)) {
      // a 409 error without deployments is a field conflict
      this.setState({
        responseErrorMessages: AppFormStore.responseErrors
      });
    }
  },

  onFieldValidationError: function () {
    this.setState({
      fields: AppFormStore.fields,
      errorIndices: AppFormStore.validationErrorIndices
    }, () => {
      this.props.onError(this.getErrorMessage("general"));
    });
  },

  setViewVolumes: function (isVolumesOpen = true) {
    this.setState({
      isVolumesOpen: !!isVolumesOpen
    });
  },

  onFormChange: function () {
    this.setState({
      fields: AppFormStore.fields,
      errorIndices: AppFormStore.validationErrorIndices
    }, () => {
      if (!!Object.keys(this.state.errorIndices).length) {
        this.props.onError(this.getErrorMessage("general"));
      } else {
        this.props.onChange(AppFormStore.app);
      }
    });
  },

  handleFieldUpdate: function (fieldId, value) {
    FormActions.update(fieldId, value);
  },

  getErrorMessage: function (fieldId) {
    var state = this.state;
    var errorIndex = state.errorIndices[fieldId];
    if (errorIndex != null && !Util.isArray(errorIndex)) {
      return AppFormErrorMessages.getFieldMessage(fieldId, errorIndex);
    }
    if (state.responseErrorMessages[fieldId] != null) {
      return state.responseErrorMessages[fieldId];
    }
    return null;
  },

  fieldsHaveError: function (fieldIds) {
    var state = this.state;
    var errorIndices = state.errorIndices;
    var responseMessages = state.responseErrorMessages;

    return !!Object.values(fieldIds).find((fieldId) => {
      return errorIndices[fieldId] != null || responseMessages[fieldId] != null;
    });
  },

  render: function () {
    var state = this.state;

    var volumesIsOpen = this.fieldsHaveError({volumes: "volumes"});

    if (state.isVolumesOpen) {
      volumesIsOpen = state.isVolumesOpen;
    }

    return (
      <div>
        <FormGroupComponent
            errorMessage={this.getErrorMessage("appId")}
            fieldId="appId"
            value={state.fields.appId}
            label="ID"
            onChange={this.handleFieldUpdate}>
          <input ref="appId" />
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
                label="Memory (MiB)"
                errorMessage={this.getErrorMessage("mem")}
                value={state.fields.mem}
                onChange={this.handleFieldUpdate}>
              <input min="0" step="any" type="number" />
            </FormGroupComponent>
          </div>
          <div className="col-sm-3">
            <FormGroupComponent
                fieldId="disk"
                label="Disk Space (MiB)"
                errorMessage={this.getErrorMessage("disk")}
                value={state.fields.disk}
                onChange={this.handleFieldUpdate}>
              <input min="0" step="any" type="number" />
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
          <CollapsiblePanelComponent
              isOpen=
                {this.fieldsHaveError(ContainerSettingsComponent.fieldIds)}
              title="Docker container settings">
            <ContainerSettingsComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage}
              openVolumes={this.setViewVolumes}/>
          </CollapsiblePanelComponent>
        </div>
        <div className="row full-bleed">
          <CollapsiblePanelComponent
              isOpen=
                {this.fieldsHaveError({portDefinitions: "portDefinitions"})}
              title="Ports">
            <OptionalPortsAndServiceDiscoveryComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage}
              handleModeToggle={this.props.handleModeToggle} />
          </CollapsiblePanelComponent>
        </div>
        <div className="row full-bleed">
          <CollapsiblePanelComponent
              isOpen={this.fieldsHaveError({env: "env"})}
              title="Environment variables">
            <OptionalEnvironmentComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage} />
          </CollapsiblePanelComponent>
        </div>
        <div className="row full-bleed">
          <CollapsiblePanelComponent
              isOpen={this.fieldsHaveError({labels: "labels"})}
              title="Labels">
            <OptionalLabelsComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage} />
          </CollapsiblePanelComponent>
        </div>
        <div className="row full-bleed reduced-padding">
          <CollapsiblePanelComponent
              isOpen=
                {this.fieldsHaveError({healthChecks: "healthChecks"})}
              title="Health checks">
            <HealthChecksComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage} />
          </CollapsiblePanelComponent>
        </div>
        <div className="row full-bleed">
          <CollapsiblePanelComponent
              isOpen={volumesIsOpen}
              togglePanel={this.setViewVolumes}
              title="Volumes">
            <OptionalVolumesComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage} />
          </CollapsiblePanelComponent>
        </div>
        <div className="row full-bleed">
          <CollapsiblePanelComponent
              isOpen=
                {this.fieldsHaveError(OptionalSettingsComponent.fieldIds)}
              title="Optional settings">
            <OptionalSettingsComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage} />
          </CollapsiblePanelComponent>
        </div>
      </div>
    );
  }
});

export default AppConfigEditFormComponent;
