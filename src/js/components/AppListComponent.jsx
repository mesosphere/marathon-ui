import React from "react";
import classNames from "classnames";
import lazy from "lazy.js";

import {Table} from "reactjs-components";

import States from "../constants/States";
import AppsStore from "../stores/AppsStore";
import AppsEvents from "../events/AppsEvents";

// @todo: discuss whether we should use *es7* static class members instead
const displayName = "AppListComponent";
const propTypes = {
  currentGroup: React.PropTypes.string.isRequired,
  filterLabels: React.PropTypes.array,
  filterStatus: React.PropTypes.array,
  filterText: React.PropTypes.string,
  filterTypes: React.PropTypes.array
};
const defaultProps = {};

export default class AppListComponent extends React.Component {

  constructor(props) {
    super(props);

    var fetchState = States.STATE_LOADING;
    var apps = AppsStore.apps;

    if (apps.length > 0) {
      fetchState = States.STATE_SUCCESS;
    }

    // Set initial state
    this.state = {
      apps: apps,
      fetchState: fetchState
    };

    // Bind handler as they're not automatically bound by react
    this.onAppsChange = this.onAppsChange.bind(this);
    this.onAppsRequestError = this.onAppsRequestError.bind(this);
  }

  componentWillMount() {
    AppsStore.on(AppsEvents.CHANGE, this.onAppsChange);
    AppsStore.on(AppsEvents.REQUEST_APPS_ERROR, this.onAppsRequestError);
  }

  componentWillUnmount() {
    AppsStore.removeListener(AppsEvents.CHANGE,
      this.onAppsChange);
    AppsStore.removeListener(AppsEvents.REQUEST_APPS_ERROR,
      this.onAppsRequestError);
  }

  onAppsChange() {
    console.log("onAppsChange");
    this.setState({
      apps: AppsStore.apps,
      fetchState: States.STATE_SUCCESS
    });
  };

  onAppsRequestError(message, statusCode) {
    var fetchState = States.STATE_ERROR;

    switch (statusCode) {
      case 401:
        fetchState = States.STATE_UNAUTHORIZED;
        break;
      case 403:
        fetchState = States.STATE_FORBIDDEN;
        break;
    }

    this.setState({
      fetchState: fetchState
    });
  }

  static getColGroup() {
    return (
      <colgroup>
        <col className="icon-col"/>
        <col className="name-col"/>
        <col className="cpu-col"/>
        <col className="ram-col"/>
        <col className="status-col"/>
        <col className="instances-col"/>
        <col className="health-col"/>
        <col className="actions-col"/>
      </colgroup>
    );
  }

  static getColumnHeading(prop, order, sortBy) {
    let caretClassNames = classNames({
      "caret": true,
      "caret--asc": order === "asc",
      "caret--desc": order === "desc",
      "caret--visible": sortBy.prop === prop
    });

    let headingStrings = {
      "icon": "Icon",
      "name": "Name",
      "cpu": "CPU",
      "ram": "Memory",
      "status": "Status",
      "instances": "Instance",
      "health": "Health",
      "actions": "Actions"
    };

    return (
      <span>
        {headingStrings[prop]}
        <span className={caretClassNames}></span>
      </span>
    );
  }

  static getColumns() {
    return [
      {
        className: "icon-cell",
        defaultContent: "I",
        heading: this.getColumnHeading,
        prop: "icon",
        sortable: true
      },
      {
        className: "name-cell",
        heading: this.getColumnHeading,
        prop: "id",
        sortable: true
      },
      {
        className: "cpu-cell",
        heading: this.getColumnHeading,
        prop: "cpu",
        sortable: true
      },
      {
        className: "ram-cell",
        heading: this.getColumnHeading,
        prop: "ram",
        sortable: true
      },
      {
        className: "status-cell",
        heading: this.getColumnHeading,
        prop: "status",
        sortable: true
      },
      {
        className: "instances-cell",
        heading: this.getColumnHeading,
        prop: "instances",
        sortable: true
      },
      {
        className: "health-cell",
        heading: this.getColumnHeading,
        prop: "health",
        sortable: true
      },
      {
        className: "actions-cell",
        defaultContent: "...",
        heading: this.getColumnHeading,
        prop: "actions",
        sortable: true
      }
    ];
  }

  getApps() {

    var props = this.props;
    var apps = this.state.apps;

    if (props.filterText != null && props.filterText !== "") {
      apps = apps
        .filter(function (app) {
          return app.id.indexOf(props.filterText) !== -1;
        });
    }

    if (props.filterLabels != null && props.filterLabels.length > 0) {
      apps = apps.filter(function (app) {
        let labels = app.labels;
        if (labels == null || Object.keys(labels).length === 0) {
          return false;
        }

        return lazy(props.filterLabels).some(function (label) {
          let [key, value] = label;
          return labels[key] === value;
        });
      });
    }

    if (props.filterStatus != null && props.filterStatus.length > 0) {
      apps = apps.filter(function (app) {
        if (app.status == null) {
          return false;
        }
        let appStatus = app.status.toString();

        return lazy(props.filterStatus).some(function (status) {
          return appStatus === status;
        });
      });
    }

    if (props.filterTypes != null && props.filterTypes.length > 0) {
      apps = apps.filter(function (app) {
        return lazy(props.filterTypes).some(function (type) {
          return app.type === type;
        });
      });
    }

    return apps;
  }

  render() {
    var state = this.state;

    var tableClassSet = classNames({
      "table table-fixed app-list": true,
      "flush-bottom": true,
      "table-hover table-selectable": state.apps.length !== 0 &&
      state.fetchState !== States.STATE_LOADING
    });

    return (
      <section>
        <Table
          className={tableClassSet}
          colGroup={AppListComponent.getColGroup()}
          columns={AppListComponent.getColumns()}
          data={this.getApps()}
          idAttribute="id"
          transition={false}/>
      </section>
    );
  }
}

AppListComponent.displayName = displayName;
AppListComponent.propTypes = propTypes;
AppListComponent.defaultProps = defaultProps;
