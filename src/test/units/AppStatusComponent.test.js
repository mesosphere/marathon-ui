import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import AppStatus from "../../js/constants/AppStatus";
import QueueStore from "../../js/stores/QueueStore";
import AppStatusComponent from "../../js/components/AppStatusComponent";

describe("AppStatusComponent", function () {

  describe("on delayed status", function () {

    before(function () {
      var model = {
        id: "app-1",
        deployments: [],
        tasksRunning: 4,
        instances: 5,
        mem: 100,
        cpus: 4,
        status: AppStatus.DELAYED
      };

      QueueStore.queue = [
        {
          app: {id: "app-1"},
          delay: {timeLeftSeconds: 173}
        }
      ];

      this.component = shallow(<AppStatusComponent model={model} />);
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
        id: "app-1",
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
