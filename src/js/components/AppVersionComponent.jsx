import classNames from "classnames";
import highlight from "highlight.js";
import {Link} from "react-router";
import React from "react/addons";
import url from "url";

import AppsActions from "../actions/AppsActions";
import AppsEvents from "../events/AppsEvents";
import AppsStore from "../stores/AppsStore";
import AppVersionStore from "../stores/AppVersionsStore";
import UnspecifiedNodeComponent from "../components/UnspecifiedNodeComponent";

function invalidateValue(value, suffix) {
  if (value == null) {
    return (
      <UnspecifiedNodeComponent />
    );
  } else {
    return (
      <dd>{value} {suffix}</dd>
    );
  }
}

function getHighlightNode(data) {
  return (
    <dd>
      <pre className="highlight">
        {JSON.stringify(data, null, 2)}
      </pre>
    </dd>
  );
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

  getInitialState: function () {
    return {isStale: false};
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.APPLY_APP_REQUEST, this.onAppApplySettingsRequest);
    AppsStore.on(AppsEvents.APPLY_APP_ERROR, this.onAppApplySettingsResponse);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(
      AppsEvents.APPLY_APP_REQUEST,
      this.onAppApplySettingsRequest
    );
    AppsStore.removeListener(
      AppsEvents.APPLY_APP_ERROR,
      this.onAppApplySettingsResponse
    );
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.appVersion.version !== this.props.appVersion.version) {
      this.onAppApplySettingsResponse();
    }
  },

  componentDidMount: function () {
    this.highlightNodes();
  },

  componentDidUpdate: function () {
    this.highlightNodes();
  },

  onAppApplySettingsRequest: function () {
    this.setState({isStale: true});
  },

  onAppApplySettingsResponse: function () {
    this.setState({isStale: false});
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
    var appDiff = AppVersionStore.getAppConfigDiff(appVersion.id, appVersion);
    AppsActions.applySettingsOnApp(appVersion.id, appDiff);
  },

  getButtonClassSet: function () {
    return classNames({
      "btn btn-sm btn-default pull-right": true,
      "disabled": this.state.isStale || this.props.appVersion.version == null
    });
  },

  highlightNodes: function () {
    var highlightNodes =
      React.findDOMNode(this).getElementsByClassName("highlight");

    [...highlightNodes].forEach(node => {
      highlight.highlightBlock(node);
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

    var acceptedResourceRoles = (appVersion.acceptedResourceRoles == null ||
        appVersion.acceptedResourceRoles.length === 0)
      ? <UnspecifiedNodeComponent />
      : <dd>{appVersion.acceptedResourceRoles.join(", ")}</dd>;

    var constraintsNode = (appVersion.constraints == null ||
        appVersion.constraints.length < 1)
      ? <UnspecifiedNodeComponent />
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
      ? <UnspecifiedNodeComponent />
      : getHighlightNode(appVersion.container);

    var dependenciesNode = (appVersion.dependencies.length === 0)
      ? <UnspecifiedNodeComponent />
      : appVersion.dependencies.map(function (d) {
        return (
          <dd key={d}>
            <Link to="app" params={{appId: encodeURIComponent(d)}}>{d}</Link>
          </dd>
        );
      });

    var envNode = (appVersion.env == null ||
        Object.keys(appVersion.env).length === 0)
      ? <UnspecifiedNodeComponent />
      // Print environment variables as key value pairs like "key=value"
      : Object.keys(appVersion.env).sort().map(function (k) {
        return <dd key={k}>{k + "=" + appVersion.env[k]}</dd>;
      });

    var executorNode = (appVersion.executor == null ||
        appVersion.executor === "")
      ? <UnspecifiedNodeComponent />
      : <dd>{appVersion.executor}</dd>;

    var healthChecksNode = (appVersion.healthChecks == null
        || appVersion.healthChecks.length === 0)
      ? <UnspecifiedNodeComponent />
      : getHighlightNode(appVersion.healthChecks);

    var ipAddressNode = (appVersion.ipAddress == null)
      ? <UnspecifiedNodeComponent />
      : getHighlightNode(appVersion.ipAddress);

    var labelsNode = (appVersion.labels == null ||
        Object.keys(appVersion.labels).length === 0)
      ? <UnspecifiedNodeComponent />
      // Print labels as key value pairs like "key=value"
      : Object.keys(appVersion.labels).map(function (k) {
        return <dd key={k}>{k + "=" + appVersion.labels[k]}</dd>;
      });

    var portDefinitionsNode = (appVersion.portDefinitions == null)
      ? <UnspecifiedNodeComponent />
      : getHighlightNode(appVersion.portDefinitions);

    var urisNode = (appVersion.uris == null || appVersion.uris.length === 0)
      ? <UnspecifiedNodeComponent />
      : appVersion.uris.map(function (uri, i) {
        var parsedURI = url.parse(uri);
        var linkNode = uri;

        if (parsedURI.protocol === "http:" || parsedURI.protocol === "https:") {
          linkNode = <a href={uri} target="_blank">{uri}</a>;
        }

        return <dd key={uri+i}>{linkNode}</dd>;
      });

    return (
      <div>
        {this.getApplyButton()}
        {this.getEditButton()}
        <dl className={"dl-horizontal " + this.props.className}>
          <dt>ID</dt>
          {invalidateValue(appVersion.id)}
          <dt>Command</dt>
          {invalidateValue(appVersion.cmd)}
          <dt>Constraints</dt>
          {constraintsNode}
          <dt>Dependencies</dt>
          {dependenciesNode}
          <dt>Labels</dt>
          {labelsNode}
          <dt>Resource Roles</dt>
          {acceptedResourceRoles}
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
          <dt>IP Address</dt>
          {ipAddressNode}
          <dt>Memory</dt>
          {invalidateValue(appVersion.mem, "MiB")}
          <dt>Disk Space</dt>
          {invalidateValue(appVersion.disk, "MiB")}
          <dt>Port Definitions</dt>
          {portDefinitionsNode}
          <dt>Backoff Factor</dt>
          {invalidateValue(appVersion.backoffFactor)}
          <dt>Backoff</dt>
          {invalidateValue(appVersion.backoffSeconds, "seconds")}
          <dt>Max Launch Delay</dt>
          {invalidateValue(appVersion.maxLaunchDelaySeconds, "seconds")}
          <dt>URIs</dt>
          {urisNode}
          <dt>User</dt>
          {invalidateValue(appVersion.user)}
          <dt>Version</dt>
          {invalidateValue(appVersion.version)}
        </dl>
      </div>
    );
  }
});

export default AppVersionComponent;
