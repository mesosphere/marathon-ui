var expect = require("chai").expect;
var util = require("../js/helpers/util");

describe("util", function () {

  describe("param", function () {

    it("returns a valid urlencoded query string", function () {
      var obj = {
        hello: "world",
        foo: "bar"
      };
      expect(util.param(obj)).to.equal("hello=world&foo=bar");
    });

    it("handles spaces and other entities correctly", function () {
      var obj = {
        q: "is:open is:issue label:gui"
      };
      expect(util.param(obj))
        .to.equal("q=is%3Aopen%20is%3Aissue%20label%3Agui");
    });

    it("handles bad input gracefully", function () {
      var obj = {};
      expect(util.param(obj)).to.equal("");

      obj = [1, 2, 3];
      expect(util.param(obj)).to.equal("0=1&1=2&2=3");

      obj = null;
      expect(util.param(obj)).to.equal(null);

      obj = "already=foo&also=bar";
      expect(util.param(obj)).to.equal("already=foo&also=bar");

    });

  });

});
