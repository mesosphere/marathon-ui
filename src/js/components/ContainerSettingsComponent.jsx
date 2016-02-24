import classNames from "classnames";
import React from "react/addons";

import ContainerConstants from "../constants/ContainerConstants";
import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import dockerRowSchemes from "../stores/schemes/dockerRowSchemes";
import FormActions from "../actions/FormActions";
import FormGroupComponent from "../components/FormGroupComponent";
import PortInputAttributes from "../constants/PortInputAttributes";

var ContainerSettingsComponent = React.createClass({
  displayName: "ContainerSettingsComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: dockerRowSchemes,

  statics: {
    fieldIds: Object.freeze({
      dockerForcePullImage: "dockerForcePullImage",
      dockerImage: "dockerImage",
      dockerNetwork: "dockerNetwork",
      dockerParameters: "dockerParameters",
      dockerPortMappings: "dockerPortMappings",
      dockerPrivileged: "dockerPrivileged"
    })
  },

  propTypes: {
    fields: React.PropTypes.object.isRequired,
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

  handleSingleFieldUpdate: function (fieldId, value) {
    FormActions.update(fieldId, value);
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
        <fieldset className="row duplicable-row" onChange={handleChange}>
          <div className="col-sm-3">
            <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.containerPort`)
                }
                fieldId={`${fieldsetId}.${i}.containerPort`}
                label="Container Port"
                value={row.containerPort}>
              <input ref={`containerPort${i}`} {...PortInputAttributes}/>
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
              <input ref={`hostPort${i}`} {...PortInputAttributes}/>
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
              <input ref={`servicePort${i}`} {...PortInputAttributes}/>
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

    let disableRemoveButton =
      this.hasOnlyOneSingleEmptyRow("dockerPortMappings");

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

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow("dockerParameters");

    return rows.map((row, i) => {
      return this.getParametersRow(row, i, disableRemoveButton);
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
                onChange={this.handleSingleFieldUpdate}>
              <input />
            </FormGroupComponent>
          </div>
          <div className="col-sm-6">
            <FormGroupComponent
                errorMessage={props.getErrorMessage(fieldIds.dockerNetwork)}
                fieldId={fieldIds.dockerNetwork}
                label="Network"
                value={props.fields[fieldIds.dockerNetwork]}
                onChange={this.handleSingleFieldUpdate}>
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
        <h4>Force Pull Image</h4>
        <FormGroupComponent className="checkbox-form-group"
            errorMessage={props.getErrorMessage(fieldIds.dockerForcePullImage)}
            fieldId={fieldIds.dockerForcePullImage}
            help="Force Docker to pull the image before launching each task"
            label="Pull image on every launch"
            value={props.fields[fieldIds.dockerForcePullImage]}
            onChange={this.handleSingleFieldUpdate}>
          <input type="checkbox" />
        </FormGroupComponent>
        <h4>Privileges</h4>
        <FormGroupComponent className="checkbox-form-group"
            errorMessage={props.getErrorMessage(fieldIds.dockerPrivileged)}
            fieldId={fieldIds.dockerPrivileged}
            help={"Select to give this container access to all devices " +
              "on the host"}
            label="Extend runtime privileges to this container"
            value={props.fields[fieldIds.dockerPrivileged]}
            onChange={this.handleSingleFieldUpdate}>
          <input type="checkbox" />
        </FormGroupComponent>
        <h4>Port Mappings</h4>
        <div className="duplicable-list">{this.getPortMappingRows()}</div>
        <h4>Parameters</h4>
        <div className="duplicable-list">{this.getParametersRows()}</div>
        <div>You can set your Docker volume settings below.</div>
      </div>
    );
  }
});

export default ContainerSettingsComponent;
