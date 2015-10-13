var expect = require("chai").expect;
var ViewHelper = require("../js/helpers/ViewHelper");

describe("ViewHelper", function () {

  describe("convertMegabytesToString", function () {

    it("appends the correct unit for megabytes", function () {
      expect(ViewHelper.convertMegabytesToString(100)).to.equal("100MB");
    });

    it("appends the correct unit for gigabytes", function () {
      expect(ViewHelper.convertMegabytesToString(1040)).to.equal("1GB");
    });

    it("appends the correct unit for tebibyte", function () {
      expect(ViewHelper.convertMegabytesToString(1064960)).to.equal("1TiB");
    });

    it("handles 0 values correctly", function () {
      expect(ViewHelper.convertMegabytesToString(0)).to.equal("0MB");
    });

    it("handles null values correctly", function () {
      expect(ViewHelper.convertMegabytesToString(null)).to.equal("0MB");
    });

    it("handles undefined values correctly", function () {
      expect(ViewHelper.convertMegabytesToString(undefined)).to.equal("0MB");
    });

  });
  describe("getRelativePath", function () {
    it("trims initial group from app names", function () {
      expect(ViewHelper.getRelativePath("/test/group/app", "/test/group"))
        .to.equal("app");
    });
  });
});
