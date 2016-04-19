import React from "react/addons";
import {Link} from "react-router";

export default React.createClass({
  displayName: "VolumeDetailsComponent",

  propTypes: {
    volume: React.PropTypes.object
  },

  getTask: function (volume) {
    var link = null;

    if (volume.taskId == null) {
      return null;
    }

    if (volume.taskId != null && volume.appId != null) {
      const params = {
        appId: encodeURIComponent(volume.appId),
        view: encodeURIComponent(volume.taskId)
      };

      link = (
        <dd>
          <Link to="appView" params={params}>
            {volume.taskId}
          </Link>
        </dd>
      );
    } else {
      link = (
        <dd>
          {volume.taskId}
        </dd>);
    }

    return (
      <div>
        <dt>Task Id</dt>
        {link}
      </div>
    );
  },

  getSize: function (volume) {
    var size;

    if (volume.persistent && volume.persistent.size) {
      size = volume.persistent.size;
    }

    if (volume.external && volume.external.size) {
      size = volume.persistent.size;
    }

    if (size == null) {
      return null;
    }

    return (
      <div>
        <dt>Size (MiB)</dt>
        <dd>{size}</dd>
      </div>
    );
  },

  getHost: function (volume) {
    if (volume.host == null) {
      return null;
    }
    return (
      <div>
        <dt>Host</dt>
        <dd>
          {volume.host}
        </dd>
      </div>
    );
  },

  render: function () {
    const {volume} = this.props;
    if (volume == null) {
      return null;
    }

    return (
      <dl className={"dl-horizontal"}>
        <dt>Container Path</dt>
        <dd>{volume.containerPath}</dd>
        <dt>Mode</dt>
        <dd>{volume.mode}</dd>
        {this.getSize(volume)}
        <dt>Application</dt>
        <dd>
          <Link to="app" params={{appId: encodeURIComponent(volume.appId)}}>
            {volume.appId}
          </Link>
        </dd>
        {this.getTask(volume)}
        {this.getHost(volume)}
      </dl>
    );
  }
});
