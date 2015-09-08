var classNames = require("classnames");
var React = require("react/addons");

var AppFormErrorMessages = require("../validators/AppFormErrorMessages");
var DuplicableRowControls = require("../components/DuplicableRowControls");
var FormActions = require("../actions/FormActions");
var StoreFormGroupComponent =
  require("../components/StoreFormGroupComponent");

var OptionalSettingsComponent = React.createClass({
  displayName: "OptionalEnvironmentComponent",

  propTypes: {
    errorIndices: React.PropTypes.array,
    rows: React.PropTypes.array
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();
    // Add a new empty line.
    var env = this.state.env.concat({key: "", value: ""});
    this.setState({env: env});
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();
    var env = this.state.env.slice();
    env = env.map(function (value, index) {
      return value && index !== position;
    });
    // If the array is empty we need to add a default object.
    if (env.filter((exists) => exists).length === 0) {
      env.push({key: "", value: ""});
    }
    this.setState({env: env});
  },

  handleChange: function (i) {
    var findDOMNode = React.findDOMNode;

    var row = {
      key: findDOMNode(this.refs[`envKey${i}`]).value,
      value: findDOMNode(this.refs[`envValue${i}`]).value
    };

    FormActions.update("env", row, i);
  },

  getError: function (index) {
    var errorIndices = this.props.errorIndices;
    if (errorIndices != null) {
      let errorIndex = errorIndices[index];
      if (errorIndex != null) {
        return (
          <div className="help-block">
            <strong>
              {AppFormErrorMessages.getMessage("env", errorIndex)}
            </strong>
          </div>
        );
      }
    }
    return null;
  },

  getEnviromentRow: function (row, i) {
    var error = this.getError(i);

    var errorClassSet = classNames({
      "has-error": !!error
    });

    return (
      <div key={`env.${i}`} className={errorClassSet}>
        <fieldset
            className="row duplicable-row"
            onChange={this.handleChange.bind(null, i)}>
          <div className="col-sm-6 add-colon">
            <StoreFormGroupComponent
              fieldId={`env.key.${i}`}
              label="Key"
              value={row.key}>
              <input ref={`envKey${i}`} />
            </StoreFormGroupComponent>
          </div>
          <div className="col-sm-6">
            <StoreFormGroupComponent
              fieldId={`env.value.${i}`}
              label="Value"
              value={row.value}>
              <input ref={`envValue${i}`} />
            </StoreFormGroupComponent>
            <DuplicableRowControls
              handleAddRow={this.handleAddRow.bind(null, i)}
              handleRemoveRow={this.handleRemoveRow.bind(null, i)} />
          </div>
        </fieldset>
        {error}
      </div>
    );
  },

  getEnviromentRows: function () {
    var rows = this.props.rows;

    if (rows == null) {
      return this.getEnviromentRow({key: "", value: ""}, 0);
    }

    return rows.map((row, i) => {
      return this.getEnviromentRow(row, i);
    });
  },

  render: function () {
    return (
      <div>
        <div className="duplicable-list">
          {this.getEnviromentRows()}
        </div>
      </div>
    );
  }
});

module.exports = OptionalSettingsComponent;
