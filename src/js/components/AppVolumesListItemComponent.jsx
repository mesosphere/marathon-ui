import classNames from "classnames";
import React from "react/addons";
import {Link} from "react-router";

var AppVolumesListItemComponent = React.createClass({
  displayName: "AppVolumesListItemComponent",

  propTypes: {
    sortKey: React.PropTypes.string.isRequired,
    volume: React.PropTypes.object.isRequired
  },

  getHighlight: function (sortKey) {
    return classNames({
      "cell-highlighted": this.props.sortKey === sortKey
    });
  },

  render: function () {
    var {volume, sortKey} = this.props;

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
        <td className={this.getHighlight("id")}>
          <Link to="volumeView" params={params}>
            {volume.persistenceId}
          </Link>
        </td>
        <td className={this.getHighlight("host")}>
          {volume.host}
        </td>
        <td className={this.getHighlight("type")}>
          {volume.type}
        </td>
        <td className={this.getHighlight("containerPath")}>
          {volume.containerPath}
        </td>
        <td className={this.getHighlight("size")}>
          {volume.size}
        </td>
        <td className={this.getHighlight("mode")}>
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
