var classNames = require("classnames");
var React = require("react/addons");
var Util = require("../helpers/Util");

var AppFormErrorMessages = require("../constants/AppFormErrorMessages");
var ContainerConstants = require("../constants/ContainerConstants");
var DuplicableRowControls = require("../components/DuplicableRowControls");
var dockerRowSchemes = require("../stores/dockerRowSchemes");
var FormActions = require("../actions/FormActions");
var FormGroupComponent = require("../components/FormGroupComponent");

const portInputAttributes = {
  min: 0,
  max: 65535,
  step: 1,
  type: "number"
};

const duplicableRowFieldIds = [
  "dockerPortMappings",
  "dockerParameters",
  "containerVolumes"
];

var ContainerSettingsComponent = React.createClass({
  displayName: "ContainerSettingsComponent",

  propTypes: {
    errorIndices: React.PropTypes.object,
    fields: React.PropTypes.object,
    getErrorMessage: React.PropTypes.func
  },

  statics: {
    fieldIds: Object.freeze({
      containerVolumes: "containerVolumes",
      dockerImage: "dockerImage",
      dockerNetwork: "dockerNetwork",
      dockerParameters: "dockerParameters",
      dockerPortMappings: "dockerPortMappings",
      dockerPrivileged: "dockerPrivileged"
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
            Util.extendObject(dockerRowSchemes[fieldId], {
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

    return Object.keys(dockerRowSchemes[rowFieldId])
      .reduce(function (memo, key) {
        memo[key] = findDOMNode(refs[`${key}${i}`]).value;
        return memo;
      }, row);
  },

  handleAddRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();
    FormActions.insert(fieldId, Util.extendObject(dockerRowSchemes[fieldId], {
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

  getPortMappingRow: function (row, i, disableRemoveButton = false) {
    var fieldsetId = ContainerSettingsComponent.fieldIds.dockerPortMappings;
    var error = this.getError(fieldsetId, row.consecutiveKey);
    var getErrorMessage = this.props.getErrorMessage;
    var handleChange = this.handleChangeRow.bind(null, fieldsetId, i);
    var handleAddRow =
      this.handleAddRow.bind(null, fieldsetId, i + 1);
    var handleRemoveRow =
      this.handleRemoveRow.bind(null, fieldsetId, i);

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    return (
      <div key={row.consecutiveKey} className={rowClassSet}>
        <fieldset className="row duplicable-row"
          onChange={handleChange}>
          <div className="col-sm-3">
            <FormGroupComponent
              errorMessage={
                getErrorMessage(`${fieldsetId}.${i}.containerPort`)
              }
              fieldId={`${fieldsetId}.${i}.containerPort`}
              label="Container Port"
              value={row.containerPort}>
              <input ref={`containerPort${i}`} {...portInputAttributes}/>
            </FormGroupComponent>
          </div>
          <div className="col-sm-3">
            <FormGroupComponent
              errorMessage={
                getErrorMessage(`${fieldsetId}.${i}.hostPort`)
              }
              fieldId={`${fieldsetId}.${i}.hostPort`}
              label="Host Port"
              value={row.hostPort}>
              <input ref={`hostPort${i}`} {...portInputAttributes}/>
            </FormGroupComponent>
          </div>
          <div className="col-sm-2">
            <FormGroupComponent
              errorMessage={
                getErrorMessage(`${fieldsetId}.${i}.servicePort`)
              }
              fieldId={`${fieldsetId}.${i}.servicePort`}
              label="Service Port"
              value={row.servicePort}>
              <input ref={`servicePort${i}`} {...portInputAttributes}/>
            </FormGroupComponent>
          </div>
          <div className="col-sm-4">
            <FormGroupComponent
              errorMessage={
                getErrorMessage(`${fieldsetId}.${i}.protocol`)
              }
              fieldId={`${fieldsetId}.${i}.protocol`}
              label="Protocol"
              value={row.protocol}>
              <select defaultValue={row.protocol} ref={`protocol${i}`}>
                <option value="">Select</option>
                <option value={ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP}>
                  {ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP}
                </option>
                <option value={ContainerConstants.PORTMAPPINGS.PROTOCOL.UDP}>
                  {ContainerConstants.PORTMAPPINGS.PROTOCOL.UDP}
                </option>
              </select>
            </FormGroupComponent>
            <DuplicableRowControls disableRemoveButton={disableRemoveButton}
              handleAddRow={handleAddRow}
              handleRemoveRow={handleRemoveRow} />
          </div>
        </fieldset>
        {error}
      </div>
    );
  },

  getPortMappingRows: function () {
    var rows = this.state.rows.dockerPortMappings;

    if (rows == null) {
      return null;
    }

    if (this.props.fields.dockerNetwork === ContainerConstants.NETWORK.HOST) {
      return (
        <div className="help-block">
          While host networking is selected you cannot define port mappings.
          <br />
          Consider to modify the applications port configuration.
        </div>
      );
    }

    var disableRemoveButton = (rows.length === 1 &&
      Util.isEmptyString(rows[0].containerPort) &&
      Util.isEmptyString(rows[0].hostPort) &&
      Util.isEmptyString(rows[0].servicePort) &&
      (rows[0].protocol == null || Util.isEmptyString(rows[0].protocol)));

    return rows.map((row, i) => {
      return this.getPortMappingRow(row, i, disableRemoveButton);
    });
  },

  getParametersRow: function (row, i, disableRemoveButton = false) {
    var fieldsetId = ContainerSettingsComponent.fieldIds.dockerParameters;
    var error = this.getError(fieldsetId, row.consecutiveKey);
    var getErrorMessage = this.props.getErrorMessage;
    var handleChange = this.handleChangeRow.bind(null, fieldsetId, i);
    var handleAddRow = this.handleAddRow.bind(null, fieldsetId, i + 1);
    var handleRemoveRow =
      this.handleRemoveRow.bind(null, fieldsetId, i);

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    return (
      <div key={row.consecutiveKey} className={rowClassSet}>
        <fieldset className="row duplicable-row" onChange={handleChange}>
          <div className="col-sm-6 add-colon">
            <FormGroupComponent
              errorMessage={getErrorMessage(`${fieldsetId}.${i}.key`)}
              fieldId={`${fieldsetId}.${i}.key`}
              label="Key"
              value={row.key}>
              <input ref={`key${i}`} />
            </FormGroupComponent>
          </div>
          <div className="col-sm-6">
            <FormGroupComponent
              errorMessage={getErrorMessage(`${fieldsetId}.${i}.value`)}
              fieldId={`${fieldsetId}.${i}.value`}
              label="Value"
              value={row.value}>
              <input ref={`value${i}`} />
            </FormGroupComponent>
            <DuplicableRowControls disableRemoveButton={disableRemoveButton}
              handleAddRow={handleAddRow}
              handleRemoveRow={handleRemoveRow} />
          </div>
        </fieldset>
        {error}
      </div>
    );
  },

  getParametersRows: function () {
    var rows = this.state.rows.dockerParameters;

    if (rows == null) {
      return null;
    }

    var disableRemoveButton = (rows.length === 1 &&
      Util.isEmptyString(rows[0].key) &&
      Util.isEmptyString(rows[0].value));

    return rows.map((row, i) => {
      return this.getParametersRow(row, i, disableRemoveButton);
    });
  },

  getVolumesRow: function (row, i, disableRemoveButton = false) {
    var fieldsetId = ContainerSettingsComponent.fieldIds.containerVolumes;
    var error = this.getError(fieldsetId, row.consecutiveKey);
    var getErrorMessage = this.props.getErrorMessage;
    var handleChange = this.handleChangeRow.bind(null, fieldsetId, i);
    var handleAddRow = this.handleAddRow.bind(null, fieldsetId, i + 1);
    var handleRemoveRow =
      this.handleRemoveRow.bind(null, fieldsetId, i);

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    return (
      <div key={row.consecutiveKey} className={rowClassSet}>
        <fieldset className="row duplicable-row"
          onChange={handleChange}>
          <div className="col-sm-4">
            <FormGroupComponent
              errorMessage={
                getErrorMessage(`${fieldsetId}.${i}.containerPath`)
              }
              fieldId={`${fieldsetId}.${i}.containerPath`}
              label="Container Path"
              value={row.containerPath}>
              <input ref={`containerPath${i}`} />
            </FormGroupComponent>
          </div>
          <div className="col-sm-4">
            <FormGroupComponent
              errorMessage={getErrorMessage(`${fieldsetId}.${i}.hostPath`)}
              fieldId={`${fieldsetId}.${i}.hostPath`}
              label="Host Path"
              value={row.hostPath}>
              <input ref={`hostPath${i}`} />
            </FormGroupComponent>
          </div>
          <div className="col-sm-4">
            <FormGroupComponent
              errorMessage={getErrorMessage(`${fieldsetId}.${i}.mode`)}
              fieldId={`${fieldsetId}.${i}.mode`}
              label="Mode"
              value={row.mode}>
              <select defaultValue="" ref={`mode${i}`}>
                <option value="">Select</option>
                <option value={ContainerConstants.VOLUMES.MODE.RO}>
                  Read Only
                </option>
                <option value={ContainerConstants.VOLUMES.MODE.RW}>
                  Read and Write
                </option>
              </select>
            </FormGroupComponent>
            <DuplicableRowControls disableRemoveButton={disableRemoveButton}
              handleAddRow={handleAddRow}
              handleRemoveRow={handleRemoveRow} />
          </div>
        </fieldset>
        {error}
      </div>
    );
  },

  getVolumesRows: function () {
    var rows = this.state.rows.containerVolumes;

    if (rows == null) {
      return null;
    }

    var disableRemoveButton = (rows.length === 1 &&
      Util.isEmptyString(rows[0].containerPath) &&
      Util.isEmptyString(rows[0].hostPath) &&
      (rows[0].mode == null || Util.isEmptyString(rows[0].mode)));

    return rows.map((row, i) => {
      return this.getVolumesRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    var props = this.props;
    var fieldIds = ContainerSettingsComponent.fieldIds;

    return (
      <div>
        <div className="row">
          <div className="col-sm-6">
            <FormGroupComponent
              errorMessage={props.getErrorMessage(fieldIds.dockerImage)}
              fieldId={fieldIds.dockerImage}
              label="Image"
              value={props.fields[fieldIds.dockerImage]}
              onChange={this.handleFieldUpdate}>
              <input />
            </FormGroupComponent>
          </div>
          <div className="col-sm-6">
            <FormGroupComponent
              errorMessage={props.getErrorMessage(fieldIds.dockerNetwork)}
              fieldId={fieldIds.dockerNetwork}
              label="Network"
              value={props.fields[fieldIds.dockerNetwork]}
              onChange={this.handleFieldUpdate}>
              <select defaultValue="">
                <option value="">Select</option>
                <option value={ContainerConstants.NETWORK.HOST}>
                  Host
                </option>
                <option value={ContainerConstants.NETWORK.BRIDGE}>
                  Bridged
                </option>
              </select>
            </FormGroupComponent>
          </div>
        </div>
        <h4>Privileges</h4>
        <FormGroupComponent className="checkbox-form-group"
          errorMessage={props.getErrorMessage(fieldIds.dockerPrivileged)}
          fieldId={fieldIds.dockerPrivileged}
          help="Select to give this container access to all devices on the host"
          label="Extend runtime privileges to this container"
          value={props.fields[fieldIds.dockerPrivileged]}
          onChange={this.handleFieldUpdate}>
          <input type="checkbox" />
        </FormGroupComponent>
        <h4>Port Mappings</h4>
        <div className="duplicable-list">{this.getPortMappingRows()}</div>
        <h4>Parameters</h4>
        <div className="duplicable-list">{this.getParametersRows()}</div>
        <h4>Volumes</h4>
        <div className="duplicable-list">{this.getVolumesRows()}</div>
      </div>
    );
  }
});

module.exports = ContainerSettingsComponent;
