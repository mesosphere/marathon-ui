import React from "react/addons";

export default React.createClass({
  displayName: "VolumeDetailsComponent",
  propTypes: {
    volume: React.PropTypes.object
  },
  getTask: function (volume) {
    if (volume.taskId == null) {
      return null;
    }
    return (
      <div>
        <dt>Task Id</dt>
        <dd>
          <a href={volume.taskURI}>{volume.taskId}</a>
        </dd>
      </div>
    );
  },
  getSize: function (volume) {
    var size = volume.persistent && volume.persistent.size ||
      volume.external && volume.external.size;
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
          <a href={volume.appURI}>{volume.appId}</a>
        </dd>
        {this.getTask(volume)}
        {this.getHost(volume)}
      </dl>
    );
  }
});
