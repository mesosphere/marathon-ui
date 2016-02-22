import classNames from "classnames";
import React from "react/addons";

import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormGroupComponent from "../components/FormGroupComponent";

import ContainerConstants from "../constants/ContainerConstants";

var ContainerVolumesComponent = React.createClass({
  displayName: "ContainerVolumesComponent",

  propTypes: {
    fields: React.PropTypes.object.isRequired
  },

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    containerVolumes: {
      hostPath: "",
      containerPath: "",
      mode: null
    }
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.addRow("containerVolumes", position);
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow("containerVolumes", position);
  },

  handleChangeVolumesLocal: function (position) {
    this.updateRow("containerVolumes", position);
  },

  handleChangeContainerVolumes: function (position) {
    this.updateRow("containerVolumes", position);
  },

  getDockerVolumeRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError("containerVolumes", row.consecutiveKey);

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    return (
      <div key={row.consecutiveKey} className={rowClassSet}>
        <fieldset className="row duplicable-row"
            onChange={this.handleChangeContainerVolumes.bind(null, i)}>
          <div className="col-sm-4">
            <FormGroupComponent
                fieldId={`containerVolumes.${i}.containerPath`}
                label="Container Path"
                value={row.containerPath}>
              <input ref={`containerPath${i}`} />
            </FormGroupComponent>
          </div>
          <div className="col-sm-4">
            <FormGroupComponent
                fieldId={`containerVolumes.${i}.hostPath`}
                label="Host Path"
                value={row.hostPath}>
              <input ref={`hostPath${i}`} />
            </FormGroupComponent>
          </div>
          <div className="col-sm-4">
            <FormGroupComponent
                fieldId={`containerVolumes.${i}.mode`}
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
              handleAddRow={this.handleAddRow.bind(null, i + 1)}
              handleRemoveRow={this.handleRemoveRow.bind(null, i)} />
          </div>
        </fieldset>
        {error}
      </div>
    );
  },

  getDockerVolumesRows: function () {
    var rows = this.state.rows.containerVolumes;

    if (rows == null) {
      return (
        <button type="button" className="btn btn-default">
          Add Docker Volume
        </button>
      );
    }

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow(
      "containerVolumes"
    );

    return rows.map((row, i) => {
      return this.getDockerVolumeRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    var dockerImage = this.props.fields.dockerImage;

    if (dockerImage == null || dockerImage === "") {
      return null;
    }

    return (
      <div>
        <h4>
          Docker Container Volumes
        </h4>
        <div className="duplicable-list">
          {this.getDockerVolumesRows()}
        </div>
        {this.getGeneralErrorBlock("containerVolumes")}
      </div>
    );
  }
});

export default ContainerVolumesComponent;
