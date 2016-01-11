var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var Messages = require("../constants/Messages");
var States = require("../constants/States");

var CenteredInlineDialogComponent = require("./CenteredInlineDialogComponent");
var TaskListItemComponent = require("../components/TaskListItemComponent");

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
            task={task}
            taskHealthMessage={props.getTaskHealthMessage(task.id)}/>
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
    var pageHasGenericError = props.fetchState === States.STATE_ERROR;
    var pageHasUnauthorizedError =
      props.fetchState === States.STATE_UNAUTHORIZED;
    var pageHasForbiddenError = props.fetchState === States.STATE_FORBIDDEN;
    var pageHasNoTasks = tasksLength === 0 &&
      !pageIsLoading &&
      !pageHasGenericError &&
      !pageHasUnauthorizedError &&
      !pageHasForbiddenError;

    if (pageIsLoading) {
      return (
        <CenteredInlineDialogComponent title="Loading Tasks..."
          message="Please wait while tasks are being retrieved." />
      );
    }

    if (pageHasNoTasks) {
      return (
        <CenteredInlineDialogComponent title="No Tasks Running"
          message="Running tasks will be shown here." />
      );
    }

    if (pageHasGenericError || pageHasForbiddenError ||
        pageHasUnauthorizedError) {
      let error = Messages.RETRY_REFRESH;

      if (pageHasForbiddenError) {
        error = Messages.FORBIDDEN;
      }
      if (pageHasUnauthorizedError) {
        error = Messages.UNAUTHORIZED;
      }
      return (
        <CenteredInlineDialogComponent title="Error Fetching Tasks"
          additionalClasses="error"
          message={error} />
      );
    }

    return null;
  },

  render: function () {
    var props = this.props;
    var tasksLength = props.tasks.length;
    var hasHealth = !!props.hasHealth;

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !this.state.sortDescending
    });

    var hasHealthClassSet = classNames({
      "hidden": !hasHealth
    });

    return (
      <div>
        <table className="table table-unstyled task-list">
          <thead>
            <tr>
              <th
                className={headerClassSet}
                width="1"
                onClick={this.handleThToggleClick}>
                <input type="checkbox"
                  checked={this.allTasksSelected(tasksLength)}
                  disabled={tasksLength === 0}
                  onChange={props.toggleAllTasks} />
              </th>
              <th>
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
              <th className="text-center">
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
              <th className="text-right">
                <span onClick={this.sortBy.bind(null, "version")}
                    className={headerClassSet}>
                  {this.getCaret("version")} Version
                </span>
              </th>
              <th className="text-right">
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

module.exports = TaskListComponent;
