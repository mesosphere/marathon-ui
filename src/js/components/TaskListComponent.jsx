var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var AppsEvents = require("../events/AppsEvents");
var AppsStore = require("../stores/AppsStore");
var Messages = require("../constants/Messages");
var States = require("../constants/States");

var CenteredInlineDialogComponent = require("./CenteredInlineDialogComponent");
var TaskListItemComponent = require("./TaskListItemComponent");
var PlaceholderTaskListItemComponent =
  require("./PlaceholderTaskListItemComponent");

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
      sortDescending: false,
      targetInstances: 0
    };
  },

  componentWillMount: function () {
    AppsStore.on(AppsEvents.SCALE_APP, this.onScaleApp);
  },

  componentWillUnmount: function () {
    AppsStore.removeListener(AppsEvents.SCALE_APP, this.onScaleApp);
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

  onScaleApp: function (data, appId, instances) {
    this.setState({targetInstances: instances});
  },

  getTasks: function () {
    var props = this.props;
    var state = this.state;
    var itemsPerPage = props.itemsPerPage;
    var dropCount = props.currentPage * itemsPerPage;
    var hasHealth = !!props.hasHealth;
    var sortKey = state.sortKey;
    var targetInstances = state.targetInstances;

    var nodes = lazy(props.tasks)
      .sortBy(app => app[sortKey], state.sortDescending)
      .drop(dropCount)
      .take(itemsPerPage)
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
            taskHealthMessage={props.getTaskHealthMessage(task.id)} />
        );
      })
      .value();

    if (targetInstances > props.tasks.length && nodes.length < itemsPerPage) {
      let numPlaceholders = Math.min(itemsPerPage - nodes.length,
        targetInstances - nodes.length);

      for (let i = 0; i < numPlaceholders; i++) {
        nodes.push(<PlaceholderTaskListItemComponent key={i}/>);
      }
    }
    nodes.push(<PlaceholderTaskListItemComponent key={123}/>);

    return nodes;
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

    return null;
  },

  render: function () {
    var props = this.props;
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
      "hidden": !hasHealth
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
