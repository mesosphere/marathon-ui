var classNames = require("classnames");
var React = require("react/addons");

var AppsActions = require("../actions/AppsActions");

/*eslint-disable react/display-name, react/no-multi-comp */
var UNSPECIFIED_NODE =
  React.createClass({
    render: function () {
      return <dd className="text-muted">Unspecified</dd>;
    }
  });
/*eslint-enable react/display-name */

function invalidateValue(value, suffix) {
  if (value == null) {
    return (
      <UNSPECIFIED_NODE />
    );
  } else {
    return (
      <dd>{value} {suffix}</dd>
    );
  }
}

var AppVersionComponent = React.createClass({
  displayName: "AppVersionComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    // App object
    appVersion: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
    currentVersion: React.PropTypes.bool
  },

  handleEditAppVersion: function () {
    var appVersion = this.props.appVersion;
    var router = this.context.router;
    router.transitionTo(router.getCurrentPathname(), {}, {
      modal: `edit-app--${appVersion.id}--${appVersion.version}`
    });
  },

  handleRollbackToAppVersion: function () {
    var appVersion = this.props.appVersion;
    AppsActions.applySettingsOnApp(appVersion.id, appVersion);
  },

  getButtonClassSet: function () {
    return classNames({
      "btn btn-sm btn-default pull-right": true,
      "disabled": this.props.appVersion.version == null
    });
  },

  getApplyButton: function () {
    if (!this.props.currentVersion) {
      return (
        <button type="submit"
            className={this.getButtonClassSet()}
            onClick={this.handleRollbackToAppVersion}>
          ✓ Apply
        </button>
      );
    }
  },

  getEditButton: function () {
    return (
      <button type="submit"
          className={this.getButtonClassSet()}
          onClick={this.handleEditAppVersion}>
        ✎ Edit
      </button>
    );
  },

  render: function () {
    var appVersion = this.props.appVersion;

    var constraintsNode = (appVersion.constraints.length < 1)
      ? <UNSPECIFIED_NODE />
      : appVersion.constraints.map(function (c) {

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

    var containerNode = (appVersion.container == null)
      ? <UNSPECIFIED_NODE />
      : <dd><pre>{JSON.stringify(appVersion.container, null, 2)}</pre></dd>;

    var envNode = (appVersion.env == null ||
        Object.keys(appVersion.env).length === 0)
      ? <UNSPECIFIED_NODE />
      // Print environment variables as key value pairs like "key=value"
      : Object.keys(appVersion.env).map(function (k) {
        return <dd key={k}>{k + "=" + appVersion.env[k]}</dd>;
      });

    var executorNode = (appVersion.executor === "")
      ? <UNSPECIFIED_NODE />
      : <dd>{appVersion.executor}</dd>;

    var healthChecksNode = (appVersion.healthChecks == null
        || appVersion.healthChecks.length === 0)
      ? <UNSPECIFIED_NODE />
      : <dd><pre>{JSON.stringify(appVersion.healthChecks, null, 2)}</pre></dd>;

    var portsNode = (appVersion.ports.length === 0)
      ? <UNSPECIFIED_NODE />
      : <dd>{appVersion.ports.join(",")}</dd>;

    var urisNode = (appVersion.uris.length === 0)
      ? <UNSPECIFIED_NODE />
      : appVersion.uris.map(function (u) {
        return <dd key={u}>{u}</dd>;
      });

    return (
      <div>
        {this.getApplyButton()}
        {this.getEditButton()}
        <dl className={"dl-horizontal " + this.props.className}>
          <dt>Command</dt>
          {invalidateValue(appVersion.cmd)}
          <dt>Constraints</dt>
          {constraintsNode}
          <dt>Container</dt>
          {containerNode}
          <dt>CPUs</dt>
          {invalidateValue(appVersion.cpus)}
          <dt>Environment</dt>
          {envNode}
          <dt>Executor</dt>
          {executorNode}
          <dt>Health Checks</dt>
          {healthChecksNode}
          <dt>Instances</dt>
          {invalidateValue(appVersion.instances)}
          <dt>Memory</dt>
          {invalidateValue(appVersion.mem, "MB")}
          <dt>Disk Space</dt>
          {invalidateValue(appVersion.disk, "MB")}
          <dt>Ports</dt>
          {portsNode}
          <dt>Backoff Factor</dt>
          {invalidateValue(appVersion.backoffFactor)}
          <dt>Backoff</dt>
          {invalidateValue(appVersion.backoffSeconds, "seconds")}
          <dt>Max Launch Delay</dt>
          {invalidateValue(appVersion.maxLaunchDelaySeconds, "seconds")}
          <dt>URIs</dt>
          {urisNode}
          <dt>Version</dt>
          {invalidateValue(appVersion.version)}
        </dl>
      </div>
    );
  }
});

module.exports = AppVersionComponent;
