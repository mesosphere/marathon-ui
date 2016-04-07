import classNames from "classnames";
import React from "react/addons";

import DuplicableRowControls from "../components/DuplicableRowControls";
import DuplicableRowsMixin from "../mixins/DuplicableRowsMixin";
import FormGroupComponent from "../components/FormGroupComponent";
import TooltipComponent from "../components/TooltipComponent";

import ExternalLinks from "../constants/ExternalLinks";

var NetworkVolumesComponent = React.createClass({
  displayName: "NetworkVolumesComponent",

  propTypes: {
    errorIndices: React.PropTypes.object.isRequired,
    fields: React.PropTypes.object.isRequired,
    getErrorMessage: React.PropTypes.func.isRequired
  },

  mixins: [DuplicableRowsMixin],

  duplicableRowsScheme: {
    networkVolumes: {
      networkName: "",
      containerPath: ""
    }
  },

  handleAddRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.addRow("networkVolumes", position);
  },

  handleRemoveRow: function (position, event) {
    event.target.blur();
    event.preventDefault();

    this.removeRow("networkVolumes", position);
  },

  handleChange: function (position) {
    this.updateRow("networkVolumes", position);
  },

  getVolumeRow: function (row, i, disableRemoveButton = false) {
    var error = this.getError("networkVolumes", row.consecutiveKey);

    var rowClassSet = classNames({
      "has-error": !!error,
      "duplicable-row": true
    });

    var containerPathTooltipMessage = (
      <span>
        The path to the directory where your application will
        read and write data. The path must be non-nested and
        cannot contain slashes, e.g. `data`, but not
        `../../../etc/opt` or `/user/data/`.
        <a href={ExternalLinks.CONTAINER_PATH} target="_blank">Read more</a>.
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
                fieldId={`networkVolumes.external.name.${i}`}
                label="Volume Name"
                value={row.networkName}>
              <input ref={`networkName${i}`}/>
            </FormGroupComponent>
          </div>
          <div className="col-sm-8">
            <FormGroupComponent
                fieldId={`networkVolumes.containerPath.${i}`}
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
    var rows = this.state.rows.networkVolumes;
    if (rows == null) {
      return (
        <button type="button">
          Add a network volume
        </button>
      );
    }

    let disableRemoveButton = this.hasOnlyOneSingleEmptyRow(
      "networkVolumes"
    );

    return rows.map((row, i) => {
      return this.getVolumeRow(row, i, disableRemoveButton);
    });
  },

  render: function () {
    var networkVolumesTooltipMessage = (
      <span>
        Local volumes retain data if an
        application terminates.
        <a href={ExternalLinks.NETWORK_VOLUMES} target="_blank">Read more</a>.
      </span>
    );

    return (
      <div>
        <h4 className="subtitle">
          Network Volumes
          <TooltipComponent className="right"
              message={networkVolumesTooltipMessage}>
            <i className="icon icon-xs help" />
          </TooltipComponent>
        </h4>
        <div className="duplicable-list">
          {this.getVolumesRows()}
        </div>
        {this.getGeneralErrorBlock("networkVolumes")}
      </div>
    );
  }
});

export default NetworkVolumesComponent;
