var classNames = require("classnames");
var React = require("react/addons");

var Util = require("../helpers/Util");

var AppFormErrorMessages = require("../validators/AppFormErrorMessages");
var DuplicableRowControls = require("../components/DuplicableRowControls");
var FormActions = require("../actions/FormActions");
var StoreFormGroupComponent =
  require("../components/StoreFormGroupComponent");

var OptionalEnvironmentComponent = React.createClass({
  displayName: "OptionalEnvironmentComponent",

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
      FormActions.insert("env", {
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

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();
    FormActions.insert("env", {
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
    FormActions.delete("env", position);
  },

  handleChange: function (i) {
    var findDOMNode = React.findDOMNode;

    var row = {
      key: findDOMNode(this.refs[`envKey${i}`]).value,
      value: findDOMNode(this.refs[`envValue${i}`]).value,
      consecutiveKey: this.state.rows[i].consecutiveKey
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

  getEnviromentRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError(i);

    var errorClassSet = classNames({
      "has-error": !!error
    });

    return (
      <div key={row.consecutiveKey} className={errorClassSet}>
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
    var rows = this.state.rows;

    if (rows == null) {
      return null;
    }

    let disableRemoveButton = (rows.length === 1 &&
      Util.isEmptyString(rows[0].key) &&
      Util.isEmptyString(rows[0].value));

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
        {this.getGeneralErrorBlock()}
      </div>
    );
  }
});

module.exports = OptionalEnvironmentComponent;
