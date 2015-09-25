var classNames = require("classnames");
var React = require("react/addons");

var Util = require("../helpers/Util");

var AppFormErrorMessages = require("../constants/AppFormErrorMessages");
var DuplicableRowControls = require("../components/DuplicableRowControls");
var FormActions = require("../actions/FormActions");
var FormGroupComponent =
  require("../components/FormGroupComponent");

var OptionalLabelsComponent = React.createClass({
  displayName: "OptionalLabelsComponent",

  propTypes: {
    errorIndices: React.PropTypes.array,
    generalError: React.PropTypes.string,
    rows: React.PropTypes.array
  },

  populateInitialConsecutiveKeys: function (rows) {
    if (rows == null) {
      return null;
    }

    return rows.map(function (row) {
      return {
        key: row.key,
        value: row.value,
        consecutiveKey: row.consecutiveKey != null
          ? row.consecutiveKey
          : Util.getUniqueId()
      };
    });
  },

  getInitialState: function () {
    return {
      rows: this.populateInitialConsecutiveKeys(this.props.rows)
    };
  },

  enforceMinRows: function () {
    if (this.state.rows == null || this.state.rows.length === 0) {
      FormActions.insert("labels", {
        key: "",
        value: "",
        consecutiveKey: Util.getUniqueId()
      });
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      rows: this.populateInitialConsecutiveKeys(nextProps.rows)
    }, this.enforceMinRows);
  },

  componentWillMount: function () {
    this.enforceMinRows();
  },

  getDuplicableRowValues: function (position) {
    var findDOMNode = React.findDOMNode;
    return {
      key: findDOMNode(this.refs[`labelsKey${position}`]).value,
      value: findDOMNode(this.refs[`labelsValue${position}`]).value,
      consecutiveKey: this.state.rows[position].consecutiveKey
    };
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    FormActions.insert("labels", {
        key: "",
        value: "",
        consecutiveKey: Util.getUniqueId()
      },
      position
    );
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();
    var row = this.getDuplicableRowValues(position);

    FormActions.delete("labels", row, position);
  },

  handleChange: function (position) {
    var row = this.getDuplicableRowValues(position);
    FormActions.update("labels", row, position);
  },

  getError: function (consecutiveKey) {
    var errorIndices = this.props.errorIndices;
    if (errorIndices != null) {
      let errorIndex = errorIndices[consecutiveKey];
      if (errorIndex != null) {
        return (
          <div className="help-block">
            <strong>
              {AppFormErrorMessages.getMessage("labels", errorIndex)}
            </strong>
          </div>
        );
      }
    }
    return null;
  },

  getGeneralErrorBlock: function () {
    var error = this.props.generalError;

    if (error == null) {
      return null;
    }

    return (
      <p className="text-danger">
        <strong>{error}</strong>
      </p>
    );
  },

  getLabelRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError(row.consecutiveKey);

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    console.log("i", i, row.consecutiveKey);

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
              <input ref={`labelsKey${i}`} />
            </FormGroupComponent>
          </div>
          <div className="col-sm-6">
            <FormGroupComponent
              fieldId={`labels.value.${i}`}
              label="Value"
              value={row.value}>
              <input ref={`labelsValue${i}`} />
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
    var rows = this.state.rows;

    console.log("r", rows);

    if (rows == null) {
      return null;
    }

    let disableRemoveButton = (rows.length === 1 &&
      Util.isEmptyString(rows[0].key) &&
      Util.isEmptyString(rows[0].value));

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
        {this.getGeneralErrorBlock()}
      </div>
    );
  }
});

module.exports = OptionalLabelsComponent;
