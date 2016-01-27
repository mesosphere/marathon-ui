import {expect} from "chai";
import {shallow} from "enzyme";

import config from "../../js/config/config";

import React from "../../../node_modules/react/addons";
import Util from "../../js/helpers/Util";
import appScheme from "../../js/stores/schemes/appScheme";
import InfoStore from "../../js/stores/InfoStore";
import AppsStore from "../../js/stores/AppsStore";
import AppDebugInfoComponent from "../../js/components/AppDebugInfoComponent";

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("App debug info component", function () {

  describe("Last task failure", function () {

    afterEach(function () {
      this.component.instance().componentWillUnmount();
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
      this.component = shallow(<AppDebugInfoComponent appId={app.id} />);
      var nodes = this.component.find("dd");

      var taskId = nodes.at(0).text().trim();
      var state = nodes.at(1).text().trim();
      var message = nodes.at(2).text().trim();
      var host = nodes.at(3).text().trim();
      var timestamp = nodes.at(4).find("span").text().trim();
      var version = nodes.at(5).find("span").text().trim();

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
      this.component = shallow(<AppDebugInfoComponent appId={app.id} />);
      var nodes = this.component.find("dl").children();

      var state = nodes.at(3).type().displayName;
      var message = nodes.at(5).type().displayName;

      expect(state).to.equal("UnspecifiedNodeComponent");
      expect(message).to.equal("UnspecifiedNodeComponent");
    });

    it("should show message when app never failed", function () {
      this.appId = "/python";
      var app = Util.extendObject(appScheme, {
        id: "/python"
      });

      AppsStore.apps = [app];

      this.component = shallow(<AppDebugInfoComponent appId={this.appId} />);
      var message = this.component.children().at(2).find(".panel-body").text();
      expect(message).to.equal("This app does not have failed tasks");
    });
  });

  describe("Last configuration changes", function () {

    before(function () {
      var app = Util.extendObject(appScheme, {
        id: "/app-1",
        versionInfo: {
          lastScalingAt: "2015-08-11T13:57:11.238Z",
          lastConfigChangeAt: "2015-08-11T13:57:11.238Z"
        }
      });

      AppsStore.apps = [app];
      this.component = shallow(<AppDebugInfoComponent appId={app.id} />);
    });

    after(function () {
      this.component.instance().componentWillUnmount();
    });

    it("scale or restart field has no recent operation", function () {
      var message = this.component
        .children()
        .at(1)
        .find(".panel-body")
        .find("dd")
        .at(0)
        .text();
      expect(message).to.equal("No operation since last config change");
    });

    it("last configuration change has correct date", function () {
      var message = this.component
        .children()
        .at(1)
        .find(".panel-body")
        .find("dd")
        .at(1)
        .find("span")
        .text();
      expect(message).to.equal("2015-08-11T13:57:11.238Z");
    });

  });

});
