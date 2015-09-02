var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");
var Util = require("../js/helpers/Util");
var appScheme = require("../js/stores/appScheme");
var InfoStore = require("../js/stores/InfoStore");
var AppsStore = require("../js/stores/AppsStore");
var AppDebugInfoComponent = require("../js/components/AppDebugInfoComponent");
var AppTaskStatsListComponent =
  require("../js/components/AppTaskStatsListComponent");

var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("App debug info component", function () {

  describe("Last task failure", function () {

    afterEach(function () {
      this.renderer.unmount();
    });

    it("should show failed task", function () {
      InfoStore.info = {
        "version": "1.2.3",
        "frameworkId": "framework1",
        "leader": "leader1.dcos.io",
        "marathon_config": {
          "marathon_field_1": "mf1",
          "mesos_master_url": "http://leader1.dcos.io:5050"
        }
      };
      var app = Util.extendObject(appScheme, {
        id: "/python",
        lastTaskFailure: {
          appId: "/python",
          host: "slave1.dcos.io",
          message: "Slave slave1.dcos.io removed",
          state: "TASK_LOST",
          taskId: "python.83c0a69b-256a-11e5-aaed-fa163eaaa6b7",
          timestamp: "2015-08-05T09:08:56.349Z",
          version: "2015-07-06T12:37:28.774Z"
        }
      });

      AppsStore.apps = [app];

      this.renderer = TestUtils.createRenderer();
      this.renderer.render(<AppDebugInfoComponent appId={app.id} />);
      this.component = this.renderer.getRenderOutput();

      var element = this.component
        .props.children[2].props.children[1].props.children.props.children;

      var taskId = element[1].props.children[0];
      var state = element[3].props.children[0];
      var message = element[5].props.children[0];
      var host = element[7].props.children[0];
      var timestamp = element[9].props.children[0].props.children;
      var version = element[11].props.children[0].props.children;

      expect(taskId).to.equal("python.83c0a69b-256a-11e5-aaed-fa163eaaa6b7");
      expect(state).to.equal("TASK_LOST");
      expect(message).to.equal("Slave slave1.dcos.io removed");
      expect(host).to.equal("slave1.dcos.io");
      expect(timestamp).to.equal("2015-08-05T09:08:56.349Z");
      expect(version).to.equal("2015-07-06T12:37:28.774Z");
    });

    it("should show unspecified field on empty values", function () {
      var app = Util.extendObject(appScheme, {
        id: "/python",
        lastTaskFailure: {
          appId: "/python",
          host: "slave1.dcos.io",
          taskId: "python.83c0a69b-256a-11e5-aaed-fa163eaaa6b7",
          timestamp: "2015-08-05T09:08:56.349Z",
          version: "2015-07-06T12:37:28.774Z"
        }
      });

      AppsStore.apps = [app];

      this.renderer = TestUtils.createRenderer();
      this.renderer.render(<AppDebugInfoComponent appId={app.id} />);
      this.component = this.renderer.getRenderOutput();

      var element = this.component
        .props.children[2].props.children[1].props.children.props.children;

      var state = element[3];
      var message = element[5];

      expect(state.type.displayName).to.equal("UnspecifiedNodeComponent");
      expect(message.type.displayName).to.equal("UnspecifiedNodeComponent");
    });

    it("should show message when app never failed", function () {

      this.appId = "/python";
      var app = Util.extendObject(appScheme, {
        id: "/python"
      });

      AppsStore.apps = [app];

      this.renderer = TestUtils.createRenderer();
      this.renderer.render(<AppDebugInfoComponent appId={this.appId} />);
      this.component = this.renderer.getRenderOutput();

      var message = this.component
        .props.children[2].props.children[1].props.children.props.children;

      expect(message).to.equal("This app does not have failed tasks");
    });
  });

  describe("Last configuration changes", function () {

    beforeEach(function () {
      var app = Util.extendObject(appScheme, {
        id: "/app-1",
        versionInfo: {
          lastScalingAt: "2015-08-11T13:57:11.238Z",
          lastConfigChangeAt: "2015-08-11T13:57:11.238Z"
        }
      });

      AppsStore.apps = [app];

      this.renderer = TestUtils.createRenderer();
      this.renderer.render(<AppDebugInfoComponent appId={app.id} />);
      this.component = this.renderer.getRenderOutput();
    });

    afterEach(function () {
      this.renderer.unmount();
    });

    it("scale or restart field has no recent operation", function () {
      var message = this.component
        .props.children[1].props.children[1].props.children.props.children[1]
        .props.children.props.children;

      expect(message).to.equal("No operation since last config change");
    });

    it("last configuration change has correct date", function () {
      var message = this.component
        .props.children[1].props.children[1].props.children.props.children[3]
        .props.children[0].props.children;

      expect(message).to.equal("2015-08-11T13:57:11.238Z");
    });

  });

  describe("App Tasks Stats List component", function () {
    afterEach(function () {
      this.renderer.unmount();
    });

    it("displayes given amount of categories", function () {
      var app = Util.extendObject(appScheme, {
        id: "/app-1",
        "taskStats": {
          "startedAfterLastScaling": {
            "stats": {}
          },
          "withLatestConfig": {
            "stats": {}
          },
          "withOutdatedConfig": {
            "stats": {}
          },
          "totalSummary": {
            "stats": {}
          }
        }
      });

      this.renderer = TestUtils.createRenderer();
      this.renderer.render(<AppTaskStatsListComponent
        taskStatsList={app.taskStats} />);
      this.component = this.renderer.getRenderOutput();

      expect(this.component.props.children[1].props.caption)
        .to.equal("Started After Last Scaling");
      expect(this.component.props.children[2].props.caption)
        .to.equal("With Latest Config");
      expect(this.component.props.children[3].props.caption)
        .to.equal("With Outdated Config");
      expect(this.component.props.children[4].props.caption)
        .to.equal("Total Summary");
    });
  });

});
