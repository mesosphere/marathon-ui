var _ = require("underscore");
var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");
var AppsActions = require("../js/actions/AppsActions");
var AppsEvents = require("../js/events/AppsEvents");
var AppsStore = require("../js/stores/AppsStore");
var InfoStore = require("../js/stores/InfoStore");
var States = require("../js/constants/States");
var TasksActions = require("../js/actions/TasksActions");
var TasksEvents = require("../js/events/TasksEvents");
var TaskListItemComponent = require("../js/components/TaskListItemComponent");
var TaskDetailComponent = require("../js/components/TaskDetailComponent");
var TaskListComponent = require("../js/components/TaskListComponent");
var TaskMesosUrlComponent = require("../js/components/TaskMesosUrlComponent");

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

  describe("on single task deletion", function () {

    it("updates the tasks array on success", function (done) {
      this.server.setup("", 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(1);
          expect(_.where(AppsStore.currentApp.tasks, {
            id: "task-1"
          })).to.be.empty;
        }, done);
      });

      TasksActions.deleteTasks("/app-1", ["task-1"]);
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      AppsStore.once(TasksEvents.DELETE_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      TasksActions.deleteTasks("/app-1", "task-3");
    });

  });

  describe("on single task deletion and scale", function () {

    it("updates the tasks array on success", function (done) {
      this.server.setup("", 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(1);
          expect(_.where(AppsStore.currentApp.tasks, {
            id: "task-2"
          })).to.be.empty;
        }, done);
      });

      TasksActions.deleteTasksAndScale("/app-1", ["task-2"]);
    });

  });

  describe("on multiple task deletion", function () {

    it("updates the tasks array on success", function (done) {
      this.server.setup("", 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(0);
        }, done);
      });

      TasksActions.deleteTasks("/app-1", ["task-1", "task-2"]);
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      AppsStore.once(TasksEvents.DELETE_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      TasksActions.deleteTasks("/app-1", "task-3");
    });

  });

  describe("on multiple task deletion and scale", function () {

    it("updates the tasks array on success", function (done) {
      this.server.setup("", 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(0);
        }, done);
      });

      TasksActions.deleteTasksAndScale("/app-1", ["task-1", "task-2"]);
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      AppsStore.once(TasksEvents.DELETE_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      TasksActions.deleteTasksAndScale("/app-1", "task-3");
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

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<TaskListItemComponent
      appId={"/app-1"}
      hasHealth={false}
      isActive={false}
      onToggle={()=>{}}
      task={model} />);
    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
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

describe("Task Detail component", function () {

  beforeEach(function () {
    this.model = {
      appId: "/app-1",
      id: "task-123",
      host: "host-1",
      ports: [1, 2, 3],
      status: "status-0",
      updatedAt: "2015-06-29T14:11:58.709Z",
      stagedAt: "2015-06-29T14:11:58.709Z",
      startedAt: "2015-06-29T14:11:58.709Z",
      version: "2015-06-29T13:54:24.171Z"
    };

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<TaskDetailComponent
      fetchState={States.STATE_SUCCESS}
      hasHealth={false}
      task={this.model} />);
    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has the correct host", function () {
    var content =
      ShallowUtils.getText(
        this.component.props.children[2].props.children[0].props.children[1]
      );

    expect(content).to.equal("host-1");
  });

  it("has the correct ports", function () {
    var content =
      ShallowUtils.getText(
        this.component.props.children[2].props.children[0].props.children[3]
      );

    expect(content).to.equal("[1,2,3]");
  });

  it("has the correct status", function () {
    var content =
      ShallowUtils.getText(
        this.component.props.children[2].props.children[0].props.children[5]
      );

    expect(content).to.equal("status-0");
  });

  it("has the correct timefields", function () {
    var stagedAt =
        this.component.props.children[2].props.children[0].props.children[6][0].props;
    var startedAt =
        this.component.props.children[2].props.children[0].props.children[6][1].props;

    expect(stagedAt.time).to.equal("2015-06-29T14:11:58.709Z");
    expect(startedAt.time).to.equal("2015-06-29T14:11:58.709Z");
  });

  it("has the correct version", function () {
    var version =
        this.component.props.children[2].props.children[0].props.children[8].props.children.props;

    expect(version.dateTime).to.equal("2015-06-29T13:54:24.171Z");
  });

  it("has a loading error", function () {
    this.renderer.render(<TaskDetailComponent
      fetchState={States.STATE_ERROR}
      hasHealth={false}
      task={this.model} />);

    var component = this.renderer.getRenderOutput();

    var content = ShallowUtils.findOne(component, "text-danger");

    expect(content).to.be.an.object;
  });

});

describe("Task List component", function () {

  beforeEach(function () {
    this.model = [{
      appId: "/app-1",
      id: "task-1"
    }, {
      appId: "/app-1",
      id: "task-2"
    }];

    this.renderer = TestUtils.createRenderer();

    this.renderer.render(<TaskListComponent
      currentPage={0}
      fetchState={States.STATE_SUCCESS}
      getTaskHealthMessage={function () {}}
      hasHealth={false}
      itemsPerPage={8}
      onTaskToggle={function () {}}
      selectedTasks={{}}
      tasks={this.model}
      toggleAllTasks={function () {}} />);

    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has correct TaskListItemComponents keys", function () {
    var tasklistitems =
      this.component.props.children[1].props.children[1].props.children[2];

    expect(tasklistitems[0].key).to.equal("task-1");
    expect(tasklistitems[1].key).to.equal("task-2");
  });

});


describe("Task Detail component", function () {

  beforeEach(function () {
    this.model = {
      appId: "/app-1",
      id: "task-123",
      slaveId: "20150720-125149-3839899402-5050-16758-S1"
    };
    InfoStore.info = {
      "version": "1.2.3",
      "frameworkId": "framework1",
      "leader": "leader1.dcos.io",
      "marathon_config": {
        "marathon_field_1": "mf1",
        "mesos_leader_ui_url": "http://leader1.dcos.io:5050"
      }
    };

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<TaskMesosUrlComponent task={this.model}/>);
    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has the correct mesos task url", function () {
    var url = this.component.props.href;
    expect(url).to.equal(
"http://leader1.dcos.io:5050/#/slaves/20150720-125149-3839899402-5050-\
16758-S1/frameworks/framework1/executors/task-123");
  });
});
