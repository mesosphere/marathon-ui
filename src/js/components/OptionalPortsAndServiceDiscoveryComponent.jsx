import classNames from "classnames";
import React from "react/addons";

import ContainerConstants from "../constants/ContainerConstants";
import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormActions from "../actions/FormActions";
import FormGroupComponent from "../components/FormGroupComponent";
import PortInputAttributes from "../constants/PortInputAttributes";

import Util from "../helpers/Util";

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

function isTooComplexStructure(fields) {
  return fields.portDefinitions.some(portDefinition => {
    return !!Object.keys(portDefinition.labels).length;
  });
}

var OptionalPortsAndServiceDiscoveryComponent = React.createClass({
  displayName: "OptionalPortsAndServiceDiscoveryComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    portDefinitions: {
      port: null,
      protocol: ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP,
      name: null,
      isRandomPort: true
    }
  },

  propTypes: {
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired,
    handleModeToggle: React.PropTypes.func.isRequired
  },

  handleAddRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();

    var type = determinePortDefinitionsType(this.props.fields);
    var isBridgeNetwork = type === ContainerConstants.NETWORK.BRIDGE;

    var scheme = Util.extendObject(this.duplicableRowsScheme[fieldId], {
      consecutiveKey: Util.getNewConsecutiveKey()
    });

    if (isBridgeNetwork) {
      scheme.isRandomPort = false;
    }

    FormActions.insert(fieldId,
      scheme,
      position
    );
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

    var partialRandomText = !rows.every(row => row.isRandomPort)
      ? "partial "
      : "";

    var dynamicPortText = !rows.every(row => !row.isRandomPort)
      ? ` which will be assigned ${partialRandomText}dynamically`
      : "";

    var type = determinePortDefinitionsType(this.props.fields);

    var portIdentifiers = Array(rows.length)
      .fill()
      .map((_, i) => "$PORT" + i)
      .join(", ")
      .replace(/(.*), (.*)$/, "$1 and $2");

    var message = "Your application will need to be configured to listen to" +
      ` ${portIdentifiers}${dynamicPortText}.`;

    if (type === ContainerConstants.NETWORK.HOST) {
      message = "Your Docker container will need to be configured to listen" +
        ` to ${portIdentifiers}${dynamicPortText}.`;
    } else if (type === ContainerConstants.NETWORK.BRIDGE) {
      message = "Your Docker container will bind to the requested ports and" +
        ` they will be dynamically mapped to ${portIdentifiers} on the host.`;
    }

    return <div>{message}</div>;
  },

  getRandomPortCheckbox: function (row, i, hidden = false) {
    var classSet = classNames({
      "hidden": hidden,
    }, "checkbox-form-group port-input-field");

    var value = hidden
      ? false
      : row.isRandomPort;

    return (
      <FormGroupComponent className={classSet}
          fieldId={`${fieldsetId}.${i}.isRandomPort`}
          label="Assign a random port"
          value={value}>
        <input ref={`isRandomPort${i}`} type="checkbox" />
      </FormGroupComponent>
    );
  },

  getPortInputField: function (row, i) {
    var type = determinePortDefinitionsType(this.props.fields);
    var isBridgeNetwork = type === ContainerConstants.NETWORK.BRIDGE;

    var fieldLabel = isBridgeNetwork
      ? "Container Port"
      : "Port";

    var randomPortField = null;

    if (!isBridgeNetwork && row.isRandomPort) {
      randomPortField = (
        <FormGroupComponent
            label={fieldLabel}
            value={"$PORT" + i}>
          <input disabled={true} />
        </FormGroupComponent>
      );
    }

    let portFieldClassSet = classNames({
      "hidden": !!randomPortField
    });

    return (
      <div className="col-sm-4">
        <FormGroupComponent className={portFieldClassSet}
            fieldId={`${fieldsetId}.${i}.port`}
            label={fieldLabel}
            value={row.port}>
          <input ref={`port${i}`} {...PortInputAttributes} />
        </FormGroupComponent>
        {randomPortField}
        {this.getRandomPortCheckbox(row, i, isBridgeNetwork)}
      </div>
    );
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
          {this.getPortInputField(row, i)}
          <div className="col-sm-2">
            <FormGroupComponent
                errorMessage={
                  getErrorMessage(`${fieldsetId}.${i}.protocol`)
                }
                fieldId={`${fieldsetId}.${i}.protocol`}
                label="Protocol"
                value={row.protocol}>
              <select defaultValue={row.protocol} ref={`protocol${i}`}>
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

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow(fieldsetId,
      ["protocol", "isRandomPort"]);

    return rows.map((row, i) => {
      return this.getPortDefinitionRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    if (isTooComplexStructure(this.props.fields)) {
      return (
        <div>
          Looks like your ports & service discovery configuration is a little
          bit too sophisticated for our form to handle.
          Please switch
          to <a className="json-link clickable"
            onClick={this.props.handleModeToggle}>JSON mode</a> if
          you want to view or modify.
        </div>
      );
    }

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
