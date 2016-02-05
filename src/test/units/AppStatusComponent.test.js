import {expect} from "chai";
import nock from "nock";
import {shallow} from "enzyme";
import React from "react/addons";

import AppStatus from "../../js/constants/AppStatus";
import AppStatusComponent from "../../js/components/AppStatusComponent";
import QueueActions from "../../js/actions/QueueActions";
import QueueEvents from "../../js/events/QueueEvents";
import QueueStore from "../../js/stores/QueueStore";

import config from "../../js/config/config";

describe("AppStatusComponent", function () {

  describe("on delayed status", function () {

    before(function (done) {
      var model = {
        id: "/app-1",
        deployments: [],
        tasksRunning: 4,
        instances: 5,
        mem: 100,
        cpus: 4,
        status: AppStatus.DELAYED
      };

      var nockResponse = {
        "queue": [
          {
            "app": {
              "id": "/app-1",
              "maxLaunchDelaySeconds": 3600
            },
            "delay": {
              "overdue": false,
              "timeLeftSeconds": 173
            }
          }
        ]
      };

      nock(config.apiURL)
        .get("/v2/queue")
        .reply(200, nockResponse);

      QueueStore.once(QueueEvents.CHANGE, () => {
        this.component = shallow(<AppStatusComponent model={model} />);
        done();
      });

      QueueActions.requestQueue();
    });

    it("has correct status description", function () {
      expect(this.component.text()).to.equal("Delayed");
    });

    it("has correct title", function () {
      var expectedTitle = "Task execution failed, delayed for 3 minutes.";
      expect(this.component.props().title).to.equal(expectedTitle);
    });
  });

  describe("on running status", function () {

    before(function () {
      var model = {
        id: "/app-1",
        deployments: [],
        tasksRunning: 4,
        instances: 5,
        mem: 100,
        cpus: 4,
        status: AppStatus.RUNNING
      };

      this.component = shallow(<AppStatusComponent model={model} />);
    });

    it("has correct status description", function () {
      expect(this.component.text()).to.equal("Running");
    });
  });

});
