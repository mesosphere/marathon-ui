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
    return {
      rows: {
        enviromentVariables: [true]
      }
    };
  },

  handleAddRow: function (rowKey, position, event) {
    event.target.blur();
    event.preventDefault();
    console.log(this.props.model, rowKey, position);
    var rows = React.addons.update(
      this.state.rows, {[rowKey]: {$push: [true]}}
    );
    this.setState({rows: rows});
  },

  handleRemoveRow: function (rowKey, position, event) {
    /* Each array represents a list of duplicable rows, in order to keep track
     * of which rows have been deleted by the user. A value of false signifies
     * a deleted row.
     * The form submits values infered directly from the DOM.
     */
    event.target.blur();
    event.preventDefault();
    var rows = React.addons.update(
      this.state.rows, {[rowKey]: {[position]: {$set: false}}}
    );
    if (rows[rowKey].filter((exists) => exists).length === 0) {
      rows[rowKey].push(true);
    }
    this.setState({rows: rows});
  },

  render: function () {
    var enviromentRows = this.state.rows.enviromentVariables
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
            attribute={`enviromentVariables[${i}].key`}
            label="Key"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <input />
          </FormGroupComponent>
        </div>
        <div className="col-sm-6">
          <FormGroupComponent
            attribute={`enviromentVariables[${i}].value`}
            label="Value"
            model={this.props.model}
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
