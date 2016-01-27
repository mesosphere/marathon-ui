import {expect} from "chai";

import AppFormErrorMessages from "../../js/constants/AppFormErrorMessages";

describe("AppFormErrorMessages", function () {

  describe("#getFieldMessage", function () {
    it("returns correct message on given fieldId and index", function () {
      expect(AppFormErrorMessages.getFieldMessage("containerVolumes", 2))
        .to.be.equal("Mode must not be empty");
    });
  });

  describe("#getGeneralMessage", function () {
    it("returns correct message on given key", function () {
      expect(AppFormErrorMessages.getGeneralMessage("unknownServerError"))
        .to.be.equal("Unknown server error, could not create or apply app.");
    });
  });

  describe("#lookupServerResponseMessage", function () {
    it("returns correct message on given server message", function () {
      expect(
        AppFormErrorMessages.lookupServerResponseMessage("error.path.missing")
      ).to.be.equal("Please provide a path");
    });
  });

});
