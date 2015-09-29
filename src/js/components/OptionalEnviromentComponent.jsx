var classNames = require("classnames");
var React = require("react/addons");

var DuplicableRowControls = require("../components/DuplicableRowControls");
var DuplicableRowsMixin = require("../mixins/DuplicableRowsMixin");
var FormGroupComponent =
  require("../components/FormGroupComponent");

var OptionalEnvironmentComponent = React.createClass({
  displayName: "OptionalEnvironmentComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    env: {
      key: "",
      value: ""
    }
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.addRow("env", position);
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow("env", position);
  },

  handleChange: function (position) {
    this.updateRow("env", position);
  },

  getEnviromentRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError("env", row.consecutiveKey);

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    return (
      <div key={row.consecutiveKey} className={rowClassSet}>
        <fieldset
            className="row duplicable-row"
            onChange={this.handleChange.bind(null, i)}>
          <div className="col-sm-6 add-colon">
            <FormGroupComponent
              fieldId={`env.key.${i}`}
              label="Key"
              value={row.key}>
              <input ref={`key${i}`} />
            </FormGroupComponent>
          </div>
          <div className="col-sm-6">
            <FormGroupComponent
              fieldId={`env.value.${i}`}
              label="Value"
              value={row.value}>
              <input ref={`value${i}`} />
            </FormGroupComponent>
            <DuplicableRowControls
              disableRemoveButton={disableRemoveButton}
              handleAddRow={this.handleAddRow.bind(null, i + 1)}
              handleRemoveRow={this.handleRemoveRow.bind(null, i)} />
          </div>
        </fieldset>
        {error}
      </div>
    );
  },

  getEnviromentRows: function () {
    var rows = this.state.rows.env;

    if (rows == null) {
      return null;
    }

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow("env");

    return rows.map((row, i) => {
      return this.getEnviromentRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    return (
      <div>
        <div className="duplicable-list">
          {this.getEnviromentRows()}
        </div>
        {this.getGeneralErrorBlock("env")}
      </div>
    );
  }
});

module.exports = OptionalEnvironmentComponent;
