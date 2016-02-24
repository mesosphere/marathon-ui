import {expect} from "chai";
import {shallow} from "enzyme";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";
import sinon from "sinon";

import config from "../../js/config/config";

import React from "react/addons";
import Util from "../../js/helpers/Util";
import appScheme from "../../js/stores/schemes/appScheme";
import AppsActions from "../../js/actions/AppsActions";
import AppsEvents from "../../js/events/AppsEvents";
import AppsStore from "../../js/stores/AppsStore";
import AppStatus from "../../js/constants/AppStatus";
import AppPageComponent from "../../js/components/AppPageComponent";
import States from "../../js/constants/States";
import TaskViewComponent from "../../js/components/TaskViewComponent";

describe("AppPageComponent", function () {

  before(function (done) {
    var app = Util.extendObject(appScheme, {
      id: "/test-app-1",
      healthChecks: [{path: "/", protocol: "HTTP"}],
      status: AppStatus.RUNNING,
      tasks: [
        // Unhealthy status
        {
          id: "test-task-1",
          appId: "/test-app-1",
          healthCheckResults: [{
            alive: false,
            taskId: "test-task-1"
          }]
        },
        // Unknown status
        {
          id: "test-task-2",
          appId: "/test-app-1"
        },
        // Healthy status
        {
          id: "test-task-3",
          appId: "/test-app-1",
          healthCheckResults: [{
            alive: true,
            firstSuccess: new Date(),
            taskId: "test-task-3"
          }]
        }
      ]
    });

    nock(config.apiURL)
      .get("/v2/apps//test-app-1")
      .query({embed: "app.taskStats"})
      .reply(200, {
        app: app
      });

    var context = {
      router: {
        getCurrentParams: function () {
          return {
            appId: "/test-app-1"
          };
        }
      }
    };

    AppsStore.once(AppsEvents.CHANGE, () => {
      this.component = shallow(<AppPageComponent />, {context});
      done();
    });

    AppsActions.requestApp("/test-app-1");
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("gets the correct app id from the router", function () {
    expect(this.component.state("appId")).to.equal("/test-app-1");
  });

  it("returns the right health message for failing tasks", function () {
    expect(this.component
             .instance()
             .getTaskHealthMessage("test-task-1", true)
    ).to.equal("Warning: Health check 'HTTP /' failed.");
  });

  it("returns the right shorthand health message for failing tasks",
    function () {
      expect(this.component.instance().getTaskHealthMessage("test-task-1"))
        .to.equal("Unhealthy");
  });

  it("returns the right health message for tasks with unknown health",
      function () {
    expect(this.component.instance().getTaskHealthMessage("test-task-2"))
      .to.equal("Unknown");
  });

  it("returns the right health message for healthy tasks", function () {
    expect(this.component.instance().getTaskHealthMessage("test-task-3"))
      .to.equal("Healthy");
  });

  describe("on unauthorized access error", function () {

    it("has the correct fetchState", function () {
      AppsStore.once(AppsEvents.REQUEST_APPS_ERROR, function () {
        expectAsync(function () {
          expect(this.element.state.fetchState)
            .to.equal(States.STATE_UNAUTHORIZED);
        }, done);
      });

      nock(config.apiURL)
        .get("/v2/apps")
        .reply(401, {"message": "Unauthorized access"});

      AppsActions.requestApps();
    });

  });
  describe("on app request Error sets the right state", function () {
    it("State Unauthorized", function () {
      // this.component.onAppRequestError(null, 401);
      this.component.instance().onAppRequestError(null, 401);
      expect(this.component.state("fetchState"))
        .to.equal(States.STATE_UNAUTHORIZED);
    });

    it("State Unauthorized", function () {
      // this.component.onAppRequestError(null, 401);
      this.component.instance().onAppRequestError(null, 403);
      expect(this.component.state("fetchState"))
        .to.equal(States.STATE_FORBIDDEN);
    });
  });
  describe("on delete app succes ", function () {
    it("transitions to 'apps'", function () {
      var transitionSpy = sinon.spy();
      var context = {
        router: {
          transitionTo: transitionSpy,
          getCurrentParams: function () {
            return {
              appId: "/test-app-1"
            };
          }
        }
      };
      var component = shallow(<AppPageComponent />, {context});
      component.instance().onDeleteAppSuccess();
      expect(transitionSpy.called).to.be.true;
    });
  });
});
