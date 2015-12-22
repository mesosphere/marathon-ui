var _ = require("underscore");
var expect = require("chai").expect;
var expectAsync = require("./helpers/expectAsync");
var nock = require("nock");
var shallow = require("enzyme").shallow;

var React = require("react/addons");

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

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Tasks", function () {

  beforeEach(function (done) {
    var nockResponse = {
      app: {
        id: "/app-1",
        tasks: [
          {
            id: "task-1",
            appId: "/app-1"
          },
          {
            id: "task-2",
            appId: "/app-1"
          }
        ]
      }
    };

    nock(config.apiURL)
      .get("/v2/apps//app-1")
      .query({embed: "app.taskStats"})
      .reply(200, nockResponse);

    AppsStore.once(AppsEvents.CHANGE, done);
    AppsActions.requestApp("/app-1");
  });

  describe("on single task deletion", function () {

    it("updates the tasks array on success", function (done) {
      nock(config.apiURL)
        .post("/v2/tasks/delete")
        .reply(200, "");

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
      nock(config.apiURL)
        .post("/v2/tasks/delete")
        .reply(404, {message: "Guru Meditation"});

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
      nock(config.apiURL)
        .post("/v2/tasks/delete")
        .query({scale: "true"})
        .reply(200, "");

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
      nock(config.apiURL)
        .post("/v2/tasks/delete")
        .reply(200, "");

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(0);
        }, done);
      });

      TasksActions.deleteTasks("/app-1", ["task-1", "task-2"]);
    });

    it("handles failure gracefully", function (done) {
      nock(config.apiURL)
        .post("/v2/tasks/delete")
        .reply(404, {message: "Guru Meditation"});

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
      nock(config.apiURL)
        .post("/v2/tasks/delete")
        .query({scale: "true"})
        .reply(200, "");

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(0);
        }, done);
      });

      TasksActions.deleteTasksAndScale("/app-1", ["task-1", "task-2"]);
    });

    it("handles failure gracefully", function (done) {
      nock(config.apiURL)
        .post("/v2/tasks/delete")
        .query({scale: "true"})
        .reply(404, {message: "Guru Meditation"});

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

  before(function () {
    var model = {
      appId: "/app-1",
      id: "task-123",
      host: "host-1",
      ports: [1, 2, 3],
      status: "status-0",
      updatedAt: "2015-06-29T14:11:58.709Z",
      version: "2015-06-29T13:54:24.171Z"
    };

    this.component = shallow(
      <TaskListItemComponent appId={"/app-1"}
        hasHealth={true}
        taskHealthMessage="Healthy"
        isActive={false}
        onToggle={()=>{}}
        task={model} />
    );
  });

  it("has the correct task id", function () {
    expect(this.component
      .find("td")
      .at(1)
      .children()
      .first()
      .text()
    ).to.equal("task-123");
  });

  it("has correct health message", function () {
    expect(this.component.find("td").at(2).text()).to.equal("Healthy");
  });

  it("has the correct status", function () {
    expect(this.component.find("td").at(3).text()).to.equal("status-0");
  });

  it("has the correct version", function () {
    expect(this.component
      .find("td")
      .at(6)
      .children()
      .first()
      .props()
      .title
    ).to.equal("2015-06-29T13:54:24.171Z");
  });

  it("has the correct update timestamp", function () {
    var cellProps = this.component
      .find("td")
      .at(7)
      .children()
      .first()
      .props();
    expect(cellProps.title).to.equal("2015-06-29T14:11:58.709Z");
    expect(cellProps.dateTime).to.equal("2015-06-29T14:11:58.709Z");
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

  before(function () {
    this.model = Object.assign({}, baseModel);

    this.component = shallow(
      <TaskDetailComponent appId={this.model.appId}
        fetchState={States.STATE_SUCCESS}
        hasHealth={false}
        task={this.model} />
    );
  });

  it("has the correct status", function () {
    expect(this.component
      .find(".task-details")
      .children()
      .at(10)
      .text()
    ).to.equal("status-0");
  });

  it("has the correct timefields", function () {
    var TimeFieldComponent = require("../js/components/TimeFieldComponent");
    var timeFields = this.component
      .find(".task-details")
      .find(TimeFieldComponent);
    var stagedAt = timeFields.first().props().time;
    var startedAt = timeFields.at(1).props().time;

    expect(stagedAt).to.equal("2015-06-29T14:11:58.709Z");
    expect(startedAt).to.equal("2015-06-29T14:11:58.709Z");
  });

  it("has the correct version", function () {
    var version = this.component
      .find(".task-details")
      .children()
      .at(14)
      .find("time")
      .props()
      .dateTime;
    expect(version).to.equal("2015-06-29T13:54:24.171Z");
  });

  it("has a loading error", function () {
    var component = shallow(<TaskDetailComponent
      appId={this.model.appId}
      fetchState={States.STATE_ERROR}
      hasHealth={false}
      task={this.model} />);
    expect(component.find(".text-danger").length).to.equal(1);
  });

  describe("with host and ports", function () {
    before(function () {
      this.model = Object.assign({}, baseModel, {
        host: "host-1",
        ports: [1, 2, 3]
      });

      this.component = shallow(
        <TaskDetailComponent appId={this.model.appId}
          fetchState={States.STATE_SUCCESS}
          hasHealth={false}
          task={this.model} />
      );
    });

    it("has the correct host", function () {
      expect(this.component
        .find(".task-details")
        .children()
        .at(1)
        .text()
      ).to.equal("host-1");
    });

    it("has the correct ports", function () {
      expect(this.component
          .find(".task-details")
          .children()
          .at(4)
          .text()
      ).to.equal("[1,2,3]");
    });

    it("has the correct endpoints", function () {
      var list = this.component.find(".task-details");

      var endpoints = [
        list.children().at(6).text(),
        list.children().at(7).text(),
        list.children().at(8).text()
      ];
      expect(endpoints).to.deep.equal(["host-1:1", "host-1:2", "host-1:3"]);
    });
  });

  describe("with IP per container", function () {
    before(function (done) {
      var nockResponse = {
        app: {
          id: "/app-1",
          ipAddress: {
            labels: {
              "pool": "1.1.1.1/24"
            },
            discovery: {
              ports: [
                {"number": 8080, "name": "http", "protocol": "tcp"},
                {"number": 8081, "name": "http", "protocol": "tcp"}
              ]
            }
          }
        }
      };

      nock(config.apiURL)
        .get("/v2/apps//app-1")
        .query({embed: "app.taskStats"})
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, () => {
        this.model = Object.assign({}, baseModel, {
          host: "example.com",
          ipAddresses: [
            {
              "protocol": "IPv4",
              "ipAddress": "127.0.0.1"
            }
          ]
        });

        this.component = shallow(
          <TaskDetailComponent appId={this.model.appId}
            fetchState={States.STATE_SUCCESS}
            hasHealth={false}
            task={this.model} />
        );
        done();
      });

      AppsActions.requestApp("/app-1");
    });

    it("has the correct host", function () {
      expect(this.component
        .find(".task-details")
        .children()
        .at(1)
        .text()
      ).to.equal("example.com");
    });

    it("has the correct ip address", function () {
      expect(this.component
        .find(".task-details")
        .children()
        .at(3)
        .text()
      ).to.equal("127.0.0.1");
    });

    it("has the correct ports", function () {
      expect(this.component
          .find(".task-details")
          .children()
          .at(5)
          .text()
      ).to.equal("[]");
    });

    it("has the correct endpoints", function () {
      var details = this.component.find(".task-details").children();

      var endpoints = [
        details.at(7).text(),
        details.at(8).text()
      ];
      expect(endpoints).to.deep.equal(["127.0.0.1:8080", "127.0.0.1:8081"]);
    });
  });

});

describe("Task List component", function () {

  before(function () {
    this.model = [{
      appId: "/app-1",
      id: "task-1"
    }, {
      appId: "/app-1",
      id: "task-2"
    }];

    this.component = shallow(
      <TaskListComponent currentPage={0}
        fetchState={States.STATE_SUCCESS}
        getTaskHealthMessage={() => {}}
        hasHealth={false}
        itemsPerPage={8}
        onTaskToggle={() => {}}
        selectedTasks={{}}
        tasks={this.model}
        toggleAllTasks={() => {}} />
    );
  });

  it("has correct TaskListItemComponents keys", function () {
    var taskList = this.component.find(TaskListItemComponent);
    expect(taskList.at(0).props().task.id).to.equal("task-1");
    expect(taskList.at(1).props().task.id).to.equal("task-2");
  });

});

describe("Task Mesos Url component", function () {

  before(function () {
    this.model = {
      appId: "/app-1",
      id: "task-123",
      slaveId: "20150720-125149-3839899402-5050-16758-S1"
    };
    InfoStore.info = {
      version: "1.2.3",
      frameworkId: "framework1",
      leader: "leader1.dcos.io",
      marathon_config: {
        marathon_field_1: "mf1",
        mesos_leader_ui_url: "http://leader1.dcos.io:5050"
      }
    };

    this.component = shallow(<TaskMesosUrlComponent task={this.model}/>);
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("has the correct mesos task url", function () {
    var url = this.component.props().href;
    expect(url).to.equal(
      "http://leader1.dcos.io:5050/#/slaves/20150720-125149-3839899402-5050-" +
      "16758-S1/frameworks/framework1/executors/task-123"
    );
  });

  it("has the correct mesos task url when mesosUrl has trailing slash",
      function () {
    InfoStore.info.marathon_config.mesos_leader_ui_url =
      "http://leader1.dcos.io:5050/";
    this.component.setProps({task: this.model});

    var url = this.component.props().href;
    expect(url).to.equal(
      "http://leader1.dcos.io:5050/#/slaves/20150720-125149-3839899402-5050-" +
      "16758-S1/frameworks/framework1/executors/task-123"
    );
  });
});

describe("Task file list component", function () {

  before(function (done) {
    this.model = {
      appId: "/app-1",
      id: "task-id",
      slaveId: "agent-id"
    };

    MesosStore.resetStore();

    MesosStore.once(MesosEvents.CHANGE, () => {
      this.component = shallow(<TaskFileListComponent task={this.model}/>);
      done();
    });

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

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("has the correct number of files/rows", function () {
    expect(this.component.find("tbody").find("tr").length).to.equal(1);
  });

  it("has correct download link", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
      .find("td")
      .first()
      .find("a.btn")
      .props()
      .href
    ).to.equal("//mesos-agent:5050/files/download?" +
      "path=%2Ffile%2Fpath%2Ffilename");
  });

  it("has correct permissions", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
      .find("td")
      .at(1)
      .text()
    ).to.equal("-rw-r--r--");
  });

  it("has correct nlink", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
      .find("td")
      .at(2)
      .text()
    ).to.equal("1");
  });

  it("has correct uid", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
        .find("td")
        .at(3)
        .text()
    ).to.equal("user");
  });

  it("has correct gid", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
        .find("td")
        .at(4)
        .text()
    ).to.equal("staff");
  });

  it("has the correct file size", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
        .find("td")
        .at(5)
        .text()
    ).to.equal("506 B");
  });

  it("has correct mtime", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    var mtimeCell = firstTableRow.find("td").at(6);
    expect(mtimeCell.text())
      .to.equal(new Date(1449573729).toLocaleString());
    expect(mtimeCell.find("time").props().dateTime)
      .to.equal("1970-01-17T18:39:33.729Z");
  });

});

describe("Task file download component", function () {

  before(function (done) {
    this.model = {
      appId: "/app-1",
      id: "task-id",
      slaveId: "agent-id"
    };

    MesosStore.resetStore();

    MesosStore.once(MesosEvents.CHANGE, () => {
      this.component = shallow(
        <TaskFileDownloadComponent task={this.model} fileName="filename"/>
      );
      done();
    });

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

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("has correct download link", function () {
    expect(this.component.props().href)
      .to.equal("//mesos-agent:5050/files/download?" +
      "path=%2Ffile%2Fpath%2Ffilename");
  });

  it("has correct label", function () {
    expect(this.component.text().trim())
      .to.equal("filename");
  });

});
