import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import QueueActions from "../../js/actions/QueueActions";
import QueueEvents from "../../js/events/QueueEvents";
import QueueStore from "../../js/stores/QueueStore";

describe("rejected offer stats", function () {

  before(function (done) {
    done();
  });

  it("respond sucessfully on matching app", function (done) {
    var response = {
      "count" : 2,
      "details": { "mem" : 1,
        "cpu" : 2
      }
    };

    var appId = "app-1";

    nock(config.apiURL)
      .get("/v2/queue/app-1/stats")
      .reply(200, response);

    QueueStore.once(QueueEvents.OFFER_STATS, function (data) {
      expectAsync(function () {
        expect(data.count).to.equal(2);
        expect(data.details.mem).to.equal(1);
      }, done);
    });

    QueueActions.getOfferStats(appId);
  });

});
