import {expect} from "chai";
import nock from "nock";
import _ from "underscore";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import AppsStore from "../../js/stores/AppsStore";
import AppsEvents from "../../js/events/AppsEvents";
import QueueActions from "../../js/actions/QueueActions";

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("queue update", function () {

  it("has the correct app status (delayed)", function (done) {
    var nockResponse = {
      "queue": [
        {
          "app": {
            "id": "/app-1",
            "maxLaunchDelaySeconds": 3600
          },
          "delay": {
            "overdue": false,
            "timeLeftSeconds": 784
          }
        }
      ]
    };
    nock(config.apiURL)
      .get("/v2/queue")
      .reply(200, nockResponse);

    AppsStore.once(AppsEvents.CHANGE, function () {
      expectAsync(function () {
        expect(_.findWhere(AppsStore.apps, {id: "/app-1"}).status)
          .to.equal(3);
      }, done);
    });

    QueueActions.requestQueue();
  });

  it("has the correct app status (waiting)", function (done) {
    var nockResponse = {
      "queue": [
        {
          "app": {
            "id": "/app-1",
            "maxLaunchDelaySeconds": 3600
          },
          "delay": {
            "overdue": true,
            "timeLeftSeconds": 123
          }
        }
      ]
    };
    nock(config.apiURL)
      .get("/v2/queue")
      .reply(200, nockResponse);

    AppsStore.once(AppsEvents.CHANGE, function () {
      expectAsync(function () {
        expect(_.findWhere(AppsStore.apps, {id: "/app-1"}).status)
          .to.equal(4);
      }, done);
    });

    QueueActions.requestQueue();
  });

  it("does not trigger a change event if it doesn't update an app status",
    function (done) {
      var initialTimeout = this.timeout();
      this.timeout(25);

      var nockResponse = {
        "queue": [
          {
            "app": {
              "id": "/app-1",
              "maxLaunchDelaySeconds": 3600
            },
            "delay": {
              "overdue": false,
              "timeLeftSeconds": 0
            }
          }
        ]
      };
      nock(config.apiURL)
        .get("/v2/queue")
        .reply(200, nockResponse);

      var onChange = function () {
        expectAsync(function () {
          done(new Error("AppsEvents.CHANGE shouldn't be called."));
        }, done);
      };

      AppsStore.once(AppsEvents.CHANGE, onChange);

      setTimeout(() => {
        AppsStore.removeListener(AppsEvents.CHANGE, onChange);
        this.timeout(initialTimeout);
        done();
      }, 10);

      QueueActions.requestQueue();
    });

});
