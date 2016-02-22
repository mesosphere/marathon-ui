import classNames from "classnames";
import React from "react/addons";

import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormGroupComponent from "../components/FormGroupComponent";

var LocalVolumesComponent = React.createClass({
  displayName: "LocalVolumesComponent",

  propTypes: {
    errorIndices: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired
  },

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    localVolumes: {
      persistentSize: "",
      containerPath: ""
    }
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.addRow("localVolumes", position);
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow("localVolumes", position);
  },

  handleChange: function (position) {
    this.updateRow("localVolumes", position);
  },

  getVolumeRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError("localVolumes", row.consecutiveKey);

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    return (
      <div key={row.consecutiveKey} className={rowClassSet}>
        <fieldset className="row duplicable-row"
            onChange={this.handleChange.bind(null, i)}>
          <div className="col-sm-4">
            <FormGroupComponent
                fieldId={`localVolumes.persistent.size.${i}`}
                label="Size (MiB)"
                value={row.persistentSize}>
              <input ref={`persistentSize${i}`}
                type="number"/>
            </FormGroupComponent>
          </div>
          <div className="col-sm-8">
            <FormGroupComponent
                fieldId={`localVolumes.containerPath.${i}`}
                label="Container Path"
                value={row.containerPath}>
              <input ref={`containerPath${i}`} />
            </FormGroupComponent>
            <DuplicableRowControls
              disableRemoveButton={disableRemoveButton}
              handleAddRow={this.handleAddRow.bind(null, i + 1)}
              handleRemoveRow={this.handleRemoveRow.bind(null, i)} />
          </div>
        </fieldset>
        {error}
      </div>
    );
  },

  getVolumesRows: function () {
    var rows = this.state.rows.localVolumes;
    if (rows == null) {
      return (
        <button type="button">
          Add a persistent local volume
        </button>
      );
    }

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow(
      "localVolumes"
    );

    return rows.map((row, i) => {
      return this.getVolumeRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    return (
      <div>
        <h4>
          Persistent Local Volumes
        </h4>
        <div className="duplicable-list">
          {this.getVolumesRows()}
        </div>
        {this.getGeneralErrorBlock("localVolumes")}
      </div>
    );
  }
});

export default LocalVolumesComponent;
