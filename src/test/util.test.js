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

  describe("extendObject", function () {

    it("returns a new object with merged properties", function () {
      var objA = {hello: "world", foo: "bar"};
      var objB = {hello: "there", baz: "foo"};
      var expectedResult = {hello: "there", foo: "bar", baz: "foo"};
      var result = util.extendObject(objA, objB);
      expect(result).to.deep.equal(expectedResult);
    });

    it("returns a new object without modifying the source", function () {
      var objA = {hello: "world", foo: "bar"};
      var objB = {hello: "there", baz: "foo"};
      var result = util.extendObject(objA, objB);
      expect(objA).to.deep.equal({hello: "world", foo: "bar"});
    });

    it("accepts several sources", function () {
      var objA = {hello: "world", foo: "bar"};
      var objB = {hello: "there", baz: "foo"};
      var objC = {id: null, flag: true};
      var expectedResult = {
        hello: "there",
        foo: "bar",
        baz: "foo",
        id: null,
        flag: true
      };

      var result = util.extendObject(objA, objB, objC);
      expect(result).to.deep.equal(expectedResult);
    });

    it("always returns an object", function () {
      var expectedResult = {"0": "faz", "1": "bar"};
      var result = util.extendObject(["foo", "bar"], ["faz"]);
      expect(result).to.deep.equal(expectedResult);
    });
  });

});
