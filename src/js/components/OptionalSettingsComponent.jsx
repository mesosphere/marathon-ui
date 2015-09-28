var React = require("react/addons");

var FormActions = require("../actions/FormActions");
var FormGroupComponent =
  require("../components/FormGroupComponent");

var OptionalSettingsComponent = React.createClass({
  displayName: "OptionalSettingsComponent",

  propTypes: {
    errorIndices: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired
  },

  statics: {
    fieldIds: Object.freeze({
      executor: "executor",
      ports: "ports",
      uris: "uris",
      constraints: "constraints",
      acceptedResourceRoles: "acceptedResourceRoles",
      user: "user"
    })
  },

  handleFieldUpdate: function (fieldId, value) {
    FormActions.update(fieldId, value);
  },

  render: function () {
    var props = this.props;
    var fields = props.fields;
    var fieldIds = OptionalSettingsComponent.fieldIds;

    var acceptedResourceRolesHelp = "Comma-separated list of resource roles. " +
      "Marathon considers only resource offers with roles in this list for " +
      "launching tasks of this app.";
    var contraintsHelp = "Comma-separated list of valid constraints. " +
      "Valid constraint format is \"field:operator[:value]\".";
    var executorHelp = "Executor must be the string '//cmd', a string " +
      "containing only single slashes ('/'), or blank.";
    var portsHelp = "Comma-separated list of numbers. 0's (zeros) assign " +
      "random ports. (Default: one random port)";

    return (
      <div>
        <FormGroupComponent
            errorMessage={props.getErrorMessage(fieldIds.executor)}
            fieldId={fieldIds.executor}
            help={executorHelp}
            label="Executor"
            onChange={this.handleFieldUpdate}
            value={fields[fieldIds.executor]}>
          <input />
        </FormGroupComponent>
        <FormGroupComponent
            errorMessage={props.getErrorMessage(fieldIds.ports)}
            fieldId={fieldIds.ports}
            help={portsHelp}
            label="Ports"
            onChange={this.handleFieldUpdate}
            value={fields[fieldIds.ports]}>
          <input />
        </FormGroupComponent>
        <FormGroupComponent
            errorMessage={props.getErrorMessage(fieldIds.uris)}
            fieldId={fieldIds.uris}
            help="Comma-separated list of valid URIs."
            label="URIs"
            onChange={this.handleFieldUpdate}
            value={fields[fieldIds.uris]}>
          <input />
        </FormGroupComponent>
        <FormGroupComponent
            errorMessage={props.getErrorMessage(fieldIds.constraints)}
            fieldId={fieldIds.constraints}
            help={contraintsHelp}
            label="Constraints"
            onChange={this.handleFieldUpdate}
            value={fields[fieldIds.constraints]}>
          <input />
        </FormGroupComponent>
        <FormGroupComponent
            errorMessage={props.getErrorMessage(fieldIds.acceptedResourceRoles)}
            fieldId={fieldIds.acceptedResourceRoles}
            help={acceptedResourceRolesHelp}
            label="Accepted Resource Roles"
            onChange={this.handleFieldUpdate}
            value={fields[fieldIds.acceptedResourceRoles]}>
          <input />
        </FormGroupComponent>
        <FormGroupComponent
            errorMessage={props.getErrorMessage(fieldIds.user)}
            fieldId={fieldIds.user}
            label="User"
            onChange={this.handleFieldUpdate}
            value={fields[fieldIds.user]}>
          <input />
        </FormGroupComponent>
      </div>
    );
  }
});

module.exports = OptionalSettingsComponent;
