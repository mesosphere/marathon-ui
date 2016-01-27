import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import InfoActions from "../../js/actions/InfoActions";
import InfoEvents from "../../js/events/InfoEvents";
import InfoStore from "../../js/stores/InfoStore";

describe("request info", function () {

  before(function (done) {
    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, {"name": "Marathon"});
    InfoStore.once(InfoEvents.CHANGE, done);
    InfoActions.requestInfo();
  });

  it("updates the InfoStore on success", function () {
    expect(InfoStore.info.name).to.equal("Marathon");
  });

  it("handles failure gracefully", function (done) {
    nock(config.apiURL)
      .get("/v2/info")
      .reply(404, {message: "Guru Meditation"});

    InfoStore.once(InfoEvents.REQUEST_ERROR, function (error) {
      expectAsync(function () {
        expect(error.message).to.equal("Guru Meditation");
      }, done);
    });

    InfoActions.requestInfo();
  });

});
