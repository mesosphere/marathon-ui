var classNames = require("classnames");
var React = require("react/addons");

var StoreFormGroupComponent = React.createClass({
  displayName: "StoreFormGroupComponent",

  propTypes: {
    children: React.PropTypes.node.isRequired,
    className: React.PropTypes.string,
    errorMessage: React.PropTypes.string,
    fieldId: React.PropTypes.string,
    help: React.PropTypes.string,
    label: React.PropTypes.string,
    onChange: React.PropTypes.func
  },

  handleChange: function (event) {
    var props = this.props;
    if (props.onChange) {
      let value = event.target.type !== "checkbox"
        ? event.target.value
        : event.target.checked;

      props.onChange(this.props.fieldId, value);
    }
  },

  getError: function () {
    var props = this.props;
    if (props.errorMessage == null) {
      return null;
    }

    return (
      <div className="help-block">
        <strong>{props.errorMessage}</strong>
      </div>
    );
  },

  render: function () {
    var props = this.props;
    var helpBlock;

    var fieldId = props.fieldId;
    var className = classNames({
      "form-group": true,
      "has-error": props.errorMessage != null
    }, props.className);

    var child = React.Children.only(props.children);
    var formControlChild = React.cloneElement(
      child,
      {
        className: "form-control",
        id: fieldId,
        onChange: this.handleChange,
        defaultValue: props.value
      }
    );

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
          {this.getError()}
        </div>
      </div>
    );
  }
});

module.exports = StoreFormGroupComponent;
