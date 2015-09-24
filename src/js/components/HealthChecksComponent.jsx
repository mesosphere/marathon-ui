var classNames = require("classnames");
var React = require("react/addons");
var Util = require("../helpers/Util");

var AppFormErrorMessages = require("../constants/AppFormErrorMessages");
var DuplicableRowControls = require("../components/DuplicableRowControls");
var FormActions = require("../actions/FormActions");
var FormGroupComponent = require("../components/FormGroupComponent");
var HealthCheckProtocols = require("../constants/HealthCheckProtocols");

const healthChecksRowScheme = require("../stores/healthChecksRowScheme");

const numberInputAttributes = {
  min: 0,
  step: 1,
  type: "number"
};

const duplicableRowFieldIds = [
  "healthChecks"
];

var HealthChecksComponent = React.createClass({
  displayName: "HealthChecksComponent",

  propTypes: {
    errorIndices: React.PropTypes.object,
    fields: React.PropTypes.object,
    getErrorMessage: React.PropTypes.func
  },

  statics: {
    fieldIds: Object.freeze({
      healthChecks: "healthChecks"
    })
  },

  getInitialState: function () {
    return {
      rows: this.getPopulatedRows()
    };
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      rows: this.getPopulatedRows(nextProps.fields)
    }, this.enforceMinRows);
  },

  componentWillMount: function () {
    this.enforceMinRows();
  },

  populateInitialConsecutiveKeys: function (rows) {
    if (rows == null) {
      return null;
    }

    return rows.map(function (row) {
      return Util.extendObject(row, {
        consecutiveKey: row.consecutiveKey != null
          ? row.consecutiveKey
          : Util.getUniqueId()
      });
    });
  },

  getPopulatedRows: function (fields = this.props.fields) {
    return duplicableRowFieldIds.reduce((memo, rowFieldId) => {
      memo[rowFieldId] =
        this.populateInitialConsecutiveKeys(fields[rowFieldId]);
      return memo;
    }, {});
  },

  enforceMinRows: function () {
    var state = this.state;

    duplicableRowFieldIds.forEach(function (fieldId) {
      if (state.rows[fieldId] == null || state.rows[fieldId].length === 0) {
        FormActions.insert(fieldId,
            Util.extendObject(healthChecksRowScheme, {
          consecutiveKey: Util.getUniqueId()
        }));
      }
    });
  },

  getDuplicableRowValues: function (rowFieldId, i) {
    var findDOMNode = React.findDOMNode;
    var refs = this.refs;
    const row = {
      consecutiveKey: this.state.rows[rowFieldId][i].consecutiveKey
    };

    return Object.keys(healthChecksRowScheme)
      .reduce(function (memo, key) {
        var input = findDOMNode(refs[`${key}${i}`]);
        memo[key] = input.type !== "checkbox"
          ? input.value
          : input.checked;
        return memo;
      }, row);
  },

  handleAddRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();
    FormActions.insert(fieldId, Util.extendObject(healthChecksRowScheme, {
        consecutiveKey: Util.getUniqueId()
      }),
      position
    );
  },

  handleChangeRow: function (fieldId, position) {
    var row = this.getDuplicableRowValues(fieldId, position);
    FormActions.update(fieldId, row, position);
  },

  handleFieldUpdate: function (fieldId, value) {
    FormActions.update(fieldId, value);
  },

  handleRemoveRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();
    var row = this.getDuplicableRowValues(fieldId, position);

    FormActions.delete(fieldId, row, position);
  },

  getError: function (fieldId, consecutiveKey) {
    var errorIndices = this.props.errorIndices[fieldId];
    if (errorIndices != null) {
      let errorIndex = errorIndices[consecutiveKey];
      if (errorIndex != null) {
        return (
          <div className="help-block">
            <strong>
              {AppFormErrorMessages.getMessage(fieldId, errorIndex)}
            </strong>
          </div>
        );
      }
    }
    return null;
  },

  getRow: function (row, i, disableRemoveButton = false) {
    var fieldsetId = HealthChecksComponent.fieldIds.healthChecks;
    var error = this.getError(fieldsetId, row.consecutiveKey);
    var getErrorMessage = this.props.getErrorMessage;
    var handleChange = this.handleChangeRow.bind(null, fieldsetId, i);
    var handleAddRow =
      this.handleAddRow.bind(null, fieldsetId, i + 1);
    var handleRemoveRow =
      this.handleRemoveRow.bind(null, fieldsetId, i);

    var rowClassSet = classNames({
      "has-error": !!error
    });

    var commandClassSet = classNames({
      "row": true,
      "hidden": row.protocol !== HealthCheckProtocols.COMMAND
    });

    var pathClassSet = classNames({
      "row": true,
      "hidden": row.protocol !== HealthCheckProtocols.HTTP
    });

    var portIndexClassSet = classNames({
      "col-sm-2": true,
      "hidden": row.protocol === HealthCheckProtocols.COMMAND
    });

    return (
      <div key={row.consecutiveKey} className={rowClassSet}>
        <fieldset onChange={handleChange}>

          <div className="row">
            <div className="col-sm-3">
              <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.protocol`)
                }
                fieldId={`${fieldsetId}.${i}.protocol`}
                label="Protocol"
                value={row.protocol}>
                <select defaultValue={row.protocol} ref={`protocol${i}`}>
                  <option value={HealthCheckProtocols.COMMAND}>COMMAND</option>
                  <option value={HealthCheckProtocols.HTTP}>HTTP</option>
                  <option value={HealthCheckProtocols.TCP}>TCP</option>
                </select>
              </FormGroupComponent>
            </div>
          </div>

          <div className={pathClassSet}>
            <div className="col-sm-12">
              <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.path`)
                }
                fieldId={`${fieldsetId}.${i}.path`}
                label="Path"
                value={row.path}>
                <input ref={`path${i}`} />
              </FormGroupComponent>
            </div>
          </div>

          <div className={commandClassSet}>
            <div className="col-sm-12">
              <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.command`)
                }
                fieldId={`${fieldsetId}.${i}.command`}
                label="Command"
                value={row.command}>
                <input ref={`command${i}`} />
              </FormGroupComponent>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-2">
              <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.gracePeriodSeconds`)
                }
                fieldId={`${fieldsetId}.${i}.gracePeriodSeconds`}
                label="Grace Period"
                help="seconds"
                value={row.gracePeriodSeconds}>
                <input ref={`gracePeriodSeconds${i}`}
                  {...numberInputAttributes} />
              </FormGroupComponent>
            </div>
            <div className="col-sm-2">
              <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.intervalSeconds`)
                }
                fieldId={`${fieldsetId}.${i}.intervalSeconds`}
                label="Interval"
                help="seconds"
                value={row.intervalSeconds}>
                <input ref={`intervalSeconds${i}`} {...numberInputAttributes} />
              </FormGroupComponent>
            </div>
            <div className="col-sm-2">
              <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.timeoutSeconds`)
                }
                fieldId={`${fieldsetId}.${i}.timeoutSeconds`}
                label="Timeout"
                help="seconds"
                value={row.timeoutSeconds}>
                <input ref={`timeoutSeconds${i}`} {...numberInputAttributes} />
              </FormGroupComponent>
            </div>
            <div className="col-sm-4">
              <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.maxConsecutiveFailures`)
                }
                fieldId={`${fieldsetId}.${i}.maxConsecutiveFailures`}
                label="Max. Consecutive Failures"
                value={row.maxConsecutiveFailures}>
                <input ref={`maxConsecutiveFailures${i}`}
                  {...numberInputAttributes} />
              </FormGroupComponent>
            </div>
            <div className={portIndexClassSet}>
              <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.portIndex`)
                }
                fieldId={`${fieldsetId}.${i}.portIndex`}
                label="Port Index"
                value={row.portIndex}>
                <input ref={`portIndex${i}`} {...numberInputAttributes} />
              </FormGroupComponent>
            </div>
          </div>

          <div className={pathClassSet}>
            <div className="col-sm-12">
              <FormGroupComponent className="checkbox-form-group"
                errorMessage={getErrorMessage(
                  `${fieldsetId}.${i}.ignoreHttp1xx`
                  )}
                fieldId={`${fieldsetId}.${i}.ignoreHttp1xx`}
                label="Ignore HTTP-1xx-codes"
                value={row.ignoreHttp1xx}>
                <input ref={`ignoreHttp1xx${i}`} type="checkbox" />
              </FormGroupComponent>
            </div>
          </div>

          <div className="row duplicable-row">
            <div className="col-sm-4">
              <DuplicableRowControls disableRemoveButton={disableRemoveButton}
                handleAddRow={handleAddRow}
                handleRemoveRow={handleRemoveRow} />
            </div>
          </div>

          <div className="row">
            <div className="col-sm-1">
              <br />
            </div>
          </div>

        </fieldset>
        {error}
      </div>
    );
  },

  getRows: function () {
    var rows = this.state.rows.healthChecks;

    if (rows == null) {
      return null;
    }

    return rows.map((row, i) => {
      return this.getRow(row, i, false);
    });
  },

  render: function () {
    return (
      <div>
        <div className="duplicable-list">{this.getRows()}</div>
      </div>
    );
  }
});

module.exports = HealthChecksComponent;
