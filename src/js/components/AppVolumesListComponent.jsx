import classNames from "classnames";
import React from "react/addons";

import AppVolumesListItemComponent
  from "../components/AppVolumesListItemComponent";
import LocalVolumesConstants from "../constants/LocalVolumesConstants";
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
      return LocalVolumesConstants.TYPES.DOCKER;
    }
    if (volume.persistent != null) {
      return LocalVolumesConstants.TYPES.LOCAL;
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
        if (volume.type === LocalVolumesConstants.TYPES.LOCAL) {
          volume.size = volume.persistent.size;
          delete volume.persistent;
        }

        return volume;
      })
      .sort(Util.sortBy(state.sortKey, state.sortDescending))
      .map(this.getVolumeRow);
  },

  render: function () {
    var state = this.state;

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !state.sortDescending
    });

    var idClassSet = classNames({
      "cell-highlighted": state.sortKey === "id"
    });

    var hostClassSet = classNames({
      "cell-highlighted": state.sortKey === "host"
    });

    var typeClassSet = classNames({
      "cell-highlighted": state.sortKey === "type"
    });

    var containerPathClassSet = classNames({
      "cell-highlighted": state.sortKey === "containerPath"
    });

    var sizeClassSet = classNames({
      "cell-highlighted": state.sortKey === "size"
    });

    var modeClassSet = classNames({
      "cell-highlighted": state.sortKey === "mode"
    });

    var statusClassSet = classNames({
      "cell-highlighted": state.sortKey === "status"
    });

    if (this.props.volumes == null) {
      return null;
    }

    return (
      <div>
        <table className="table table-unstyled volume-list">
          <thead>
            <tr>
              <th className={idClassSet}>
                <span onClick={this.sortBy.bind(null, "id")}
                    className={headerClassSet}>
                  ID {this.getCaret("id")}
                </span>
              </th>
              <th className={hostClassSet}>
                <span onClick={this.sortBy.bind(null, "host")}
                    className={headerClassSet}>
                  Host{this.getCaret("host")}
                </span>
              </th>
              <th className={typeClassSet}>
                <span onClick={this.sortBy.bind(null, "type")}
                    className={headerClassSet}>
                  Type {this.getCaret("type")}
                </span>
              </th>
              <th className={containerPathClassSet}>
                <span onClick={this.sortBy.bind(null, "containerPath")}
                    className={headerClassSet}>
                  Container Path {this.getCaret("containerPath")}
                </span>
              </th>
              <th className={sizeClassSet}>
                <span onClick={this.sortBy.bind(null, "size")}
                    className={headerClassSet}>
                  Size(MiB) {this.getCaret("size")}
                </span>
              </th>
              <th className={modeClassSet}>
                <span onClick={this.sortBy.bind(null, "mode")}
                    className={headerClassSet}>
                  Mode {this.getCaret("mode")}
                </span>
              </th>
              <th className={statusClassSet}>
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
