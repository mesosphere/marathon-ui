var classNames = require("classnames");
var React = require("react/addons");

var DuplicableRowsMixin = require("../mixins/DuplicableRowsMixin");
var FormGroupComponent = require("../components/FormGroupComponent");
var HealthCheckProtocols = require("../constants/HealthCheckProtocols");

const healthChecksRowScheme =
  require("../stores/schemes/healthChecksRowScheme");

const numberInputAttributes = {
  min: 0,
  step: 1,
  type: "number"
};

var HealthChecksComponent = React.createClass({
  displayName: "HealthChecksComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    healthChecks: healthChecksRowScheme
  },

  propTypes: {
    getErrorMessage: React.PropTypes.func.isRequired
  },

  handleAddRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();

    this.addRow(fieldId, position);
  },

  handleChangeRow: function (fieldId, position) {
    this.updateRow(fieldId, position);
  },

  handleRemoveRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow(fieldId, position);
  },

  getRow: function (row, i) {
    var fieldsetId = "healthChecks";

    var error = this.getError(fieldsetId, row.consecutiveKey);
    var getErrorMessage = this.props.getErrorMessage;
    var handleChange = this.handleChangeRow.bind(null, fieldsetId, i);
    var handleAddRow =
      this.handleAddRow.bind(null, fieldsetId, i + 1);
    var handleRemoveRow =
      this.handleRemoveRow.bind(null, fieldsetId, i);

    var rowClassSet = classNames({
      "field-row": true,
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
        <button type="button" className="close"
          aria-hidden="true" onClick={handleRemoveRow}>&times;</button>
        <h4>Health Check {i + 1} - {row.protocol}</h4>
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
                help={`Example: "/path/to/health".`}
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
                help={`Example: "curl -f -X GET http://$HOST:$PORT0/health"`}
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
                label="Ignore HTTP informational status codes 100 to 199."
                value={row.ignoreHttp1xx}>
                <input ref={`ignoreHttp1xx${i}`} type="checkbox" />
              </FormGroupComponent>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              {error}
              <br />
            </div>
          </div>
          <div className="row duplicable-row">
            <div className="col-sm-4">
              <button className="btn btn-default"
                  type="button"
                  onClick={handleAddRow}>
                Add Health Check
              </button>
            </div>
          </div>
        </fieldset>
      </div>
    );
  },

  getRows: function () {
    var rows = this.state.rows.healthChecks;

    if (rows == null) {
      return null;
    }

    return rows.map((row, i) => {
      return this.getRow(row, i);
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
