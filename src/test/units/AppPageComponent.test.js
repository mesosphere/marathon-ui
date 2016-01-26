import {expect} from "chai";
import {shallow} from "enzyme";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import React from "react/addons";
import Util from "../../js/helpers/Util";
import appScheme from "../../js/stores/schemes/appScheme";
import AppsActions from "../../js/actions/AppsActions";
import AppsEvents from "../../js/events/AppsEvents";
import AppsStore from "../../js/stores/AppsStore";
import AppStatus from "../../js/constants/AppStatus";
import AppPageComponent from "../../js/components/AppPageComponent";
import HealthStatus from "../../js/constants/HealthStatus";
import States from "../../js/constants/States";

describe("AppPageComponent", function () {

  before(function () {
    var app = Util.extendObject(appScheme, {
      id: "/test-app-1",
      healthChecks: [{path: "/", protocol: "HTTP"}],
      status: AppStatus.RUNNING,
      tasks: [
        {
          id: "test-task-1",
          appId: "/test-app-1",
          healthStatus: HealthStatus.UNHEALTHY,
          healthCheckResults: [
            {
              alive: false,
              taskId: "test-task-1"
            }
          ]
        }
      ]
    });

    AppsStore.apps = [app];

    var context = {
      router: {
        getCurrentParams: function () {
          return {
            appId: "/test-app-1"
          };
        }
      }
    };

    this.component = shallow(<AppPageComponent />, {context});
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
       expect(this.component
                .instance()
                .getTaskHealthMessage("test-task-1")
       ).to.equal("Unhealthy");
     });

  it("returns the right health message for tasks with unknown health",
     function () {
       var app = Util.extendObject(appScheme, {
         id: "/test-app-1",
         status: AppStatus.RUNNING,
         tasks: [
           {
             id: "test-task-1",
             appId: "/test-app-1",
             healthStatus: HealthStatus.UNKNOWN
           }
         ]
       });

       AppsStore.apps = [app];

       expect(this.component
                .instance()
                .getTaskHealthMessage("test-task-1")
       ).to.equal("Unknown");
     });

  it("returns the right health message for healthy tasks", function () {
    var app = Util.extendObject(appScheme, {
      id: "/test-app-1",
      status: AppStatus.RUNNING,
      tasks: [
        {
          id: "test-task-1",
          appId: "/test-app-1",
          healthStatus: HealthStatus.HEALTHY
        }
      ]
    });

    AppsStore.apps = [app];

    expect(this.component
             .instance()
             .getTaskHealthMessage("test-task-1")
    ).to.equal("Healthy");
  });

  describe("on unauthorized access error", function () {

    it("has the correct fetchState", function () {
      // @todo: Remove action/store dependency
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
});
