import classNames from "classnames";
import React from "react/addons";

import AppVolumesListItemComponent
  from "../components/AppVolumesListItemComponent";
import VolumesConstants from "../constants/VolumesConstants";
import Util from "../helpers/Util";

var AppVolumesListComponent = React.createClass({
  displayName: "AppVolumesListComponent",

  propTypes: {
    volumes: React.PropTypes.array
  },

  getInitialState: function () {
    return {
      sortKey: "id",
      sortDescending: false
    };
  },

  getCaret: function (sortKey) {
    if (sortKey === this.state.sortKey) {
      return (
        <span className="caret"></span>
      );
    }
    return null;
  },

  sortBy: function (sortKey) {
    var state = this.state;

    this.setState({
      sortKey: sortKey,
      sortDescending: state.sortKey === sortKey && !state.sortDescending
    });
  },

  getVolumeType: function (volume) {
    if (volume.hostPath != null) {
      return VolumesConstants.TYPES.DOCKER;
    }
    if (volume.persistent != null || volume["size"] != null) {
      return VolumesConstants.TYPES.LOCAL;
    }
    if (volume.external != null) {
      return VolumesConstants.TYPES.NETWORK;
    }
    return null;
  },

  getVolumeRow: function (volume, index) {
    return (
      <AppVolumesListItemComponent
        key={index}
        sortKey={this.state.sortKey}
        volume={volume}/>
    );
  },

  getVolumes: function (volumes) {
    var state = this.state;

    return volumes
      .map((volume) => {
        volume.type = this.getVolumeType(volume);
        if (volume.type === VolumesConstants.TYPES.LOCAL &&
            volume.size == null) {
          volume.size = volume.persistent.size ;
          delete volume.persistent;
        }

        return volume;
      })
      .sort(Util.sortBy(state.sortKey, state.sortDescending))
      .map(this.getVolumeRow);
  },

  getHighlight: function (sortKey) {
    return classNames({
      "cell-highlighted": this.state.sortKey === sortKey
    });
  },

  render: function () {
    var state = this.state;

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !state.sortDescending
    });

    if (this.props.volumes == null || this.props.volumes.length === 0) {
      return null;
    }

    return (
      <div>
        <table className="table table-unstyled volume-list">
          <thead>
            <tr>
              <th className={this.getHighlight("id")}>
                <span onClick={this.sortBy.bind(null, "id")}
                    className={headerClassSet}>
                  ID {this.getCaret("id")}
                </span>
              </th>
              <th className={this.getHighlight("host")}>
                <span onClick={this.sortBy.bind(null, "host")}
                    className={headerClassSet}>
                  Host{this.getCaret("host")}
                </span>
              </th>
              <th className={this.getHighlight("type")}>
                <span onClick={this.sortBy.bind(null, "type")}
                    className={headerClassSet}>
                  Type {this.getCaret("type")}
                </span>
              </th>
              <th className={this.getHighlight("containerPath")}>
                <span onClick={this.sortBy.bind(null, "containerPath")}
                    className={headerClassSet}>
                  Container Path {this.getCaret("containerPath")}
                </span>
              </th>
              <th className={this.getHighlight("size")}>
                <span onClick={this.sortBy.bind(null, "size")}
                    className={headerClassSet}>
                  Size(MiB) {this.getCaret("size")}
                </span>
              </th>
              <th className={this.getHighlight("mode")}>
                <span onClick={this.sortBy.bind(null, "mode")}
                    className={headerClassSet}>
                  Mode {this.getCaret("mode")}
                </span>
              </th>
              <th className={this.getHighlight("status")}>
                <span onClick={this.sortBy.bind(null, "status")}
                    className={headerClassSet}>
                  Status {this.getCaret("status")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {this.getVolumes(this.props.volumes)}
          </tbody>
        </table>
      </div>
    );
  }
});

export default AppVolumesListComponent;
