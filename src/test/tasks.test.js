var _ = require("underscore");
var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");
var AppsActions = require("../js/actions/AppsActions");
var AppsEvents = require("../js/events/AppsEvents");
var AppsStore = require("../js/stores/AppsStore");
var TasksActions = require("../js/actions/TasksActions");
var TasksEvents = require("../js/events/TasksEvents");
var TaskListItemComponent = require("../js/components/TaskListItemComponent");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;
var ShallowUtils = require("./helpers/ShallowUtils");

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Tasks", function () {

  beforeEach(function (done) {
    this.server = server
    .setup({
      "app": {
        id: "/app-1",
        tasks: [{
          id: "task-1",
          appId: "/app-1"
        },
        {
          id: "task-2",
          appId: "/app-1"
        }]
      }
    }, 200)
    .start(function () {
      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApp("/app-1");
    });
  });

  afterEach(function (done) {
    this.server.stop(done);
  });

  describe("on task deletion", function () {

    it("updates the tasks array on success", function (done) {
      this.server.setup({
        "task": {
          "id": "task-1"
        }
      }, 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(1);
          expect(_.where(AppsStore.currentApp.tasks, {
            id: "task-1"
          })).to.be.empty;
        }, done);
      });

      TasksActions.deleteTask("/app-1", "task-1");
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      AppsStore.once(TasksEvents.DELETE_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      TasksActions.deleteTask("/app-1", "task-3");
    });

  });

  describe("on task deletion and scale", function () {

    it("updates the tasks array on success", function (done) {
      this.server.setup({
        "task": {
          "id": "task-2"
        }
      }, 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(1);
          expect(_.where(AppsStore.currentApp.tasks, {
            id: "task-2"
          })).to.be.empty;
        }, done);
      });

      TasksActions.deleteTaskAndScale("/app-1", "task-2");
    });

  });

});

describe("Task List Item component", function () {

  beforeEach(function () {
    var model = {
      appId: "/app-1",
      id: "task-123",
      host: "host-1",
      ports: [1, 2, 3],
      status: "status-0",
      updatedAt: "2015-06-29T14:11:58.709Z",
      version: "2015-06-29T13:54:24.171Z"
    };

    var renderer = TestUtils.createRenderer();
    renderer.render(<TaskListItemComponent
      appId={"/app-1"}
      hasHealth={false}
      isActive={false}
      onToggle={()=>{}}
      task={model} />);
    this.component = renderer.getRenderOutput();
  });

  it("has the correct task id", function () {
    var cellContent =
      ShallowUtils.getText(this.component.props.children[1].props.children[0]);

    expect(cellContent).to.equal("task-123");
  });

  it("has the correct status", function () {
    var cellContent =
      ShallowUtils.getText(this.component.props.children[2].props.children);

    expect(cellContent).to.equal("status-0");
  });

  it("has the correct version", function () {
    var cellContent =
      this.component.props.children[3].props.children.props;

    expect(cellContent.title).to.equal("2015-06-29T13:54:24.171Z");
  });

  it("has the correct update timestamp", function () {
    var cellContent =
      this.component.props.children[4].props.children.props;

    expect(cellContent.title).to.equal("2015-06-29T14:11:58.709Z");
    expect(cellContent.dateTime).to.equal("2015-06-29T14:11:58.709Z");
  });

  it("has a health dot", function () {
    var cell =
      this.component.props.children[5].props.children.props.className;

    expect(cell).to.equal("health-dot");
  });

});
