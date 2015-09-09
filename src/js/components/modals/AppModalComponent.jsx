var lazy = require("lazy.js");
var React = require("react/addons");
var Util = require("../../helpers/Util");

var AppsActions = require("../../actions/AppsActions");
var AppsEvents = require("../../events/AppsEvents");
var AppFormErrorMessages = require("../../validators/AppFormErrorMessages");
var AppFormStore = require("../../stores/AppFormStore");
var appScheme = require("../../stores/appScheme");
var AppsStore = require("../../stores/AppsStore");
var appValidator = require("../../validators/appValidator");
var CollapsiblePanelComponent =
  require("../../components/CollapsiblePanelComponent");
var ContainerSettingsComponent =
  require("../../components/ContainerSettingsComponent");
var FormActions = require("../../actions/FormActions");
var FormEvents = require("../../events/FormEvents");
var FormGroupComponent = require("../../components/FormGroupComponent");
var ModalComponent = require("../../components/ModalComponent");
var OptionalEnvironmentComponent =
  require("../../components/OptionalEnviromentComponent");
var OptionalSettingsComponent =
  require("../../components/OptionalSettingsComponent");
var StoreFormGroupComponent =
  require("../../components/StoreFormGroupComponent");
var ValidationError = require("../../validators/ValidationError");

