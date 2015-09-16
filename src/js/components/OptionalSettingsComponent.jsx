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

  handleFieldUpdate: function (fieldId, value) {
    FormActions.update(fieldId, value);
  },

  render: function () {
    var props = this.props;
    var fields = props.fields;

    var contraintsHelp = "Comma-separated list of valid constraints. " +
      "Valid constraint format is \"field:operator[:value]\".";
    var executorHelp = "Executor must be the string '//cmd', a string " +
      "containing only single slashes ('/'), or blank.";
    var portsHelp = "Comma-separated list of numbers. 0's (zeros) assign " +
      "random ports. (Default: one random port)";

    return (
      <div>
        <FormGroupComponent
            errorMessage={props.getErrorMessage("executor")}
            fieldId="executor"
            help={executorHelp}
            label="Executor"
            onChange={this.handleFieldUpdate}
            value={fields.executor}>
          <input />
        </FormGroupComponent>
        <FormGroupComponent
            errorMessage={props.getErrorMessage("ports")}
            fieldId="ports"
            help={portsHelp}
            label="Ports"
            onChange={this.handleFieldUpdate}
            value={fields.ports}>
          <input />
        </FormGroupComponent>
        <FormGroupComponent
            errorMessage={props.getErrorMessage("uris")}
            fieldId="uris"
            help="Comma-separated list of valid URIs."
            label="URIs"
            onChange={this.handleFieldUpdate}
            value={fields.uris}>
          <input />
        </FormGroupComponent>
        <FormGroupComponent
            errorMessage={props.getErrorMessage("constraints")}
            fieldId="constraints"
            help={contraintsHelp}
            label="Constraints"
            onChange={this.handleFieldUpdate}
            value={fields.constraints}>
          <input />
        </FormGroupComponent>
      </div>
    );
  }
});

module.exports = OptionalSettingsComponent;
