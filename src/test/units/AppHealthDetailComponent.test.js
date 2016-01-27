import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import AppHealthDetailComponent
  from "../../js/components/AppHealthDetailComponent";
import HealthStatus from "../../js/constants/HealthStatus";

describe("AppHealthDetailComponent", function () {

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

      this.component = shallow(
        <AppHealthDetailComponent
          className="list-unstyled"
          fields={[
              HealthStatus.HEALTHY,
              HealthStatus.UNHEALTHY,
              HealthStatus.UNKNOWN,
              HealthStatus.STAGED,
              HealthStatus.OVERCAPACITY,
              HealthStatus.UNSCHEDULED
            ]}
          model={model}/>
      );
    });

    after(function () {
      this.component = null;
    });

    it("Healthy tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-healthy")
          .text()
      ).to.equal("2 Healthy(40%)");
    });

    it("Unhealthy tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-unhealthy")
          .text()
      ).to.equal("2 Unhealthy(40%)");
    });

    it("Unknown tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-unknown")
          .text()
      ).to.equal("1 Unknown(20%)");
    });

    it("Overcapacity tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-over-capacity")
          .text()
      ).to.equal("2 Over Capacity(40%)");
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

      this.component = shallow(
        <AppHealthDetailComponent
          className="list-unstyled"
          fields={[
              HealthStatus.HEALTHY,
              HealthStatus.UNHEALTHY,
              HealthStatus.UNKNOWN,
              HealthStatus.STAGED,
              HealthStatus.OVERCAPACITY,
              HealthStatus.UNSCHEDULED
            ]}
          model={model}/>
      );
    });

    after(function () {
      this.component = null;
    });

    it("Healthy tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-healthy")
          .text()
      ).to.equal("2 Healthy(200%)");
    });

    it("Unhealthy tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-unhealthy")
          .text()
      ).to.equal("0 Unhealthy(0%)");
    });

    it("Unknown tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-unknown")
          .text()
      ).to.equal("0 Unknown(0%)");
    });

    it("Overcapacity tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-over-capacity")
          .text()
      ).to.equal("2 Over Capacity(200%)");
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

      this.component = shallow(
        <AppHealthDetailComponent
          className="list-unstyled"
          fields={[
              HealthStatus.HEALTHY,
              HealthStatus.UNHEALTHY,
              HealthStatus.UNKNOWN,
              HealthStatus.STAGED,
              HealthStatus.OVERCAPACITY,
              HealthStatus.UNSCHEDULED
            ]}
          model={model}/>
      );
    });

    after(function () {
      this.component = null;
    });

    it("Healthy tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-healthy")
          .text()
      ).to.equal("10 Healthy(200%)");
    });

    it("Unhealthy tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-unhealthy")
          .text()
      ).to.equal("0 Unhealthy(0%)");
    });

    it("Unknown tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-unknown")
          .text()
      ).to.equal("0 Unknown(0%)");
    });

    it("Overcapacity tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-over-capacity")
          .text()
      ).to.equal("5 Over Capacity(100%)");
    });

  });

});
