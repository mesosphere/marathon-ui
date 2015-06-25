var React = require("react/addons");

var FormGroupComponent = React.createClass({
  displayName: "FormGroupComponent",

  propTypes: {
    attribute: React.PropTypes.string,
    children: React.PropTypes.object.isRequired,
    errors: React.PropTypes.array,
    help: React.PropTypes.string,
    label: React.PropTypes.string,
    model: React.PropTypes.object.isRequired,
    validator: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      validationError: null
    };
  },

  onInputChange: function (event) {
    var props = this.props;

    props.model[event.target.name] = event.target.value;

    this.setState({
      validationError: props.validator.validate(props.model)
    });
  },

  render: function () {
    var errorBlock, helpBlock;

    var errors = [];
    var attribute = this.props.attribute;
    var className = "form-group";
    var fieldId = attribute + "-field";

    // Find any errors matching this attribute.
    if (this.state.validationError != null) {
      errors = this.state.validationError.filter(function (e) {
        return (e.attribute === attribute);
      });
    }

    // Also check for passed in errors
    if (this.props.errors != null) {
      errors = errors.concat(
        this.props.errors.filter(function (e) {
          return (e.attribute === attribute);
        })
      );
    }

    // Assume there is a single child of either <input> or <textarea>, and add
    // the needed props to make it an input for this attribute.
    var formControlChild = React.cloneElement(
      React.Children.only(this.props.children),
      {
        className: "form-control",
        id: fieldId,
        name: attribute,
        onChange: this.onInputChange,
        value: this.props.model[attribute]
      }
    );

    if (errors.length > 0) {
      className += " has-error";
      errorBlock = errors.map(function (error, i) {
        return <div key={i} className="help-block"><strong>{error.message}</strong></div>;
      });
    }

    if (this.props.help != null) {
      helpBlock = <div className="help-block">{this.props.help}</div>;
    }

    return (
      <div className={className}>
        <label htmlFor={fieldId} className="control-label">
          {this.props.label}
        </label>
        <div>
          {formControlChild}
          {helpBlock}
          {errorBlock}
        </div>
      </div>
    );
  }
});

module.exports = FormGroupComponent;
