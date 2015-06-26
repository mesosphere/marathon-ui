var _ = require("underscore");
var lazy = require("lazy.js");
var React = require("react/addons");
var util = require("../helpers/util");

var AppsActions = require("../actions/AppsActions");
var AppsEvents = require("../events/AppsEvents");
var appScheme = require("../stores/appScheme");
var AppsStore = require("../stores/AppsStore");
var appValidator = require("../validators/appValidator");
var FormGroupComponent = require("../components/FormGroupComponent");
var ModalComponent = require("../components/ModalComponent");
var ValidationError = require("../validators/ValidationError");

var NewAppModalComponent = React.createClass({
  displayName: "NewAppModalComponent",

  propTypes: {
    onDestroy: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      onDestroy: util.noop
    };
  },

  getInitialState: function () {
    return {
      attributes: lazy(appScheme).extend({
        cpus: 0.1,
        instances: 1,
        mem: 16.0,
        disk: 0.0
      }).value(),
      errors: []
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.CREATE_APP, this.onCreateApp);
    AppsStore.on(AppsEvents.CREATE_APP_ERROR, this.onCreateAppError);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.CREATE_APP,
      this.onCreateApp);
    AppsStore.removeListener(AppsEvents.CREATE_APP_ERROR,
      this.onCreateAppError);
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

  destroy: function () {
    // This will also call `this.props.onDestroy` since it is passed as the
    // callback for the modal's `onDestroy` prop.
    this.refs.modalComponent.destroy();
  },

  clearValidation: function () {
    this.setState({errors: []});
  },

  validateResponse: function (response, status) {
    var errors;

    if (status === 422 && response != null &&
        _.isArray(response.errors)) {
      errors = response.errors.map(function (e) {
        return new ValidationError(
          // Errors that affect multiple attributes provide a blank string. In
          // that case, count it as a "general" error.
          e.attribute.length < 1 ? "general" : e.attribute,
          e.error
        );
      });
    } else if (status >= 500) {
      errors = [
        new ValidationError("general", "Server error, could not create app.")
      ];
    } else {
      errors = [
        new ValidationError(
          "general",
          "App creation unsuccessful. Check your connection and try again."
        )
      ];
    }

    this.setState({errors: errors});
  },

  onSubmit: function (event) {
    event.preventDefault();

    var attrArray = util.serializeArray(event.target);
    var modelAttrs = {};

    for (var i = 0; i < attrArray.length; i++) {
      var val = attrArray[i];
      if (val.value !== "") {
        modelAttrs[val.name] = val.value;
      }
    }

    // URIs should be an Array of Strings.
    if ("uris" in modelAttrs) {
      modelAttrs.uris = modelAttrs.uris.split(",");
    } else {
      modelAttrs.uris = [];
    }

    // Constraints should be an Array of Strings.
    if ("constraints" in modelAttrs) {
      var constraintsArray = modelAttrs.constraints.split(",");
      modelAttrs.constraints = constraintsArray.map(function (constraint) {
        return constraint.split(":").map(function (value) {
          return value.trim();
        });
      });
    }

    // Ports should always be an Array.
    if ("ports" in modelAttrs) {
      var portStrings = modelAttrs.ports.split(",");
      modelAttrs.ports = _.map(portStrings, function (p) {
        var port = parseInt(p, 10);
        return _.isNaN(port) ? p : port;
      });
    } else {
      modelAttrs.ports = [];
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

    var model = _.extend(this.state.attributes, modelAttrs);

    // Create app if validate() returns no errors
    if (appValidator.validate(model) == null) {
      AppsActions.createApp(model);
    }
  },

  render: function () {
    var model = this.state.attributes;
    var errors = this.state.errors;

    var generalErrors = errors.filter(function (e) {
        return (e.attribute === "general");
      });

    var errorBlock = generalErrors.map(function (error, i) {
      return <p key={i} className="text-danger"><strong>{error.message}</strong></p>;
    });

    var helpMessage = "Comma-separated list of valid constraints. Valid constraint format is \"field:operator[:value]\".";

    return (
      <ModalComponent ref="modalComponent" onDestroy={this.props.onDestroy}>
        <form method="post" role="form" onSubmit={this.onSubmit}>
          <div className="modal-header">
            <button type="button" className="close"
              aria-hidden="true" onClick={this.destroy}>&times;</button>
            <h3 className="modal-title">New Application</h3>
          </div>
          <div className="modal-body">
            <FormGroupComponent
                attribute="id"
                label="ID"
                model={model}
                errors={errors}
                validator={appValidator}>
              <input autoFocus required />
            </FormGroupComponent>
            <FormGroupComponent
                attribute="cpus"
                label="CPUs"
                model={model}
                errors={errors}
                validator={appValidator}>
              <input min="0" step="any" type="number" required />
            </FormGroupComponent>
            <FormGroupComponent
                attribute="mem"
                label="Memory (MB)"
                model={model}
                errors={errors}
                validator={appValidator}>
              <input min="0" step="any" type="number" required />
            </FormGroupComponent>
            <FormGroupComponent
                attribute="disk"
                label="Disk Space (MB)"
                model={model}
                errors={errors}
                validator={appValidator}>
              <input min="0" step="any" type="number" required />
            </FormGroupComponent>
            <FormGroupComponent
                attribute="instances"
                label="Instances"
                model={model}
                errors={errors}
                validator={appValidator}>
              <input min="0" step="1" type="number" required />
            </FormGroupComponent>
            <hr />
            <h4>Optional Settings</h4>
            <FormGroupComponent
                attribute="cmd"
                label="Command"
                model={model}
                errors={errors}
                validator={appValidator}>
              <textarea style={{resize: "vertical"}} />
            </FormGroupComponent>
            <FormGroupComponent
                attribute="executor"
                label="Executor"
                model={model}
                errors={errors}
                validator={appValidator}>
              <input
                pattern={appValidator.VALID_EXECUTOR_PATTERN}
                title="Executor must be the string '//cmd', a string containing only single slashes ('/'), or blank." />
            </FormGroupComponent>
            <FormGroupComponent
                attribute="ports"
                help="Comma-separated list of numbers. 0's (zeros) assign random ports. (Default: one random port)"
                label="Ports"
                model={model}
                errors={errors}
                validator={appValidator}>
              <input />
            </FormGroupComponent>
            <FormGroupComponent
                attribute="uris"
                help="Comma-separated list of valid URIs."
                label="URIs"
                model={model}
                errors={errors}
                validator={appValidator}>
              <input />
            </FormGroupComponent>
            <FormGroupComponent
                attribute="constraints"
                help={helpMessage}
                label="Constraints"
                model={model}
                errors={errors}
                validator={appValidator}>
              <input />
            </FormGroupComponent>
            <div>
              {errorBlock}
              <input type="submit" className="btn btn-success" value="+ Create" /> <button className="btn btn-default" type="button" onClick={this.destroy}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </ModalComponent>
    );
  }
});

module.exports = NewAppModalComponent;
