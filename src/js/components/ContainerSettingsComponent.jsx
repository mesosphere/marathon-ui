var React = require("react/addons");

var appValidator = require("../validators/appValidator");
var ContainerConstants = require("../constants/ContainerConstants");
var DuplicableRowControls = require("../components/DuplicableRowControls");
var FormGroupComponent = require("../components/FormGroupComponent");

var ContainerSettingsComponent = React.createClass({
  displayName: "ContainerSettingsComponent",

  propTypes: {
    errors: React.PropTypes.array,
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      rows: {
        portMappings: [true],
        parameters: [true],
        volumes: [true]
      }
    };
  },

  handleAddRow: function (rowKey, position, event) {
    event.target.blur();
    event.preventDefault();
    var rows = React.addons.update(
      this.state.rows, {[rowKey]: {$push: [true]}}
    );
    this.setState({rows: rows});
  },

  handleRemoveRow: function (rowKey, position, event) {
    /* Each array represents a list of duplicable rows, in order to keep track
     * of which rows have been deleted by the user. A value of false signifies
     * a deleted row.
     * The form submits values infered directly from the DOM.
     */
    event.target.blur();
    event.preventDefault();
    var rows = React.addons.update(
      this.state.rows, {[rowKey]: {[position]: {$set: false}}}
    );
    if (rows[rowKey].filter((exists) => exists).length === 0) {
      rows[rowKey].push(true);
    }
    this.setState({rows: rows});
  },

  getPortMappingRow: function (i = 0) {
    return (
      <div key={`pm-${i}`} className="row duplicable-row">
        <div className="col-sm-3">
          <FormGroupComponent
            attribute={`container.docker.portMappings[${i}].containerPort`}
            label="Container Port"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <input type="number" step="1" min="0" max="65535"/>
          </FormGroupComponent>
        </div>
        <div className="col-sm-3">
          <FormGroupComponent
            attribute={`container.docker.portMappings[${i}].hostPort`}
            label="Host Port"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <input type="number" step="1" min="0" max="65535"/>
          </FormGroupComponent>
        </div>
        <div className="col-sm-3">
          <FormGroupComponent
            attribute={`container.docker.portMappings[${i}].servicePort`}
            label="Service Port"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <input type="number" step="1" min="0" max="65535"/>
          </FormGroupComponent>
        </div>
        <div className="col-sm-3">
          <FormGroupComponent
            attribute={`container.docker.portMappings[${i}].protocol`}
            label="Protocol"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <select>
              <option value="" disabled="disabled" selected="selected">Select</option>
              <option value={ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP}>
                          {ContainerConstants.PORTMAPPINGS.PROTOCOL.TCP}
              </option>
              <option value={ContainerConstants.PORTMAPPINGS.PROTOCOL.UDP}>
                          {ContainerConstants.PORTMAPPINGS.PROTOCOL.UDP}
              </option>
            </select>
          </FormGroupComponent>
          <DuplicableRowControls
            handleAddRow={this.handleAddRow.bind(null, "portMappings", i)}
            handleRemoveRow={this.handleRemoveRow.bind(null, "portMappings", i)} />
        </div>
      </div>
    );
  },

  getParameterRow: function (i = 0) {
    return (
      <div key={`p-${i}`} className="row duplicable-row">
        <div className="col-sm-6 add-colon">
          <FormGroupComponent
            attribute={`container.parameters[${i}].key`}
            label="Key"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <input />
          </FormGroupComponent>
        </div>
        <div className="col-sm-6">
          <FormGroupComponent
            attribute={`container.parameters[${i}].value`}
            label="Value"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <input />
          </FormGroupComponent>
          <DuplicableRowControls
            handleAddRow={this.handleAddRow.bind(null, "parameters", i)}
            handleRemoveRow={this.handleRemoveRow.bind(null, "parameters", i)} />
        </div>
      </div>
    );
  },

  getVolumeRow: function (i = 0) {
    return (
      <div key={`v-${i}`} className="row duplicable-row">
        <div className="col-sm-4">
          <FormGroupComponent
            attribute={`container.volumes[${i}].containerPath`}
            label="Container path"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <input />
          </FormGroupComponent>
        </div>
        <div className="col-sm-4">
          <FormGroupComponent
            attribute={`container.volumes[${i}].hostPath`}
            label="Host path"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <input />
          </FormGroupComponent>
        </div>
        <div className="col-sm-4">
          <FormGroupComponent
            attribute={`container.volumes[${i}].mode`}
            label="Mode"
            model={this.props.model}
            errors={this.props.errors}
            validator={appValidator}>
            <select>
              <option value="" disabled="disabled" selected="selected">Select</option>
              <option value={ContainerConstants.VOLUMES.MODE.RO}>
                Read Only
              </option>
              <option value={ContainerConstants.VOLUMES.MODE.RW}>
                Read and Write
              </option>
            </select>
          </FormGroupComponent>
          <DuplicableRowControls
            handleAddRow={this.handleAddRow.bind(null, "volumes", i)}
            handleRemoveRow={this.handleRemoveRow.bind(null, "volumes", i)} />
        </div>
      </div>
    );
  },

  render: function () {
    var model = this.props.model;
    var errors = this.props.errors;

    var portMappingRows = this.state.rows.portMappings
      .map(function (exists, index) {
        return exists
          ? this.getPortMappingRow(index)
          : null;
      }.bind(this));

    var parameterRows = this.state.rows.parameters
      .map(function (exists, index) {
        return exists
          ? this.getParameterRow(index)
          : null;
      }.bind(this));

    var volumeRows = this.state.rows.volumes.map(function (exists, index) {
      return exists
        ? this.getVolumeRow(index)
        : null;
    }.bind(this));

    return (
      <div>
        <div className="row">
          <div className="col-sm-6">
            <FormGroupComponent
              attribute="container.docker.image"
              label="Image"
              model={model}
              errors={errors}
              validator={appValidator}>
              <input />
            </FormGroupComponent>
          </div>
          <div className="col-sm-6">
            <FormGroupComponent
              attribute="container.docker.network"
              label="Network"
              model={model}
              errors={errors}
              validator={appValidator}>
              <select>
                <option value="" disabled="disabled" selected="selected">Select</option>
                <option value={ContainerConstants.NETWORK.HOST}>
                    {ContainerConstants.NETWORK.HOST}
                </option>
                <option value={ContainerConstants.NETWORK.BRIDGED}>
                    {ContainerConstants.NETWORK.BRIDGED}
                </option>
              </select>
            </FormGroupComponent>
          </div>
        </div>
        <h4>Privileges</h4>
        <FormGroupComponent
          attribute="container.docker.privileged"
          className="checkbox-form-group"
          label="Extend runtime privileges to this container"
          help="Select to give this container access to all devices on the host"
          model={model}
          errors={errors}
          validator={appValidator}>
          <input type="checkbox" />
        </FormGroupComponent>
        <h4>Port Mappings</h4>
        <div className="duplicable-list">
            {portMappingRows}
        </div>
        <h4>Parameters</h4>
        <div className="duplicable-list">
            {parameterRows}
        </div>
        <h4>Volumes</h4>
        <div className="duplicable-list">
            {volumeRows}
        </div>
      </div>
    );
  }
});

module.exports = ContainerSettingsComponent;