var AppModalComponent = React.createClass({
  displayName: "AppModalComponent",

  propTypes: {
    attributes: React.PropTypes.object,
    edit: React.PropTypes.bool,
    onDestroy: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      attributes: lazy(appScheme).extend({
        cpus: 0.1,
        instances: 1,
        mem: 16.0,
        disk: 0.0
      }).value(),
      edit: false,
      onDestroy: Util.noop
    };
  },

  getInitialState: function () {
    return {
      fields: AppFormStore.fields,
      errorIndices: {}
    };
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
    this.clearValidation();
    this.destroy();
  },

  onCreateAppError: function (data, status) {
    this.validateResponse(data, status);

    if (status < 300) {
      this.clearValidation();
      this.destroy();
    }
  },

  onFieldValidationError: function () {
    this.setState({
      fields: AppFormStore.fields,
      errorIndices: AppFormStore.validationErrorIndices
    });
  },

  onFormChange: function (fieldId) {
    this.setState({
      fields: AppFormStore.fields,
      errorIndices: AppFormStore.validationErrorIndices
    });
  },

  handleFieldUpdate: function (fieldId, value) {
    FormActions.update(fieldId, value);
  },

  destroy: function () {
    // This will also call `this.props.onDestroy` since it is passed as the
    // callback for the modal's `onDestroy` prop.
    this.refs.modalComponent.destroy();
  },

  clearValidation: function () {
    this.setState({errors: []});
  },

  getErrorMessage: function (fieldId) {
    var state = this.state;
    var errorIndex = state.errorIndices[fieldId];
    if (state.errorIndices[fieldId] != null) {
      return AppFormErrorMessages.getMessage(fieldId, errorIndex);
    }
    return null;
  },

  validateResponse: function (response, status) {
    var errors;

    if (status === 422 && response != null &&
        Util.isArray(response.errors)) {
      errors = response.errors.map(function (e) {
        return new ValidationError(
          // Errors that affect multiple attributes provide a blank string. In
          // that case, count it as a "general" error.
          e.attribute.length < 1 ? "general" : e.attribute,
          e.error
        );
      });
    } else if (status === 409 && response != null &&
        response.message !== undefined) {
      errors = [
        new ValidationError("general", `Error: ${response.message}`)
      ];
    } else if (status >= 500) {
      errors = [
        new ValidationError("general", "Server error, could not create app.")
      ];
    } else {
      errors = [
        new ValidationError(
          "general",
          "App creation unsuccessful. Check your app settings and try again."
        )
      ];
    }

    this.setState({errors: errors});
  },

  // TODO rename : handleSubmit
  onSubmit: function (event) {
    event.preventDefault();

    var props = this.props;

    // null-values must be treated as null to let the app model untouched.

    var attrArray = Util.serializeArray(event.target)
      .filter((key) => key.name !== "");

    var modelAttrs = Util.serializedArrayToDictionary(attrArray);

    // URIs should be an Array of Strings.
    if ("uris" in modelAttrs) {
      if (modelAttrs.uris === "") {
        modelAttrs.uris = [];
      } else {
        modelAttrs.uris = lazy(modelAttrs.uris.split(",")).map(function (uri) {
          return uri.trim();
        }).compact().value();
      }
    }

    // Constraints should be an Array of Strings.
    if ("constraints" in modelAttrs) {
      if (modelAttrs.constraints === "") {
        modelAttrs.constraints = [];
      } else {
        let constraintsArray = modelAttrs.constraints.split(",");
        modelAttrs.constraints = constraintsArray.map(function (constraint) {
          return constraint.split(":").map(function (value) {
            return value.trim();
          });
        });
      }
    }

    // env should not be an array.
    if ("env" in modelAttrs) {
      modelAttrs.env = modelAttrs.env.reduce(function (memo, item) {
        if (item.key != null && item.key !== "") {
          memo[item.key] = item.value;
        }
        return memo;
      }, {});
    }

    // Ports should always be an Array.
    if ("ports" in modelAttrs) {
      if (modelAttrs.ports === "") {
        modelAttrs.ports = [];
      } else {
        let portStrings = modelAttrs.ports.split(",");
        modelAttrs.ports = portStrings.map(function (p) {
          var port = parseInt(p, 10);
          return isNaN(port) ? p : port;
        });
      }
    }

    // Container arrays shouldn't have null-values
    if ("container" in modelAttrs) {
      let container = modelAttrs.container;
      if ("docker" in container) {
        if ("portMappings" in container.docker) {
          container.docker.portMappings =
            Util.compactArray(container.docker.portMappings);
        }
        if (container.docker.network === "") {
          delete container.docker.network;
        }
        if (modelAttrs.cmd === "" && container.docker.image !== "") {
          // An outstanding bug in Marathon (#2147) means that the cmd field
          // can't be overridden with a blank string without failing validation
          modelAttrs.cmd = " ";
        }
      }
      if ("parameters" in container) {
        container.parameters = Util.compactArray(container.parameters);
      }
      if ("volumes" in container) {
        container.volumes = Util.compactArray(container.volumes);
      }
    }

    // mem, cpus, and instances are all Numbers and should be parsed as such.
    if ("mem" in modelAttrs) {
      modelAttrs.mem = parseFloat(modelAttrs.mem);
    }
    if ("cpus" in modelAttrs) {
      modelAttrs.cpus = parseFloat(modelAttrs.cpus);
    }
    if ("disk" in modelAttrs) {
      modelAttrs.disk = parseFloat(modelAttrs.disk);
    }
    if ("instances" in modelAttrs) {
      modelAttrs.instances = parseInt(modelAttrs.instances, 10);
    }

    var model = Util.extendObject(props.attributes, modelAttrs);

    // Create app if validate() returns no errors
    if (appValidator.validate(model) == null) {
      if (props.edit) {
        AppsActions.applySettingsOnApp(model.id, model, true);
      } else {
        AppsActions.createApp(model);
      }
    }
  },

  render: function () {
    var props = this.props;
    var model = this.props.attributes;
    var state = this.state;
    var errors = [];

    // TODO refactor global and field-related errors
    var errorBlock = null;

    var modalTitle = "New Application";
    var submitButtonTitle = "+ Create";

    if (props.edit) {
      modalTitle = "Edit Application";
      submitButtonTitle = "Change and deploy configuration";
    }

    var submitButton = (
      <input type="submit"
          className="btn btn-success"
          value={submitButtonTitle} />
      );
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
        <form method="post" role="form" onSubmit={this.onSubmit}>
          <div className="modal-header">
            <button type="button" className="close"
              aria-hidden="true" onClick={this.destroy}>&times;</button>
            <h3 className="modal-title">{modalTitle}</h3>
          </div>
          <div className="modal-body reduced-padding">
            <StoreFormGroupComponent
                errorMessage={this.getErrorMessage("appId")}
                fieldId="appId"
                value={state.fields.appId}
                label="ID"
                onChange={this.handleFieldUpdate}>
              <input autoFocus required />
            </StoreFormGroupComponent>
            <div className="row">
              <div className="col-sm-3">
                <StoreFormGroupComponent
                    errorMessage={this.getErrorMessage("cpus")}
                    fieldId="cpus"
                    label="CPUs"
                    value={state.fields.cpus || 0.1}
                    onChange={this.handleFieldUpdate}>
                  <input  min="0" step="any" type="number" required />
                </StoreFormGroupComponent>
              </div>
              <div className="col-sm-3">
                <StoreFormGroupComponent
                    fieldId="mem"
                    label="Memory (MB)"
                    errorMessage={this.getErrorMessage("mem")}
                    value={state.fields.mem || 16}
                    onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number" required />
                </StoreFormGroupComponent>
              </div>
              <div className="col-sm-3">
                <StoreFormGroupComponent
                    fieldId="disk"
                    label="Disk Space (MB)"
                    errorMessage={this.getErrorMessage("disk")}
                    value={state.fields.disk}
                    onChange={this.handleFieldUpdate}>
                  <input min="0" step="any" type="number" required />
                </StoreFormGroupComponent>
              </div>
              <div className="col-sm-3">
                <FormGroupComponent
                    attribute="instances"
                    label="Instances"
                    model={model}
                    errors={errors}
                    validator={appValidator}>
                  <input min="0" step="1" type="number" required />
                </FormGroupComponent>
              </div>
            </div>
            <FormGroupComponent
              attribute="cmd"
              label="Command"
              help="May be left blank if a container image is supplied"
              model={model}
              errors={errors}
              validator={appValidator}>
              <textarea style={{resize: "vertical"}} />
            </FormGroupComponent>
            <div className="row full-bleed">
              <CollapsiblePanelComponent title="Docker container settings">
                <ContainerSettingsComponent model={model} errors={errors} />
              </CollapsiblePanelComponent>
            </div>
            <div className="row full-bleed">
              <CollapsiblePanelComponent title="Environment variables">
                <OptionalEnvironmentComponent
                  errorIndices={state.errorIndices.env}
                  rows={state.fields.env} />
              </CollapsiblePanelComponent>
            </div>
            <div className="row full-bleed">
              <CollapsiblePanelComponent title="Optional settings">
                <OptionalSettingsComponent model={model} errors={errors} />
              </CollapsiblePanelComponent>
            </div>
            <div className="modal-controls">
              {errorBlock}
              {submitButton} {cancelButton}
            </div>
          </div>
        </form>
      </ModalComponent>
    );
  }
});

module.exports = AppModalComponent;
