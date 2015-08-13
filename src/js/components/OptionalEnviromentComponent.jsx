var React = require("react/addons");

var appValidator = require("../validators/appValidator");
var FormGroupComponent = require("../components/FormGroupComponent");
var DuplicableRowControls = require("../components/DuplicableRowControls");

var OptionalSettingsComponent = React.createClass({
  displayName: "OptionalEnvironmentComponent",

  propTypes: {
    errors: React.PropTypes.array,
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    var state = {
      env: Object.keys(this.props.model.env).map(function (key) {
        return {
          key: key,
          value: this.props.model.env[key]
        };
      })
    };
    if (state.env.length === 0) {
      state.env = [true];
    }
    return state;
  },

  handleAddRow: function (rowKey, position, event) {
    event.target.blur();
    event.preventDefault();
    var state = this.state;
    state.env.push(true); // = [true];
    this.setState(state);
  },

  handleRemoveRow: function (rowKey, position, event) {
    /* Each array represents a list of duplicable rows, in order to keep track
     * of which rows have been deleted by the user. A value of false signifies
     * a deleted row.
     * The form submits values infered directly from the DOM.
     */
    event.target.blur();
    event.preventDefault();
    var state = {
      env: this.state.env.filter(function (value, index) {
        return index !== position;
      })
    };
    this.setState(state);
  },

  render: function () {
    var enviromentRows = this.state.env
      .map(function (exists, index) {
        return exists
          ? this.getEnviromentRow(index)
          : null;
      }.bind(this));

    return (
      <div>
        <div className="duplicable-list">
            {enviromentRows}
        </div>
      </div>
    );
  },

  getEnviromentRow: function (i = 0) {
    return (
      <div key={`p-${i}`} className="row duplicable-row">
        <div className="col-sm-6 add-colon">
          <FormGroupComponent
            attribute={`env[${i}].key`}
            label="Key"
            model={this.state}
            errors={this.props.errors}
            validator={appValidator}>
            <input />
          </FormGroupComponent>
        </div>
        <div className="col-sm-6">
          <FormGroupComponent
            attribute={`env[${i}].value`}
            label="Value"
            model={this.state}
            errors={this.props.errors}
            validator={appValidator}>
            <input />
          </FormGroupComponent>
          <DuplicableRowControls
            handleAddRow={this.handleAddRow.bind(null, "env", i)}
            handleRemoveRow={this.handleRemoveRow.bind(null, "env", i)} />
        </div>
      </div>
    );
  }
});

module.exports = OptionalSettingsComponent;
