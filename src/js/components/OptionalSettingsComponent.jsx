var React = require("react/addons");

var appValidator = require("../validators/appValidator");
var FormGroupComponent = require("../components/FormGroupComponent");

var OptionalSettingsComponent = React.createClass({
  displayName: "OptionalSettingsComponent",

  propTypes: {
    errors: React.PropTypes.array,
    model: React.PropTypes.object.isRequired
  },

  render: function () {
    var model = this.props.model;
    var errors = this.props.errors;
    var helpMessage = "Comma-separated list of valid constraints. " +
      "Valid constraint format is \"field:operator[:value]\".";
    var attr = {};

    if (model.constraints != null) {
      attr.constraints = model.constraints.map(function (constraint) {
        return constraint.join(":");
      });
    }

    var help = {
      executor: "Executor must be the string '//cmd', a string containing " +
                "only single slashes ('/'), or blank.",
      ports: "Comma-separated list of numbers. 0's (zeros) assign random " +
             "ports. (Default: one random port)"
    };

    return (
      <div>
        <FormGroupComponent
          attribute="executor"
          label="Executor"
          model={model}
          errors={errors}
          validator={appValidator}>
          <input
            pattern={appValidator.VALID_EXECUTOR_PATTERN}
            title={help.executor} />
        </FormGroupComponent>
        <FormGroupComponent
          attribute="ports"
          help={help.ports}
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
          model={attr}
          errors={errors}
          validator={appValidator}>
          <input />
        </FormGroupComponent>
      </div>
    );
  }
});

module.exports = OptionalSettingsComponent;
