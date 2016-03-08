import React from "react/addons";
import classNames from "classnames";
import Util from "../helpers/Util";

import AppsEvents from "../events/AppsEvents";
import AppFormErrorMessages from "../constants/AppFormErrorMessages";
import AppFormStore from "../stores/AppFormStore";
import AppsStore from "../stores/AppsStore";
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
import MenuComponent from "../components/MenuComponent";
import MenuItemComponent from "../components/MenuItemComponent";
import SectionComponent from "../components/SectionComponent";
import ContentComponent from "../components/ContentComponent";

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
      activeSection: "general",
      errorIndices: AppFormStore.validationErrorIndices,
      fields: AppFormStore.fields,
      isVolumesOpen: false,
      responseErrorMessages: AppFormStore.responseErrors
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CREATE_APP_ERROR, this.onCreateAppError);
    AppsStore.on(AppsEvents.APPLY_APP_ERROR, this.onApplyAppError);
    AppFormStore.on(FormEvents.CHANGE, this.onFormChange);
    AppFormStore.on(FormEvents.FIELD_VALIDATION_ERROR,
      this.onFieldValidationError);
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

  onFormChange: function (fieldId) {
    var responseErrorMessages = this.state.responseErrorMessages;

    if (responseErrorMessages != null &&
        responseErrorMessages[fieldId] != null) {
      delete responseErrorMessages[fieldId];
    }

    this.setState({
      fields: AppFormStore.fields,
      errorIndices: AppFormStore.validationErrorIndices,
      responseErrorMessages: responseErrorMessages
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

  onMenuChange: function (menuItemValue) {
    this.setState({
      activeSection: menuItemValue
    });
  },

  setViewVolumes: function () {
    this.onMenuChange("volumes");
  },

  render: function () {
    var state = this.state;

    var generalMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({
        appId: "appId",
        cpus: "cpus",
        mem: "mem",
        disk: "disk",
        instances: "instances",
        cmd: "cmd"
      })
    });

    var containerMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({container: "container"})
    });

    var portsMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({portDefinitions: "portDefinitions"})
    });

    var envMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({env: "env"})
    });

    var labelsMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({labels: "labels"})
    });

    var healthMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({healthChecks: "healthChecks"})
    });

    var volumesMenuItemClassSet = classNames({
      "error": this.fieldsHaveError({localVolumes: "localVolumes"})
    });

    var optionalMenuItemClassSet = classNames({
      "error": this.fieldsHaveError(OptionalSettingsComponent.fieldIds)
    });

    return (
      <div className="app-config-edit">
        <MenuComponent selected={state.activeSection} className="col-sm-3"
            onChange={this.onMenuChange}>
          <MenuItemComponent value="general"
              className={generalMenuItemClassSet}>
            General
          </MenuItemComponent>
          <MenuItemComponent value="container"
              className={containerMenuItemClassSet}>
            Docker Container
          </MenuItemComponent>
          <MenuItemComponent value="ports"
             className={portsMenuItemClassSet}>
            Ports
          </MenuItemComponent>
          <MenuItemComponent value="env"
              className={envMenuItemClassSet}>
            Environment Variables
          </MenuItemComponent>
          <MenuItemComponent value="labels"
              className={labelsMenuItemClassSet}>
            Labels
          </MenuItemComponent>
          <MenuItemComponent value="health"
              className={healthMenuItemClassSet}>
            Health Checks
          </MenuItemComponent>
          <MenuItemComponent value="volumes"
              className={volumesMenuItemClassSet}>
            Volumes
          </MenuItemComponent>
          <MenuItemComponent value="optional"
              className={optionalMenuItemClassSet}>
            Optional
          </MenuItemComponent>
        </MenuComponent>
        <ContentComponent active={state.activeSection}
            className="content-component">
          <SectionComponent sectionId="general"
              onActive={this.setCursorToEndOfAppIdInput}>
            <FormGroupComponent errorMessage={this.getErrorMessage("appId")}
                fieldId="appId"
                value={state.fields.appId}
                label="ID"
                onChange={this.handleFieldUpdate}>
              <input ref="appId"/>
            </FormGroupComponent>
            <div className="row">
              <div className="col-sm-3">
                <FormGroupComponent errorMessage={this.getErrorMessage("cpus")}
                  fieldId="cpus"
                  label="CPUs"
                  value={state.fields.cpus}
                  onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number"/>
                </FormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent fieldId="mem" label="Memory (MiB)"
                  errorMessage={this.getErrorMessage("mem")}
                  value={state.fields.mem}
                  onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number"/>
                </FormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent fieldId="disk" label="Disk Space (MiB)"
                  errorMessage={this.getErrorMessage("disk")}
                  value={state.fields.disk}
                  onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number"/>
                </FormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent fieldId="instances" label="Instances"
                  errorMessage={this.getErrorMessage("instances")}
                  value={state.fields.instances}
                  onChange={this.handleFieldUpdate}>
                  <input min="0" step="1" type="number"/>
                </FormGroupComponent>
              </div>
            </div>
            <FormGroupComponent errorMessage={this.getErrorMessage("cmd")}
              fieldId="cmd"
              label="Command"
              help="May be left blank if a container image is supplied"
              value={state.fields.cmd}
              onChange={this.handleFieldUpdate}>
              <textarea style={{resize: "vertical"}} rows="3"/>
            </FormGroupComponent>
          </SectionComponent>
          <SectionComponent sectionId="container">
            <ContainerSettingsComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage}
              openVolumes={this.setViewVolumes}/>
          </SectionComponent>
          <SectionComponent sectionId="ports">
            <OptionalPortsAndServiceDiscoveryComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage}
              handleModeToggle={this.props.handleModeToggle} />
          </SectionComponent>
          <SectionComponent sectionId="env">
            <OptionalEnvironmentComponent
              errorIndices={state.errorIndices}
              getErrorMessage={this.getErrorMessage}
              fields={state.fields}/>
          </SectionComponent>
          <SectionComponent sectionId="labels">
            <OptionalLabelsComponent
              errorIndices={state.errorIndices}
              getErrorMessage={this.getErrorMessage}
              fields={state.fields}/>
          </SectionComponent>
          <SectionComponent sectionId="health">
            <HealthChecksComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage}/>
          </SectionComponent>
          <SectionComponent sectionId="volumes">
            <OptionalVolumesComponent
              errorIndices={state.errorIndices}
              getErrorMessage={this.getErrorMessage}
              fields={state.fields} />
          </SectionComponent>
          <SectionComponent sectionId="optional">
            <OptionalSettingsComponent
              errorIndices={state.errorIndices}
              fields={state.fields}
              getErrorMessage={this.getErrorMessage}/>
          </SectionComponent>
        </ContentComponent>
      </div>
    );
  }
});

export default AppConfigEditFormComponent;
