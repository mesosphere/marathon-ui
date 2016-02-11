import classNames from "classnames";
import React from "react/addons";

import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormGroupComponent from "../components/FormGroupComponent";

var OptionalVolumesComponent = React.createClass({
  displayName: "OptionalVolumesComponent",

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    containerVolumesLocal: {
      persistentSize: "",
      containerPath: ""
    }
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.addRow("containerVolumesLocal", position);
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow("containerVolumesLocal", position);
  },

  handleChange: function (position) {
    this.updateRow("containerVolumesLocal", position);
  },

  getVolumeRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError("containerVolumesLocal", row.consecutiveKey);
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
                fieldId={`containerVolumesLocal.persistent.size.${i}`}
                label="Size (MiB)"
                value={row.persistentSize}>
              <input ref={`persistentSize${i}`}
                type="number"/>
            </FormGroupComponent>
          </div>
          <div className="col-sm-8">
            <FormGroupComponent
              fieldId={`containerVolumesLocal.containerPath.${i}`}
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
    var rows = this.state.rows.containerVolumesLocal;
    if (rows == null) {
      return (
        <button type="button">
          Add a persistent local volume
        </button>
      );
    }

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow(
      "containerVolumesLocal"
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
        {this.getGeneralErrorBlock("containerVolumesLocal")}
      </div>
    );
  }
});

export default OptionalVolumesComponent;
