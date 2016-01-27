import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import AppHealthBarComponent from "../../js/components/AppHealthBarComponent";
import HealthStatus from "../../js/constants/HealthStatus";

describe("AppHealthBarComponent", function () {

  describe("for a running app with 5 instances", function () {

    before(function () {
      var model = {
        id: "app-123",
        instances: 5,
        health: [
          {state: HealthStatus.HEALTHY, quantity: 2},
          {state: HealthStatus.UNHEALTHY, quantity: 2},
          {state: HealthStatus.UNKNOWN, quantity: 1},
          {state: HealthStatus.STAGED, quantity: 1},
          {state: HealthStatus.OVERCAPACITY, quantity: 2},
          {state: HealthStatus.UNSCHEDULED, quantity: 2}
        ]
      };

      this.component = shallow(<AppHealthBarComponent model={model} />);
    });

    after(function () {
      this.component = null;
    });

    it("health bar for healthy tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(0)
        .props()
        .style.width;
      expect(width).to.equal("20%");
    });

    it("health bar for unhealthy tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(1)
        .props()
        .style.width;
      expect(width).to.equal("20%");
    });

    it("health bar for running tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(2)
        .props()
        .style.width;
      expect(width).to.equal("10%");
    });

    it("health bar for staged tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(3)
        .props()
        .style.width;
      expect(width).to.equal("10%");
    });

    it("health bar for over capacity tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(4)
        .props()
        .style.width;
      expect(width).to.equal("20%");
    });

    it("health bar for unscheduled tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(5)
        .props()
        .style.width;
      expect(width).to.equal("20%");
    });
  });

  describe("running app scaled down to 0 instances from 2", function () {

    before(function () {
      var model = {
        id: "app-123",
        instances: 0,
        health: [
          {state: HealthStatus.HEALTHY, quantity: 2},
          {state: HealthStatus.UNHEALTHY, quantity: 0},
          {state: HealthStatus.UNKNOWN, quantity: 0},
          {state: HealthStatus.STAGED, quantity: 0},
          {state: HealthStatus.OVERCAPACITY, quantity: 2},
          {state: HealthStatus.UNSCHEDULED, quantity: 0}
        ]
      };
      this.component = shallow(<AppHealthBarComponent model={model}/>);
    });

    after(function () {
      this.component = null;
    });

    it("health bar for healthy tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(0)
        .props()
        .style.width;
      expect(width).to.equal("50%");
    });

    it("health bar for unhealthy tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(1)
        .props()
        .style.width;
      expect(width).to.equal("0%");
    });

    it("health bar for running tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(2)
        .props()
        .style.width;
      expect(width).to.equal("0%");
    });

    it("health bar for staged tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(3)
        .props()
        .style.width;
      expect(width).to.equal("0%");
    });

    it("health bar for over capacity tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(4)
        .props()
        .style.width;
      expect(width).to.equal("50%");
    });

    it("health bar for unscheduled tasks has correct width", function () {
      var width = this.component
        .find(".progress-bar")
        .at(5)
        .props()
        .style.width;
      expect(width).to.equal("0%");
    });

  });

  describe("running app scaled down to 5 instances from 10", function () {

      before(function () {
        var model = {
          id: "app-123",
          instances: 5,
          health: [
            {state: HealthStatus.HEALTHY, quantity: 10},
            {state: HealthStatus.UNHEALTHY, quantity: 0},
            {state: HealthStatus.UNKNOWN, quantity: 0},
            {state: HealthStatus.STAGED, quantity: 0},
            {state: HealthStatus.OVERCAPACITY, quantity: 5},
            {state: HealthStatus.UNSCHEDULED, quantity: 0}
          ]
        };

        this.component = shallow(<AppHealthBarComponent model={model}/>);
      });

      after(function () {
        this.component = null;
      });

      it("health bar for healthy tasks has correct width", function () {
        var width = this.component
          .find(".progress-bar")
          .at(0)
          .props()
          .style.width;
        expect(width).to.equal("66.666%");
      });

      it("health bar for unhealthy tasks has correct width", function () {
        var width = this.component
          .find(".progress-bar")
          .at(1)
          .props()
          .style.width;
        expect(width).to.equal("0%");
      });

      it("health bar for running tasks has correct width", function () {
        var width = this.component
          .find(".progress-bar")
          .at(2)
          .props()
          .style.width;
        expect(width).to.equal("0%");
      });

      it("health bar for staged tasks has correct width", function () {
        var width = this.component
          .find(".progress-bar")
          .at(3)
          .props()
          .style.width;
        expect(width).to.equal("0%");
      });

      it("health bar for over capacity tasks has correct width", function () {
        var width = this.component
          .find(".progress-bar")
          .at(4)
          .props()
          .style.width;
        expect(width).to.equal("33.333%");
      });

      it("health bar for unscheduled tasks has correct width", function () {
        var width = this.component
          .find(".progress-bar")
          .at(5)
          .props()
          .style.width;
        expect(width).to.equal("0%");
      });

    }
  );
});
