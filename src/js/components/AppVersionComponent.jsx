var _ = require("underscore");
var React = require("react/addons");
/*eslint-disable react/display-name, react/no-multi-comp */
var UNSPECIFIED_NODE =
  React.createClass({
    render: function () {
      return <dd className="text-muted">Unspecified</dd>;
    }
  });
/*eslint-enable react/display-name */
var AppVersionComponent = React.createClass({
  displayName: "AppVersionComponent",

  propTypes: {
    app: React.PropTypes.object.isRequired,
    appVersion: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    currentVersion: React.PropTypes.bool,
    onRollback: React.PropTypes.func
  },

  handleSubmit: function (event) {
    if (_.isFunction(this.props.onRollback)) {
      event.preventDefault();
      this.props.onRollback(this.props.appVersion, event);
    }
  },

  render: function () {
    var appVersion = this.props.appVersion;

    if (_.isEmpty(appVersion)) {
      return null;
    }

    var cmdNode = (appVersion.cmd == null) ?
      <UNSPECIFIED_NODE /> :
      <dd>{appVersion.cmd}</dd>;
    var constraintsNode = (appVersion.constraints.length < 1) ?
      <UNSPECIFIED_NODE /> :
      appVersion.constraints.map(function (c) {

        // Only include constraint parts if they are not empty Strings. For
        // example, a hostname uniqueness constraint looks like:
        //
        //     ["hostname", "UNIQUE", ""]
        //
        // it should print "hostname:UNIQUE" instead of "hostname:UNIQUE:", no
        // trailing colon.
        return (
          <dd key={c}>
            {c.filter(function (s) { return s !== ""; }).join(":")}
          </dd>
        );
      });
    var containerNode = (appVersion.container == null) ?
      <UNSPECIFIED_NODE /> :
      <dd><pre>{JSON.stringify(appVersion.container, null, 2)}</pre></dd>;
    var envNode = (appVersion.env == null ||
        Object.keys(appVersion.env).length === 0) ?
      <UNSPECIFIED_NODE /> :

      // Print environment variables as key value pairs like "key=value"
      Object.keys(appVersion.env).map(function (k) {
        return <dd key={k}>{k + "=" + appVersion.env[k]}</dd>;
      });
    var executorNode = (appVersion.executor === "") ?
      <UNSPECIFIED_NODE /> :
      <dd>{appVersion.executor}</dd>;
    var diskNode = (appVersion.disk == null) ?
      <UNSPECIFIED_NODE /> :
      <dd>{appVersion.disk} MB</dd>;
    var portsNode = (appVersion.ports.length === 0) ?
      <UNSPECIFIED_NODE /> :
      <dd>{appVersion.ports.join(",")}</dd>;
    var backoffFactorNode = (appVersion.backoffFactor == null) ?
      <UNSPECIFIED_NODE /> :
      <dd>{appVersion.backoffFactor}</dd>;
    var backoffSecondsNode = (appVersion.backoffSeconds == null) ?
      <UNSPECIFIED_NODE /> :
      <dd>{appVersion.backoffSeconds} seconds</dd>;
    var maxLaunchDelaySecondsNode = (appVersion.maxLaunchDelaySeconds == null) ?
      <UNSPECIFIED_NODE /> :
      <dd>{appVersion.maxLaunchDelaySeconds} seconds</dd>;
    var urisNode = (appVersion.uris.length === 0) ?
      <UNSPECIFIED_NODE /> :
      appVersion.uris.map(function (u) {
        return <dd key={u}>{u}</dd>;
      });
    return (
      <div>
        <dl className={"dl-horizontal " + this.props.className}>
          <dt>Command</dt>
          {cmdNode}
          <dt>Constraints</dt>
          {constraintsNode}
          <dt>Container</dt>
          {containerNode}
          <dt>CPUs</dt>
          <dd>{appVersion.cpus}</dd>
          <dt>Environment</dt>
          {envNode}
          <dt>Executor</dt>
          {executorNode}
          <dt>Instances</dt>
          <dd>{appVersion.instances}</dd>
          <dt>Memory</dt>
          <dd>{appVersion.mem} MB</dd>
          <dt>Disk Space</dt>
          <dd>{diskNode}</dd>
          <dt>Ports</dt>
          {portsNode}
          <dt>Backoff Factor</dt>
          {backoffFactorNode}
          <dt>Backoff</dt>
          {backoffSecondsNode}
          <dt>Max Launch Delay</dt>
          {maxLaunchDelaySecondsNode}
          <dt>URIs</dt>
          {urisNode}
          <dt>Version</dt>
          <dd>{appVersion.id}</dd>
        </dl>
        {
          this.props.currentVersion ?
            null :
            <div className="text-right">
              <form action={this.props.app.url()} method="post" onSubmit={this.handleSubmit}>
                  <input type="hidden" name="_method" value="put" />
                  <input type="hidden" name="version" value={appVersion.version} />
                  <button type="submit" className="btn btn-sm btn-default">
                    Apply these settings
                  </button>
              </form>
            </div>
        }
      </div>
    );
  }
});

module.exports = AppVersionComponent;
