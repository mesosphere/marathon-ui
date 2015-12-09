var _ = require("underscore");
var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");
var AppDispatcher = require("../js/AppDispatcher");
var States = require("../js/constants/States");
var AppsActions = require("../js/actions/AppsActions");
var AppsStore = require("../js/stores/AppsStore");
var AppsEvents = require("../js/events/AppsEvents");
var InfoStore = require("../js/stores/InfoStore");
var MesosStore = require("../js/stores/MesosStore");
var MesosEvents = require("../js/events/MesosEvents");
var TasksActions = require("../js/actions/TasksActions");
var TasksEvents = require("../js/events/TasksEvents");
var TaskListItemComponent = require("../js/components/TaskListItemComponent");
var TaskDetailComponent = require("../js/components/TaskDetailComponent");
var TaskListComponent = require("../js/components/TaskListComponent");
var TaskMesosUrlComponent = require("../js/components/TaskMesosUrlComponent");
var TaskFileListComponent = require("../js/components/TaskFileListComponent");
var TaskFileDownloadComponent =
  require("../js/components/TaskFileDownloadComponent");

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
      hasHealth={true}
      taskHealthMessage="Healthy"
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

  it("has correct health sate", function () {
    var cellContent =
      ShallowUtils.getText(this.component.props.children[2]);

    expect(cellContent).to.equal("Healthy");
  });

  it("has the correct status", function () {
    var cellContent =
      ShallowUtils.getText(this.component.props.children[3].props.children);

    expect(cellContent).to.equal("status-0");
  });

  it("has the correct version", function () {
    var cellContent =
      this.component.props.children[6].props.children.props;

    expect(cellContent.title).to.equal("2015-06-29T13:54:24.171Z");
  });

  it("has the correct update timestamp", function () {
    var cellContent =
      this.component.props.children[7].props.children.props;

    expect(cellContent.title).to.equal("2015-06-29T14:11:58.709Z");
    expect(cellContent.dateTime).to.equal("2015-06-29T14:11:58.709Z");
  });

});

