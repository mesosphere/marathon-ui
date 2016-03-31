import classNames from "classnames";
import React from "react/addons";

import ContainerConstants from "../constants/ContainerConstants";
import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormActions from "../actions/FormActions";
import FormGroupComponent from "../components/FormGroupComponent";
import PortInputAttributes from "../constants/PortInputAttributes";
import PluginComponentStore from "../stores/PluginComponentStore";
import PluginMountPointComponent from "../components/PluginMountPointComponent";
import PluginMountPoints from "../plugin/shared/PluginMountPoints";
import TooltipComponent from "../components/TooltipComponent";
import ExternalLinks from "../constants/ExternalLinks";

import Util from "../helpers/Util";

const fieldsetId = "portDefinitions";

function isBridgeNetworkMode(fields) {
  if (fields.dockerNetwork === ContainerConstants.NETWORK.BRIDGE) {
    return true;
  }
  return false;
}

function hasDockerImage(fields) {
  return fields.dockerImage != null && fields.dockerImage !== "";
}

function isTooComplexStructure(fields, hasVIP = false) {
  return fields.portDefinitions != null &&
      fields.portDefinitions.some(portDefinition => {
        if (!hasVIP && portDefinition.vip != null) {
          return true;
        }

        if (portDefinition.labels != null) {
          let labels = Object.assign({}, portDefinition.labels);
          if (hasVIP) {
            delete labels["VIP_0"];
          }
          return !!Object.keys(labels).length;
        }
        return false;
      }
    );
}

var OptionalPortsAndServiceDiscoveryComponent = React.createClass({
  displayName: "OptionalPortsAndServiceDiscoveryComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    portDefinitions: {
      port: null,
      protocol: ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP,
      name: null,
      labels: null,
      vip: null,
      isRandomPort: true
    }
  },

  propTypes: {
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired,
    handleModeToggle: React.PropTypes.func.isRequired,
    hasVIP: React.PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      hasVIP: false
    };
  },

  handleAddRow: function (fieldId, position, event) {
    event.target.blur();
    event.preventDefault();

    var row = Util.extendObject(this.duplicableRowsScheme[fieldId], {
      consecutiveKey: Util.getNewConsecutiveKey()
    });

    row.isRandomPort = !isBridgeNetworkMode(this.props.fields);

    FormActions.insert(fieldId,
      row,
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

    if (rows == null) {
      return null;
    }

    var partialRandomText = !rows.every(row => row.isRandomPort)
      ? "partially "
      : "";

    var dynamicPortText = !rows.every(row => !row.isRandomPort)
      ? ` which will be ${partialRandomText}assigned dynamically`
      : "";

    var portIdentifiers = Array(rows.length)
      .fill()
      .map((_, i) => "$PORT" + i)
      .join(", ")
      .replace(/(.*), (.*)$/, "$1 and $2");

    var helpText = "Configure your application to listen to" +
      ` ${portIdentifiers}${dynamicPortText}.`;

    if (!isBridgeNetworkMode(this.props.fields)) {
      helpText = "Your Docker container will bind to the requested ports and" +
        ` they will be dynamically mapped to ${portIdentifiers} on the host.`;
    } else if (hasDockerImage(this.props.fields)) {
      helpText = "Configure your Docker container to listen" +
        ` to ${portIdentifiers}${dynamicPortText}.`;
    }

    return <div>{helpText}</div>;
  },

  getPortInputField: function (row, i) {
    var props = this.props;
    var isBridgeNetwork = isBridgeNetworkMode(props.fields);

    var fieldLabelText = isBridgeNetwork
      ? "Container Port"
      : "Port";

    var randomPortField = null;

    var fieldTooltipMessage = (
      <span>
        Enter the port you want to assign to your
        VIP. <a href={ExternalLinks.PORTS} target="_blank">Read more</a>.
      </span>
    );

    var fieldLabel = (
      <span>
        {fieldLabelText}
        <TooltipComponent className="right"
            message={fieldTooltipMessage}>
          <i className="icon icon-xs help" />
        </TooltipComponent>
      </span>
    );

    if (!isBridgeNetwork) {
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

    var className = props.hasVIP
      ? "col-sm-3"
      : "col-sm-4";

    return (
      <div className={className}>
        <FormGroupComponent className={portFieldClassSet}
            fieldId={`${fieldsetId}.${i}.port`}
            label={fieldLabel}
            value={row.port}>
          <input ref={`port${i}`} {...PortInputAttributes} />
        </FormGroupComponent>
        {randomPortField}
      </div>
    );
  },

  getVIPField: function (row, i, disableRemoveButton) {
    if (!this.props.hasVIP) {
      return null;
    }

    return (
      <div className="col-sm-5">
        <FormGroupComponent
            fieldId={`${fieldsetId}.${i}.vip`}
            label="VIP"
            value={row.vip}>
          <input ref={`vip${i}`} />
        </FormGroupComponent>
        <DuplicableRowControls
          disableRemoveButton={disableRemoveButton}
          handleAddRow={this.handleAddRow.bind(null, fieldsetId, i + 1)}
          handleRemoveRow=
            {this.handleRemoveRow.bind(null, fieldsetId, i)} />
      </div>
    );
  },

  getPortDefinitionRow: function (row, i, disableRemoveButton = false) {
    var props = this.props;
    var error = this.getError(fieldsetId, row.consecutiveKey);
    var getErrorMessage = props.getErrorMessage;

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    var nameFieldButtons = (
      <DuplicableRowControls
        disableRemoveButton={disableRemoveButton}
        handleAddRow={this.handleAddRow.bind(null, fieldsetId, i + 1)}
        handleRemoveRow={this.handleRemoveRow.bind(null, fieldsetId, i)} />
    );

    var nameFieldClassName = "col-sm-6";

    if (props.hasVIP) {
      nameFieldButtons = null;
      nameFieldClassName = "col-sm-2";
    }

    return (
      <div key={row.consecutiveKey+i} className={rowClassSet}>
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
          <div className={nameFieldClassName}>
            <FormGroupComponent
                fieldId={`${fieldsetId}.${i}.name`}
                label="Name"
                value={row.name}>
              <input ref={`name${i}`} />
            </FormGroupComponent>
            {nameFieldButtons}
          </div>
          {this.getVIPField(row, i, disableRemoveButton)}
        </fieldset>
        {error}
      </div>
    );
  },

  getPortDefinitionRows: function (hasPluginComponent = false) {
    if (hasPluginComponent) {
      return (
        <PluginMountPointComponent
          placeId={PluginMountPoints.OPTIONAL_PORTS_AND_SERVICE_DISCOVERY} />
      );
    }

    let rows = this.state.rows[fieldsetId];

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
    var props = this.props;

    var hasPluginComponent = PluginComponentStore.hasComponentAtPlaceId(
      PluginMountPoints.OPTIONAL_PORTS_AND_SERVICE_DISCOVERY
    );

    if (!hasPluginComponent &&
        isTooComplexStructure(props.fields, props.hasVIP)) {
      return (
        <div>
          Switch to <a
              className="json-link clickable"
              onClick={this.props.handleModeToggle}>
            JSON mode
          </a> to make advanced port and service discovery configuration
          changes.
        </div>
      );
    }

    return (
      <div>
        <div className="duplicable-list">
          {this.getPortDefinitionRows(hasPluginComponent)}
        </div>
        {this.getGeneralErrorBlock(fieldsetId)}
        {this.getHelpText()}
      </div>
    );
  }
});

export default OptionalPortsAndServiceDiscoveryComponent;
