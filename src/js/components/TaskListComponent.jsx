import classNames from "classnames";
import lazy from "lazy.js";
import React from "react/addons";

import Messages from "../constants/Messages";
import States from "../constants/States";

import CenteredInlineDialogComponent from "./CenteredInlineDialogComponent";
import TaskListItemComponent from "../components/TaskListItemComponent";

var TaskListComponent = React.createClass({
  displayName: "TaskListComponent",

  propTypes: {
    currentPage: React.PropTypes.number.isRequired,
    fetchState: React.PropTypes.number.isRequired,
    getTaskHealthMessage: React.PropTypes.func.isRequired,
    hasHealth: React.PropTypes.bool,
    itemsPerPage: React.PropTypes.number.isRequired,
    onTaskToggle: React.PropTypes.func.isRequired,
    selectedTasks: React.PropTypes.object.isRequired,
    tasks: React.PropTypes.array.isRequired,
    toggleAllTasks: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      sortKey: "updatedAt",
      sortDescending: false
    };
  },

  handleThToggleClick: function (event) {
    // If the click happens on the checkbox, let the checkbox's onchange event
    // handler handle it and skip handling the event here.
    if (event.target.nodeName !== "INPUT") {
      this.props.toggleAllTasks();
    }
  },

  sortBy: function (sortKey) {
    var state = this.state;

    this.setState({
      sortKey: sortKey,
      sortDescending: state.sortKey === sortKey && !state.sortDescending
    });
  },

  getTasks: function () {
    var props = this.props;
    var state = this.state;
    var dropCount = this.props.currentPage * this.props.itemsPerPage;
    var hasHealth = !!props.hasHealth;
    var sortKey = state.sortKey;

    return lazy(this.props.tasks)
      .sortBy(app => app[sortKey], state.sortDescending)
      .drop(dropCount)
      .take(this.props.itemsPerPage)
      .map(function (task) {
        var isActive = props.selectedTasks[task.id] === true;

        return (
          <TaskListItemComponent
            appId={props.tasks[0].appId}
            hasHealth={hasHealth}
            isActive={isActive}
            key={task.id}
            onToggle={props.onTaskToggle}
            sortKey={sortKey}
            task={task}
            taskHealthMessage={props.getTaskHealthMessage(task.id)} />
        );
      })
      .value();
  },

  getCaret: function (sortKey) {
    if (sortKey === this.state.sortKey) {
      return (
        <span className="caret"></span>
      );
    }
    return null;
  },

  allTasksSelected: function (tasksLength) {
    var selectedTasks = this.props.selectedTasks;
    return tasksLength > 0 && lazy(this.props.tasks).find(function (task) {
      return selectedTasks[task.id] == null;
    }) == null;
  },

  getInlineDialog: function () {
    var props = this.props;
    var tasksLength = props.tasks.length;
    var pageIsLoading = props.fetchState === States.STATE_LOADING;
    var pageHasNoTasks = tasksLength === 0 &&
      !pageIsLoading &&
      props.fetchState !== States.STATE_ERROR &&
      props.fetchState !== States.STATE_UNAUTHORIZED &&
      props.fetchState !== States.STATE_FORBIDDEN;

    if (pageIsLoading) {
      let message = "Please wait while tasks are being retrieved";
      let title = "Loading Tasks...";

      return (
        <CenteredInlineDialogComponent>
          <div>
            <i className="icon icon-large loading"></i>
            <h3 className="h3">{title}</h3>
            <p className="muted">{message}</p>
          </div>
        </CenteredInlineDialogComponent>
      );
    }

    if (pageHasNoTasks) {
      return (
        <CenteredInlineDialogComponent title="No Tasks Running"
          message="Running tasks will be shown here." />
      );
    }

    return null;
  },

  render: function () {
    var props = this.props;
    var state = this.state;
    var tasksLength = props.tasks.length;
    var hasHealth = !!props.hasHealth;
    var hasError = props.fetchState === States.STATE_ERROR;
    var isUnauthorized =
      props.fetchState === States.STATE_UNAUTHORIZED;
    var isForbidden = props.fetchState === States.STATE_FORBIDDEN;

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !this.state.sortDescending
    });

    var errorClassSet = classNames({
      "fluid-container": true,
      "hidden": !hasError
    });

    var unauthorizedClassSet = classNames({
      "fluid-container": true,
      "hidden": !isUnauthorized
    });

    var forbiddenClassSet = classNames({
      "fluid-container": true,
      "hidden": !isForbidden
    });

    var hasHealthClassSet = classNames({
      "hidden": !hasHealth,
      "table-column-sorted": state.sortKey === "healthStatus"
    });

    var idClassSet = classNames({
      "table-column-sorted": state.sortKey === "id"
    });

    var statusClassSet = classNames("text-center", {
      "table-column-sorted": state.sortKey === "status"
    });

    var versionClassSet = classNames("text-right", {
      "table-column-sorted": state.sortKey === "version"
    });

    var updatedAtClassSet = classNames("text-right", {
      "table-column-sorted": state.sortKey === "updatedAt"
    });

    return (
      <div>
        <div className={errorClassSet}>
          <p className="text-center text-danger">
            {`Error fetching tasks. ${Messages.RETRY_REFRESH}`}
          </p>
        </div>
        <div className={unauthorizedClassSet}>
          <p className="text-center text-danger">
            {`Error fetching tasks. ${Messages.UNAUTHORIZED}`}
          </p>
        </div>
        <div className={forbiddenClassSet}>
          <p className="text-center text-danger">
            {`Error fetching tasks. ${Messages.FORBIDDEN}`}
          </p>
        </div>
        <table className="table table-unstyled task-list">
          <thead>
            <tr>
              <th className={headerClassSet}
                  width="1"
                  onClick={this.handleThToggleClick}>
                <input type="checkbox"
                  checked={this.allTasksSelected(tasksLength)}
                  disabled={tasksLength === 0}
                  onChange={props.toggleAllTasks} />
              </th>
              <th className={idClassSet}>
                <span onClick={this.sortBy.bind(null, "id")}
                    className={headerClassSet}>
                  ID {this.getCaret("id")}
                </span>
              </th>
              <th className={hasHealthClassSet}>
                <span onClick={this.sortBy.bind(null, "healthStatus")}
                    className={headerClassSet}>
                  Health {this.getCaret("healthStatus")}
                </span>
              </th>
              <th className={statusClassSet}>
                <span onClick={this.sortBy.bind(null, "status")}
                    className={headerClassSet}>
                  Status {this.getCaret("status")}
                </span>
              </th>
              <th className="text-center">
                Error Log
              </th>
              <th className="text-center">
                Output Log
              </th>
              <th className={versionClassSet}>
                <span onClick={this.sortBy.bind(null, "version")}
                    className={headerClassSet}>
                  {this.getCaret("version")} Version
                </span>
              </th>
              <th className={updatedAtClassSet}>
                <span onClick={this.sortBy.bind(null, "updatedAt")}
                    className={headerClassSet}>
                  {this.getCaret("updatedAt")} Updated
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {this.getTasks()}
          </tbody>
        </table>
        {this.getInlineDialog()}
      </div>
    );
  }
});

export default TaskListComponent;