describe("Task Detail component", function () {
  var baseModel = {
    appId: "/app-1",
    id: "task-123",
    status: "status-0",
    updatedAt: "2015-06-29T14:11:58.709Z",
    stagedAt: "2015-06-29T14:11:58.709Z",
    startedAt: "2015-06-29T14:11:58.709Z",
    version: "2015-06-29T13:54:24.171Z",
    host: "example.com"
  };

  beforeEach(function () {
    this.model = Object.assign({}, baseModel);

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<TaskDetailComponent
      appId={this.model.appId}
      fetchState={States.STATE_SUCCESS}
      hasHealth={false}
      task={this.model} />);
    this.component = this.renderer.getRenderOutput();
    this.taskDetails = this.component.props.children[1].props.children[0];
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has the correct status", function () {
    var content = ShallowUtils.getText(this.taskDetails.props.children[10]);
    expect(content).to.equal("status-0");
  });

  it("has the correct timefields", function () {
    var stagedAt = this.taskDetails.props.children[11][0].props;
    var startedAt = this.taskDetails.props.children[11][1].props;
    expect(stagedAt.time).to.equal("2015-06-29T14:11:58.709Z");
    expect(startedAt.time).to.equal("2015-06-29T14:11:58.709Z");
  });

  it("has the correct version", function () {
    var version = this.taskDetails.props.children[13].props.children.props;
    expect(version.dateTime).to.equal("2015-06-29T13:54:24.171Z");
  });

  it("has a loading error", function () {
    this.renderer.render(<TaskDetailComponent
      appId={this.model.appId}
      fetchState={States.STATE_ERROR}
      hasHealth={false}
      task={this.model} />);

    var component = this.renderer.getRenderOutput();

    var content = ShallowUtils.findOne(component, "text-danger");

    expect(content).to.be.an.object;
  });

  describe("with host and ports", function () {
    before(function () {
      this.model = Object.assign({}, baseModel, {
        host: "host-1",
        ports: [1, 2, 3]
      });

      this.renderer = TestUtils.createRenderer();
      this.renderer.render(<TaskDetailComponent
        appId={this.model.appId}
        fetchState={States.STATE_SUCCESS}
        hasHealth={false}
        task={this.model} />);
      this.component = this.renderer.getRenderOutput();
      this.taskDetails = this.component.props.children[1].props.children[0];
    });

    after(function () {
      this.renderer.unmount();
    });

    it("has the correct host", function () {
      var content = ShallowUtils.getText(this.taskDetails.props.children[1]);
      expect(content).to.equal("host-1");
    });

    it("has the correct ports", function () {
      var content = ShallowUtils.getText(this.taskDetails.props.children[4]);
      expect(content).to.equal("[1,2,3]");
    });

    it("has the correct endpoints", function () {
      var list = this.taskDetails.props.children[6];
      var endpoints = [
        ShallowUtils.getText(list[0].props.children),
        ShallowUtils.getText(list[1].props.children),
        ShallowUtils.getText(list[2].props.children)
      ];
      expect(endpoints).to.deep.equal(["host-1:1", "host-1:2", "host-1:3"]);
    });
  });

  describe("with IP per container", function () {
    before(function () {
      this.model = Object.assign({}, baseModel, {
        "host": "example.com",
        "ipAddresses": [
          {
            "protocol": "IPv4",
            "ipAddress": "127.0.0.1"
          }
        ]
      });

      AppsStore.currentApp.ipAddress = {
        "labels": {
          "pool": "1.1.1.1/24"
        },
        "discovery": {
          "ports": [
            {"number": 8080, "name": "http", "protocol": "tcp"},
            {"number": 8081, "name": "http", "protocol": "tcp"}
          ]
        }
      };

      this.renderer = TestUtils.createRenderer();
      this.renderer.render(<TaskDetailComponent
        appId={this.model.appId}
        fetchState={States.STATE_SUCCESS}
        hasHealth={false}
        task={this.model} />);
      this.component = this.renderer.getRenderOutput();
      this.taskDetails = this.component.props.children[1].props.children[0];
    });

    after(function () {
      this.renderer.unmount();
      delete AppsStore.currentApp.ipAddress;
    });

    it("has the correct host", function () {
      var content = ShallowUtils.getText(this.taskDetails.props.children[1]);
      expect(content).to.equal("example.com");
    });

    it("has the correct ip address", function () {
      var content = ShallowUtils.getText(this.taskDetails.props.children[2][1]);
      expect(content).to.equal("127.0.0.1");
    });

    it("has the correct ports", function () {
      var content = ShallowUtils.getText(this.taskDetails.props.children[4]);
      expect(content).to.equal("[]");
    });

    it("has the correct endpoints", function () {
      var list = this.taskDetails.props.children[6];
      var endpoints = [
        ShallowUtils.getText(list[0].props.children),
        ShallowUtils.getText(list[1].props.children)
      ];
      expect(endpoints).to.deep.equal(["127.0.0.1:8080", "127.0.0.1:8081"]);
    });
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
      this.component.props.children[3].props.children[1].props.children[2];

    expect(tasklistitems[0].key).to.equal("task-1");
    expect(tasklistitems[1].key).to.equal("task-2");
  });

});

describe("Task Mesos Url component", function () {

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
      "http://leader1.dcos.io:5050/#/slaves/20150720-125149-3839899402-5050-" +
      "16758-S1/frameworks/framework1/executors/task-123"
    );
  });

  it("has the correct mesos task url when mesosUrl has trailing slash",
      function () {
    InfoStore.info.marathon_config.mesos_leader_ui_url =
      "http://leader1.dcos.io:5050/";

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<TaskMesosUrlComponent task={this.model}/>);
    this.component = this.renderer.getRenderOutput();
    var url = this.component.props.href;
    expect(url).to.equal(
      "http://leader1.dcos.io:5050/#/slaves/20150720-125149-3839899402-5050-" +
      "16758-S1/frameworks/framework1/executors/task-123"
    );
  });
});

