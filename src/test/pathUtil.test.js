var expect = require("chai").expect;
var PathUtil = require("../js/helpers/PathUtil");

describe("Path", function () {
  describe("getRelativePath", function () {
    it("trims initial group from app names", function () {
      expect(PathUtil.getRelativePath("/test/group/app", "/test/group"))
        .to.equal("app");
    });
    it("does not trim group from app if it does not match", function () {
      expect(PathUtil.getRelativePath("/test/group/app", "/does/not/match"))
       .to.equal("/test/group/app");
    });
  });
  describe("getGroupFromAppId", function () {
    it("trims the app from the group name", function () {
      expect(PathUtil.getGroupFromAppId("/test/group/app-1"))
        .to.equal("/test/group/");
    });
  });
  describe("getAppName", function () {
    it("trims the groups from the app id", function () {
      expect(PathUtil.getAppName("/test/group/app-1"))
        .to.equal("app-1");
    });
    it("works when an app is in the root group", function () {
      expect(PathUtil.getAppName("/root-group-app"))
        .to.equal("root-group-app");
    });
  });
});
