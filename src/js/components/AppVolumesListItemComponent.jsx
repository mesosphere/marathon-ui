import classNames from "classnames";
import React from "react/addons";
import {Link} from "react-router";

var AppVolumesListItemComponent = React.createClass({
  displayName: "AppVolumesListItemComponent",

  propTypes: {
    sortKey: React.PropTypes.string.isRequired,
    volume: React.PropTypes.object.isRequired
  },

  render: function () {
    var {volume, sortKey} = this.props;

    var idClassSet = classNames({
      "cell-highlighted": sortKey === "id"
    });

    var hostClassSet = classNames({
      "cell-highlighted": sortKey === "host"
    });

    var typeClassSet = classNames({
      "cell-highlighted": sortKey === "type"
    });

    var containerPathClassSet = classNames({
      "cell-highlighted": sortKey === "containerPath"
    });

    var hostPathClassSet = classNames({
      "cell-highlighted": sortKey === "hostPath"
    });

    var sizeClassSet = classNames({
      "cell-highlighted": sortKey === "size"
    });

    var modeClassSet = classNames({
      "cell-highlighted": sortKey === "mode"
    });

    var statusClassSet = classNames({
      "cell-highlighted": sortKey === "status",
      "volume-attached": volume.status != null &&
        volume.status.toLowerCase() === "attached",
      "volume-detached": volume.status != null &&
        volume.status.toLowerCase() === "detached"
    });

    var params = {
      appId: encodeURIComponent(volume.appId),
      volumeId: encodeURIComponent(volume.persistenceId)
    };

    return (
      <tr>
        <td className={idClassSet}>
          <Link to="volumeView" params={params}>
            {volume.persistenceId}
          </Link>
        </td>
        <td className={hostClassSet}>
          {volume.host}
        </td>
        <td className={typeClassSet}>
          {volume.type}
        </td>
        <td className={containerPathClassSet}>
          {volume.containerPath}
        </td>
        <td className={hostPathClassSet}>
          {volume.hostPath}
        </td>
        <td className={sizeClassSet}>
          {volume.size}
        </td>
        <td className={modeClassSet}>
          {volume.mode}
        </td>
        <td className={statusClassSet}>
          {volume.status}
        </td>
      </tr>
    );
  }
});

export default AppVolumesListItemComponent;
