var classNames = require("classnames");
var objectPath = require("object-path");
var React = require("react/addons");

var FormGroupComponent = React.createClass({
  displayName: "FormGroupComponent",

  propTypes: {
    attribute: React.PropTypes.string,
    children: React.PropTypes.node.isRequired,
    className: React.PropTypes.string,
    errors: React.PropTypes.array,
    help: React.PropTypes.string,
    label: React.PropTypes.string,
    model: React.PropTypes.object.isRequired,
    validator: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      validator: {
        validate: () => {}
      }
    };
  },

  getInitialState: function () {
    return {
      model: this.props.model,
      validationError: null
    };
  },

  onInputChange: function (event) {
    var props = this.props;
    var model = React.addons.update(this.state.model, {
      [event.target.name]: {$set: event.target.value}
    });

    this.setState({
      model: model,
      validationError: props.validator.validate(model)
    });
  },

  render: function () {
    var props = this.props;
    var state = this.state;

    var errorBlock, helpBlock;

    var errors = [];
    var attribute = props.attribute;
    var className = classNames("form-group", props.className);
    var fieldId = attribute + "-field";

    // Find any errors matching this attribute.
    if (state.validationError != null) {
      errors = state.validationError.filter(function (e) {
        return (e.attribute === attribute);
      });
    }

    // Also check for passed in errors
    if (props.errors != null) {
      errors = errors.concat(
        props.errors.filter(function (e) {
          return (e.attribute === attribute);
        })
      );
    }

    // Assume there is a single child of either <input> or <textarea>, and add
    // the needed props to make it an input for this attribute.
    var child = React.Children.only(props.children);
    var formControlChild = React.cloneElement(
      child,
      {
        className: "form-control",
        id: fieldId,
        name: attribute,
        onChange: this.onInputChange,
        defaultValue: child.props.defaultValue != null
          ? child.props.defaultValue
          : objectPath.get(state.model, attribute)
      }
    );

    if (errors.length > 0) {
      className += " has-error";
      errorBlock = errors.map(function (error, i) {
        return (
          <div key={i} className="help-block">
            <strong>{error.message}</strong>
          </div>
        );
      });
    }

    if (props.help != null) {
      helpBlock = <div className="help-block">{props.help}</div>;
    }

    return (
      <div className={className}>
        <label htmlFor={fieldId} className="control-label">
          {props.label}
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
