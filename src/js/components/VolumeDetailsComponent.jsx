import React from "react/addons";

export default React.createClass({
  displayName: "VolumeDetailsComponent",
  propTypes: {
    volume: React.PropTypes.object
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
        <dt>Size (MiB)</dt>
        <dd>{volume.persistent.size}</dd>
        <dt>Application</dt>
        <dd>
          <a href={volume.appURI}>{volume.appId}</a>
        </dd>
        <dt>Task Id</dt>
        <dd>
          <a href={volume.taskURI}>{volume.taskId}</a>
        </dd>
        <dt>Host</dt>
        <dd>
          {volume.host}
        </dd>
      </dl>
    );
  }
});
