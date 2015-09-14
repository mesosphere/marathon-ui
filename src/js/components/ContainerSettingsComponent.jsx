var classNames = require("classnames");
var React = require("react/addons");
var Util = require("../helpers/Util");

var AppFormErrorMessages = require("../validators/AppFormErrorMessages");
var ContainerConstants = require("../constants/ContainerConstants");
var DuplicableRowControls = require("../components/DuplicableRowControls");
var dockerRowSchemes = require("../stores/dockerRowSchemes");
var FormActions = require("../actions/FormActions");
var StoreFormGroupComponent = require("../components/StoreFormGroupComponent");

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

  getInitialState: function () {
    return {
      rows: this.getPopulatedRows()
    };
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

  handleChangeRow: function (rowFieldId, i) {
    var row = this.getDuplicableRowValues(rowFieldId, i);
    FormActions.update(rowFieldId, row, i);
  },

  handleFieldUpdate: function (fieldId, value) {
    FormActions.update(fieldId, value);
  },

  handleRemoveRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();
    FormActions.delete(fieldId, position);
  },

  getError: function (fieldId, index) {
    var errorIndices = this.props.errorIndices[fieldId];
    if (errorIndices != null) {
      let errorIndex = errorIndices[index];
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
    var error = this.getError("dockerPortMappings", i);

    var errorClassSet = classNames({
      "has-error": !!error
    });

    var getErrorMessage = this.props.getErrorMessage;
    var handleChange = this.handleChangeRow.bind(null, "dockerPortMappings", i);
    var handleAddRow =
      this.handleAddRow.bind(null, "dockerPortMappings", i + 1);
    var handleRemoveRow =
      this.handleRemoveRow.bind(null, "dockerPortMappings", i);
    return (
      <div key={row.consecutiveKey} className={errorClassSet}>
        <fieldset className="row duplicable-row"
          onChange={handleChange}>
          <div className="col-sm-3">
            <StoreFormGroupComponent
              errorMessage={
                getErrorMessage(`dockerPortMappings.${i}.containerPort`)
              }
              fieldId={`dockerPortMappings.${i}.containerPort`}
              label="Container Port"
              value={row.containerPort}>
              <input ref={`containerPort${i}`} {...portInputAttributes}/>
            </StoreFormGroupComponent>
          </div>
          <div className="col-sm-3">
            <StoreFormGroupComponent
              errorMessage={
                getErrorMessage(`dockerPortMappings.${i}.hostPort`)
              }
              fieldId={`dockerPortMappings.${i}.hostPort`}
              label="Host Port"
              value={row.hostPort}>
              <input ref={`hostPort${i}`} {...portInputAttributes}/>
            </StoreFormGroupComponent>
          </div>
          <div className="col-sm-2">
            <StoreFormGroupComponent
              errorMessage={
                getErrorMessage(`dockerPortMappings.${i}.servicePort`)
              }
              fieldId={`dockerPortMappings.${i}.servicePort`}
              label="Service Port"
              value={row.servicePort}>
              <input ref={`servicePort${i}`} {...portInputAttributes}/>
            </StoreFormGroupComponent>
          </div>
          <div className="col-sm-4">
            <StoreFormGroupComponent
              errorMessage={
                getErrorMessage(`dockerPortMappings.${i}.protocol`)
              }
              fieldId={`dockerPortMappings.${i}.protocol`}
              label="Protocol"
              value={row.protocol}>
              <select defaultValue="" ref={`protocol${i}`}>
                <option value="" disabled="disabled">Select</option>
                <option value={ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP}>
                  {ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP}
                </option>
                <option value={ContainerConstants.PORTMAPPINGS.PROTOCOL.UDP}>
                  {ContainerConstants.PORTMAPPINGS.PROTOCOL.UDP}
                </option>
              </select>
            </StoreFormGroupComponent>
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

    var disableRemoveButton = (rows.length === 1 &&
      Util.isEmptyString(rows[0].containerPort) &&
      Util.isEmptyString(rows[0].hostPort) &&
      Util.isEmptyString(rows[0].servicePort));

    return rows.map((row, i) => {
      return this.getPortMappingRow(row, i, disableRemoveButton);
    });
  },

  getParametersRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError("dockerParameters", i);
    var errorClassSet = classNames({
      "has-error": !!error
    });
    var getErrorMessage = this.props.getErrorMessage;
    var handleChange = this.handleChangeRow.bind(null, "dockerParameters", i);
    var handleAddRow = this.handleAddRow.bind(null, "dockerParameters", i + 1);
    var handleRemoveRow =
      this.handleRemoveRow.bind(null, "dockerParameters", i);

    return (
      <div key={row.consecutiveKey} className={errorClassSet}>
        <fieldset className="row duplicable-row" onChange={handleChange}>
          <div className="col-sm-6 add-colon">
            <StoreFormGroupComponent
              errorMessage={getErrorMessage(`dockerParameters.${i}.key`)}
              fieldId={`dockerParameters.${i}.key`}
              label="Key"
              value={row.key}>
              <input ref={`key${i}`} />
            </StoreFormGroupComponent>
          </div>
          <div className="col-sm-6">
            <StoreFormGroupComponent
              errorMessage={getErrorMessage(`dockerParameters.${i}.value`)}
              fieldId={`dockerParameters.${i}.value`}
              label="Value"
              value={row.value}>
              <input ref={`value${i}`} />
            </StoreFormGroupComponent>
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
    var error = this.getError("containerVolumes", i);
    var errorClassSet = classNames({"has-error": !!error});
    var getErrorMessage = this.props.getErrorMessage;
    var handleChange = this.handleChangeRow.bind(null, "containerVolumes", i);
    var handleAddRow = this.handleAddRow.bind(null, "containerVolumes", i + 1);
    var handleRemoveRow =
      this.handleRemoveRow.bind(null, "containerVolumes", i);

    return (
      <div key={row.consecutiveKey} className={errorClassSet}>
        <fieldset className="row duplicable-row"
          onChange={handleChange}>
          <div className="col-sm-4">
            <StoreFormGroupComponent
              errorMessage={
                getErrorMessage(`containerVolumes.${i}.containerPath`)
              }
              fieldId={`containerVolumes.${i}.containerPath`}
              label="Container Path"
              value={row.containerPath}>
              <input ref={`containerPath${i}`} />
            </StoreFormGroupComponent>
          </div>
          <div className="col-sm-4">
            <StoreFormGroupComponent
              errorMessage={getErrorMessage(`containerVolumes.${i}.hostPath`)}
              fieldId={`containerVolumes.${i}.hostPath`}
              label="Host Path"
              value={row.hostPath}>
              <input ref={`hostPath${i}`} />
            </StoreFormGroupComponent>
          </div>
          <div className="col-sm-4">
            <StoreFormGroupComponent
              errorMessage={getErrorMessage(`containerVolumes.${i}.mode`)}
              fieldId={`containerVolumes.${i}.mode`}
              label="Mode"
              value={row.mode}>
              <select defaultValue="" ref={`mode${i}`}>
                <option value="" disabled="disabled">Select</option>
                <option value={ContainerConstants.VOLUMES.MODE.RO}>
                  Read Only
                </option>
                <option value={ContainerConstants.VOLUMES.MODE.RW}>
                  Read and Write
                </option>
              </select>
            </StoreFormGroupComponent>
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
      Util.isEmptyString(rows[0].mode));

    return rows.map((row, i) => {
      return this.getVolumesRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    var props = this.props;

    return (
      <div>
        <div className="row">
          <div className="col-sm-6">
            <StoreFormGroupComponent
              errorMessage={props.getErrorMessage("dockerImage")}
              fieldId="dockerImage"
              label="Image"
              value={props.fields.dockerImage}
              onChange={this.handleFieldUpdate}>
              <input />
            </StoreFormGroupComponent>
          </div>
          <div className="col-sm-6">
            <StoreFormGroupComponent
              errorMessage={props.getErrorMessage("dockerNetwork")}
              fieldId="dockerNetwork"
              label="Network"
              value={props.fields.dockerNetwork}
              onChange={this.handleFieldUpdate}>
              <select defaultValue="">
                <option value="" disabled="disabled">Select</option>
                <option value={ContainerConstants.NETWORK.HOST}>
                  Host
                </option>
                <option value={ContainerConstants.NETWORK.BRIDGE}>
                  Bridged
                </option>
              </select>
            </StoreFormGroupComponent>
          </div>
        </div>
        <h4>Privileges</h4>
        <StoreFormGroupComponent className="checkbox-form-group"
          errorMessage={props.getErrorMessage("dockerPrivileged")}
          fieldId="dockerPrivileged"
          help="Select to give this container access to all devices on the host"
          label="Extend runtime privileges to this container"
          value={props.fields.dockerPrivileged}
          onChange={this.handleFieldUpdate}>
          <input type="checkbox" />
        </StoreFormGroupComponent>
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
