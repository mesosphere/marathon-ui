import classNames from "classnames";
import React from "react/addons";

import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormGroupComponent from "../components/FormGroupComponent";
import TooltipComponent from "../components/TooltipComponent";

import ExternalLinks from "../constants/ExternalLinks";

var ExternalVolumesComponent = React.createClass({
  displayName: "ExternalVolumesComponent",

  propTypes: {
    errorIndices: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired
  },

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    externalVolumes: {
      externalName: "",
      containerPath: ""
    }
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.addRow("externalVolumes", position);
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow("externalVolumes", position);
  },

  handleChange: function (position) {
    this.updateRow("externalVolumes", position);
  },

  getVolumeRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError("externalVolumes", row.consecutiveKey);

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    var containerPathTooltipMessage = (
      <span>
        Specifies where the volume is mounted inside the container.
        See the
          <a href={ExternalLinks.REXRAY_DOCS} target="_blank">
            REX-Ray documentation
          </a> on data directories for more information.
      </span>
    );

    var containerPathLabel = (
      <span>
        Container Path
        <TooltipComponent className="right"
            message={containerPathTooltipMessage}>
          <i className="icon icon-xs help" />
        </TooltipComponent>
      </span>
    );

    return (
      <div key={row.consecutiveKey} className={rowClassSet}>
        <fieldset className="row duplicable-row"
            onChange={this.handleChange.bind(null, i)}>
          <div className="col-sm-4">
            <FormGroupComponent
                fieldId={`externalVolumes.external.name.${i}`}
                label="Volume Name"
                value={row.externalName}>
              <input ref={`externalName${i}`}/>
            </FormGroupComponent>
          </div>
          <div className="col-sm-8">
            <FormGroupComponent
                fieldId={`externalVolumes.containerPath.${i}`}
                label={containerPathLabel}
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
    var rows = this.state.rows.externalVolumes;
    if (rows == null) {
      return (
        <button type="button">
          Add a network volume
        </button>
      );
    }

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow(
      "externalVolumes"
    );

    return rows.map((row, i) => {
      return this.getVolumeRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    var externalVolumesTooltipMessage = (
      <span>
        External persistent storage functionality is considered beta,
        so use this feature at your own risk.
        <a href={ExternalLinks.EXTERNAL_VOLUMES} target="_blank">Read more</a>.
      </span>
    );

    return (
      <div>
        <h4 className="subtitle">
          External Volumes
          <TooltipComponent className="right"
              message={externalVolumesTooltipMessage}>
            <i className="icon icon-xs help" />
          </TooltipComponent>
        </h4>
        <div className="duplicable-list">
          {this.getVolumesRows()}
        </div>
        {this.getGeneralErrorBlock("externalVolumes")}
      </div>
    );
  }
});

export default ExternalVolumesComponent;