describe("Task file list component", function () {

  beforeEach(function (done) {
    this.model = {
      appId: "/app-1",
      id: "task-id",
      slaveId: "agent-id"
    };

    this.renderer = TestUtils.createRenderer();

    MesosStore.once(MesosEvents.CHANGE, function (){
      this.renderer.render(<TaskFileListComponent task={this.model}/>);
      this.component = this.renderer.getRenderOutput();
      done();
    }.bind(this));

    AppDispatcher.dispatch({
      actionType: MesosEvents.REQUEST_VERSION_INFORMATION_COMPLETE,
      data: {
        version: "0.26.0"
      }
    });

    AppDispatcher.dispatch({
      actionType: MesosEvents.REQUEST_FILES_COMPLETE,
      data: {
        id: this.model.id,
        host: "//mesos-agent:5050",
        files: [{
          gid: "staff",
          mode: "-rw-r--r--",
          mtime: 1449573729,
          nlink: 1,
          path: "/file/path/filename",
          size: 506,
          uid: "user"
        }]
      }
    });

  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has the correct number of files/rows", function () {
    var tbody = this.component.props.children[1].props.children;
    expect(tbody.length).to.equal(1);
  });

  it("has correct download link", function () {
    var tableBody = this.component.props.children[1].props.children;
    var firstTableRow = tableBody[0].props.children;
    var idCell = firstTableRow[0].props.children;
    expect(idCell[1].props.href)
      .to.equal("//mesos-agent:5050/files/download?" +
        "path=%2Ffile%2Fpath%2Ffilename");
  });

  it("has correct permissions", function () {
    var tableBody = this.component.props.children[1].props.children;
    var firstTableRow = tableBody[0].props.children;
    var permissionsCell = firstTableRow[1].props.children;
    expect(permissionsCell.props.children).to.equal("-rw-r--r--");
  });

  it("has correct nlik", function () {
    var tableBody = this.component.props.children[1].props.children;
    var firstTableRow = tableBody[0].props.children;
    var nlinkCell = firstTableRow[2].props.children;
    expect(nlinkCell.props.children).to.equal(1);
  });

  it("has correct uid", function () {
    var tableBody = this.component.props.children[1].props.children;
    var firstTableRow = tableBody[0].props.children;
    var uidCell = firstTableRow[3].props.children;
    expect(uidCell.props.children).to.equal("user");
  });

  it("has correct gid", function () {
    var tableBody = this.component.props.children[1].props.children;
    var firstTableRow = tableBody[0].props.children;
    var gidCell = firstTableRow[4].props.children;
    expect(gidCell.props.children).to.equal("staff");
  });

  it("has the correct file size", function () {
    var tableBody = this.component.props.children[1].props.children;
    var firstTableRow = tableBody[0].props.children;
    var sizeCell = firstTableRow[5].props.children;
    expect(sizeCell.props.children).to.equal("506 B");
  });

  it("has correct mtime", function () {
    var tableBody = this.component.props.children[1].props.children;
    var firstTableRow = tableBody[0].props.children;
    var mtimeCell = firstTableRow[6].props.children;
    expect(mtimeCell.props.children).to.equal("1/17/1970, 7:39:33 PM");
    expect(mtimeCell.props.dateTime).to.equal("1970-01-17T18:39:33.729Z");
  });

});

describe("Task file download component", function () {

  beforeEach(function (done) {
    this.model = {
      appId: "/app-1",
      id: "task-id",
      slaveId: "agent-id"
    };

    this.renderer = TestUtils.createRenderer();

    MesosStore.once(MesosEvents.CHANGE, function () {
      this.renderer.render(
        <TaskFileDownloadComponent task={this.model} fileName="filename"/>
      );
      this.component = this.renderer.getRenderOutput();
      done();
    }.bind(this));

    AppDispatcher.dispatch({
      actionType: MesosEvents.REQUEST_VERSION_INFORMATION_COMPLETE,
      data: {
        version: "0.26.0"
      }
    });

    AppDispatcher.dispatch({
      actionType: MesosEvents.REQUEST_FILES_COMPLETE,
      data: {
        id: this.model.id,
        host: "//mesos-agent:5050",
        files: [{
          gid: "staff",
          mode: "-rw-r--r--",
          mtime: 1449573729,
          nlink: 1,
          path: "/file/path/filename",
          size: 506,
          uid: "user"
        }]
      }
    });

  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has correct download link", function () {
    expect(this.component.props.href)
      .to.equal("//mesos-agent:5050/files/download?" +
      "path=%2Ffile%2Fpath%2Ffilename");
  });

  it("has correct lable", function () {
    expect(this.component.props.children[2])
      .to.equal("filename");
  });

});
