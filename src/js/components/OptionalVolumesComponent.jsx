import classNames from "classnames";
import React from "react/addons";

import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormGroupComponent from "../components/FormGroupComponent";

var OptionalVolumesComponent = React.createClass({
  displayName: "OptionalVolumesComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    volumes: {
      size: "",
      path: ""
    }
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.addRow("volumes", position);
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow("volumes", position);
  },

  handleChange: function (position) {
    this.updateRow("volumes", position);
  },

  getVolumeRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError("volumes", row.consecutiveKey);
    // var handleChange = this.handleChangeRow.bind(null, fieldsetId, i);

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
                fieldId={`volumes.size.${i}`}
                label="Size (MiB)"
                value={row.size}>
              <input ref={`size${i}`}
                type="number"/>
            </FormGroupComponent>
          </div>
          <div className="col-sm-8">
            <FormGroupComponent
              fieldId={`volumes.path.${i}`}
              label="Container Path"
              value={row.path}>
              <input ref={`path${i}`} />
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
    var rows = this.state.rows.volumes;
    if (rows == null) {
      return (
        <button type="button">
          Add a persistent local volume
        </button>
      );
    }
    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow("volumes");

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
        {this.getGeneralErrorBlock("volumes")}
      </div>
    );
  }
});

export default OptionalVolumesComponent;
