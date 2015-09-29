var classNames = require("classnames");
var React = require("react/addons");

var DuplicableRowControls = require("../components/DuplicableRowControls");
var DuplicableRowsMixin = require("../mixins/DuplicableRowsMixin");
var FormGroupComponent =
  require("../components/FormGroupComponent");

var OptionalLabelsComponent = React.createClass({
  displayName: "OptionalLabelsComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    labels: {
      key: "",
      value: ""
    }
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.addRow("labels", position);
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow("labels", position);
  },

  handleChange: function (position) {
    this.updateRow("labels", position);
  },

  getLabelRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError("labels", row.consecutiveKey);

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
              fieldId={`labels.key.${i}`}
              label="Key"
              value={row.key}>
              <input ref={`key${i}`} />
            </FormGroupComponent>
          </div>
          <div className="col-sm-6">
            <FormGroupComponent
              fieldId={`labels.value.${i}`}
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

  getLabelRows: function () {
    var rows = this.state.rows.labels;

    if (rows == null) {
      return null;
    }

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow("labels");

    return rows.map((row, i) => {
      return this.getLabelRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    return (
      <div>
        <div className="duplicable-list">
          {this.getLabelRows()}
        </div>
        {this.getGeneralErrorBlock("labels")}
      </div>
    );
  }
});

module.exports = OptionalLabelsComponent;
