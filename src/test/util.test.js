var expect = require("chai").expect;
var Util = require("../js/helpers/Util");

describe("Util", function () {

  describe("extendObject", function () {

    it("returns a new object with merged properties", function () {
      var objA = {hello: "world", foo: "bar"};
      var objB = {hello: "there", baz: "foo"};
      var expectedResult = {hello: "there", foo: "bar", baz: "foo"};
      var result = Util.extendObject(objA, objB);
      expect(result).to.deep.equal(expectedResult);
    });

    it("returns a new object without modifying the source", function () {
      var objA = {hello: "world", foo: "bar"};
      var objB = {hello: "there", baz: "foo"};
      var result = Util.extendObject(objA, objB);
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

      var result = Util.extendObject(objA, objB, objC);
      expect(result).to.deep.equal(expectedResult);
    });

    it("always returns an object", function () {
      var expectedResult = {"0": "faz", "1": "bar"};
      var result = Util.extendObject(["foo", "bar"], ["faz"]);
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe("serializedArrayToDictionary", function () {

    it("converts a flat array to a dictionary", function () {
      var input = [
        {name: "A", value: 1},
        {name: "B", value: 2},
        {name: "C", value: 3}
      ];
      var output = Util.serializedArrayToDictionary(input);
      expect(output).to.deep.equal({"A": 1, "B": 2, "C": 3});
    });

    it("nests property names with a dot separator", function () {
      var input = [
        {name: "A", value: 1},
        {name: "B.A", value: 2},
        {name: "B.B", value: 3}
      ];
      var output = Util.serializedArrayToDictionary(input);
      expect(output).to.deep.equal({"A": 1, "B": {"A": 2, "B": 3}});
    });

    it("does not error on duplicate keys", function () {
      var input = [
        {name: "A", value: 1},
        {name: "A", value: 2}
      ];
      var output = Util.serializedArrayToDictionary(input);
      expect(output).to.deep.equal({"A": 2});
    });

    it("handles several levels of nesting", function () {
      var input = [
        {name: "A.B.C.D.E", value: 1}
      ];
      var output = Util.serializedArrayToDictionary(input);
      expect(output).to.deep.equal({"A": {"B": {"C": {"D": {"E": 1}}}}});
    });

    it("handles empty arrays correctly", function () {
      var input = [];
      var output = Util.serializedArrayToDictionary(input);
      expect(output).to.deep.equal({});
    });

    it("handles the array notation", function () {
      var input = [
        {name: "A[0]", value: 1},
        {name: "A[1]", value: 2}
      ];
      var output = Util.serializedArrayToDictionary(input);
      expect(output).to.deep.equal({"A": [1, 2]});
    });

    it("handles multiple objects inside arrays", function () {
      var input = [
        {name: "A[0].A", value: 1},
        {name: "A[1].B", value: 2}
      ];
      var output = Util.serializedArrayToDictionary(input);
      expect(output).to.deep.equal({"A": [{"A": 1}, {"B": 2}]});
    });

    it("handles objects with multiple properties inside arrays", function () {
      var input = [
        {name: "A[0].A", value: 1},
        {name: "A[0].B", value: 2},
        {name: "A[1].A", value: 3},
        {name: "A[1].B", value: 4}
      ];
      var output = Util.serializedArrayToDictionary(input);
      expect(output).to.deep.equal({"A": [{"A": 1, "B": 2}, {"A": 3, "B": 4}]});
    });

    it("handles nested arrays", function () {
      var input = [
        {name: "A[0].B[0].C", value: 1}
      ];
      var output = Util.serializedArrayToDictionary(input);
      expect(output).to.deep.equal({"A": [{"B": [{"C": 1}]}]});
    });

    describe("malformed keys", function () {

      it("handles leading dots", function () {
        var input = [
          {name: ".A.B", value: 1}
        ];
        var output = Util.serializedArrayToDictionary(input);
        expect(output).to.deep.equal({"A": {"B": 1}});
      });

      it("handles trailing dots", function () {
        var input = [
          {name: "A.B.", value: 1}
        ];
        var output = Util.serializedArrayToDictionary(input);
        expect(output).to.deep.equal({"A": {"B": 1}});
      });

      it("handles duplicate dots", function () {
        var input = [
          {name: "A..B", value: 1}
        ];
        var output = Util.serializedArrayToDictionary(input);
        expect(output).to.deep.equal({"A": {"B": 1}});
      });

      it("handles missing array indices", function () {
        var input = [
          {name: "A[].B", value: 1},
          {name: "A[].B", value: 2}
        ];
        var output = Util.serializedArrayToDictionary(input);
        expect(output).to.deep.equal({"A": [{"B": 1}, {"B": 2}]});
      });

    });

  });

  describe("isArray", function () {

    it("array is an array", function () {
      expect(Util.isArray([])).to.be.true;
    });

    it("object is not an array", function () {
      expect(Util.isArray({})).to.be.false;
    });

  });

  describe("isNumber", function () {

    it("detects numbers", function () {
      expect(Util.isNumber(1)).to.be.true;
      expect(Util.isNumber(2.3)).to.be.true;
      expect(Util.isNumber(-5)).to.be.true;
    });

    it("string is not a number", function () {
      expect(Util.isNumber("666")).to.be.false;
    });

  });

  describe("isString", function () {

    it("detects strings", function () {
      expect(Util.isString("1")).to.be.true;
      expect(Util.isString("abc")).to.be.true;
    });

    it("number is not a string", function () {
      expect(Util.isString(123)).to.be.false;
    });

    it("function is not a string", function () {
      expect(Util.isString(function () {})).to.be.false;
    });

  });

  describe("isEmptyString", function () {

    it("handles bad input", function () {
      expect(Util.isEmptyString({"Object": true})).to.be.false;
      expect(Util.isEmptyString([1,2,3])).to.be.false;
      expect(Util.isEmptyString(null)).to.be.false;
    });

    it("detects empty srting", function () {
      expect(Util.isEmptyString("")).to.be.true;
    });

    it("detects a non-empty string", function () {
      expect(Util.isEmptyString(" ")).to.be.false;
      expect(Util.isEmptyString("not empty")).to.be.false;
    });

  });

  describe("compactArray", function () {
    it("compacts an array of objects", function () {
      var result = Util.compactArray([
        {a: "", b: 1, c: "some value"},
        {a: "", b: 0, c: ""},
        {a: "", b: false, c: ""},
        {a: null, b: "", c: ""}
      ]);
      expect(result).to.deep.equal([
        {b: 1, c: "some value"},
        {b: 0},
        {b: false}
      ]);
    });
  });

});
