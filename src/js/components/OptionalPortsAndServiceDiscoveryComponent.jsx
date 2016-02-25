import classNames from "classnames";
import React from "react/addons";

import ContainerConstants from "../constants/ContainerConstants";
import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormGroupComponent from "../components/FormGroupComponent";
import PortInputAttributes from "../constants/PortInputAttributes";

const fieldsetId = "portDefinitions";

function determinePortDefinitionsType(fields) {
  if (fields.dockerNetwork === ContainerConstants.NETWORK.BRIDGE) {
    return ContainerConstants.NETWORK.BRIDGE;
  }

  if ((fields.dockerImage != null && fields.dockerImage !== "") ||
      fields.dockerNetwork === ContainerConstants.NETWORK.HOST) {
    return ContainerConstants.NETWORK.HOST;
  }

  return ContainerConstants.TYPE.MESOS;
}

var OptionalPortsAndServiceDiscoveryComponent = React.createClass({
  displayName: "OptionalPortsAndServiceDiscoveryComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    portDefinitions: {
      port: "",
      protocol: "",
      name: ""
    }
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

  getHelpText: function () {
    var rows = this.state.rows[fieldsetId];

    if (rows == null || this.hasOnlyOneSingleEmptyRow(fieldsetId)) {
      return null;
    }

    let type = determinePortDefinitionsType(this.props.fields);

    let rowsLength = rows.length;

    let portIdentifiers = Array(rowsLength)
      .fill()
      .map((_, i) => "$PORT" + i)
      .join(", ")
      .replace(/(.*), (.*)$/, "$1 and $2");

    let message = "Your application will need to be configured to listen to" +
      ` ${portIdentifiers} which will be assigned dynamically.`;

    if (type === ContainerConstants.NETWORK.HOST) {
      message = "Your Docker container will need to be configured to listen" +
        ` to ${portIdentifiers} which will be assigned dynamically.`;
    } else if (type === ContainerConstants.NETWORK.BRIDGE) {
      message = "Your Docker container will bind to the requested ports and" +
        ` they will be dynamically mapped to ${portIdentifiers} on the host.`;
    }

    return <div>{message}</div>;
  },

  getPortDefinitionRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError(fieldsetId, row.consecutiveKey);
    var getErrorMessage = this.props.getErrorMessage;

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    return (
      <div key={row.consecutiveKey} className={rowClassSet}>
        <fieldset className="row duplicable-row"
            onChange={this.handleChangeRow.bind(null, fieldsetId, i)}>
          <div className="col-sm-3">
            <FormGroupComponent
                fieldId={`${fieldsetId}.${i}.port`}
                label="Port"
                value={row.port}>
              <input ref={`port${i}`} {...PortInputAttributes} />
            </FormGroupComponent>
          </div>
          <div className="col-sm-3">
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
          </div>
          <div className="col-sm-6">
            <FormGroupComponent
                fieldId={`${fieldsetId}.${i}.name`}
                label="Name"
                value={row.name}>
              <input ref={`name${i}`} />
            </FormGroupComponent>
            <DuplicableRowControls
              disableRemoveButton={disableRemoveButton}
              handleAddRow={this.handleAddRow.bind(null, fieldsetId, i + 1)}
              handleRemoveRow=
                {this.handleRemoveRow.bind(null, fieldsetId, i)} />
          </div>
        </fieldset>
        {error}
      </div>
    );
  },

  getPortDefinitionRows: function () {
    var rows = this.state.rows[fieldsetId];

    if (rows == null) {
      return null;
    }

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow(fieldsetId);

    return rows.map((row, i) => {
      return this.getPortDefinitionRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    return (
      <div>
        <div className="duplicable-list">
          {this.getPortDefinitionRows()}
        </div>
        {this.getGeneralErrorBlock(fieldsetId)}
        {this.getHelpText()}
      </div>
    );
  }
});

export default OptionalPortsAndServiceDiscoveryComponent;
