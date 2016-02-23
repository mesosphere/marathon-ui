import classNames from "classnames";
import React from "react/addons";

import ContainerConstants from "../constants/ContainerConstants";
import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormGroupComponent from "../components/FormGroupComponent";
import PortInputAttributes from "../constants/PortInputAttributes";

const fieldsetId = "portDefinitions";

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

  getPortDefinitionRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError(fieldsetId, row.consecutiveKey);

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
      </div>
    );
  }
});

export default OptionalPortsAndServiceDiscoveryComponent;
