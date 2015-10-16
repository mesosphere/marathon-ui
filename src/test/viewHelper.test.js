var expect = require("chai").expect;
var ViewHelper = require("../js/helpers/ViewHelper");

describe("ViewHelper", function () {
  describe("getRelativePath", function () {
    it("trims initial group from app names", function () {
      expect(ViewHelper.getRelativePath("/test/group/app", "/test/group"))
        .to.equal("app");
    });
  });
});
