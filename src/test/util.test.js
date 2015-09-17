var expect = require("chai").expect;
var Util = require("../js/helpers/Util");

describe("Util", function () {

  describe("param", function () {

    it("returns a valid urlencoded query string", function () {
      var obj = {
        hello: "world",
        foo: "bar"
      };
      expect(Util.param(obj)).to.equal("hello=world&foo=bar");
    });

    it("handles spaces and other entities correctly", function () {
      var obj = {
        q: "is:open is:issue label:gui"
      };
      expect(Util.param(obj))
        .to.equal("q=is%3Aopen%20is%3Aissue%20label%3Agui");
    });

    it("handles bad input gracefully", function () {
      var obj = {};
      expect(Util.param(obj)).to.equal("");

      obj = [1, 2, 3];
      expect(Util.param(obj)).to.equal("0=1&1=2&2=3");

      obj = null;
      expect(Util.param(obj)).to.equal(null);

      obj = "already=foo&also=bar";
      expect(Util.param(obj)).to.equal("already=foo&also=bar");

    });

  });

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

  describe("initKeyValue", function () {

    it("initialises a value for a given key", function () {
      let obj = {};
      Util.initKeyValue(obj, "key", []);
      expect(obj).to.have.property("key");
      expect(obj.key).to.eql([]);
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

  describe("isObject", function () {

    it("object is an object", function () {
      expect(Util.isObject({})).to.be.true;
    });

    it("array is not an object", function () {
      expect(Util.isObject([])).to.be.false;
    });

    it("primitives are not objects", function () {
      expect(Util.isObject(new Number(1))).to.be.false;
      expect(Util.isObject(2)).to.be.false;
      expect(Util.isObject(true)).to.be.false;
      expect(Util.isObject(new String("string"))).to.be.false;
      expect(Util.isObject("")).to.be.false;
      expect(Util.isObject(Symbol("unique"))).to.be.false;
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

  describe("detectPathsInObject", function () {
    it("detects all non object paths in an object recursively", function () {
      var obj = {
        obj1: {
          string2: "string2",
          number2: 2,
          obj2: {
            string3: "string3",
            number3: 3,
            obj3: {
              array2: ["a", "b"],
              number3: 3
            }
          }
        },
        string1: "string1",
        number1: 1,
        array1: [1, 2]
      };

      expect(Util.detectObjectPaths(obj)).to.deep.equal([
        "obj1.string2",
        "obj1.number2",
        "obj1.obj2.string3",
        "obj1.obj2.number3",
        "obj1.obj2.obj3.array2",
        "obj1.obj2.obj3.number3",
        "string1",
        "number1",
        "array1"
      ]);
    });

    it("detects all non object paths in an prefixed object", function () {
      var obj = {
        obj1: {
          obj2: {
            string3: "string3",
          },
          string2: "string2"
        },
        string1: "don't see me"
      };

      expect(Util.detectObjectPaths(obj, "obj1")).to.deep.equal([
        "obj1.obj2.string3",
        "obj1.string2"
      ]);
    });

    it("excludes an object for parsing", function () {
      var obj = {
        obj1: {
          obj2: {
            string3: "string3",
          },
          string2: "string2"
        },
        string1: "don't see me"
      };

      expect(Util.detectObjectPaths(obj, "obj1", ["obj1.obj2"]))
          .to.deep.equal([
        "obj1.obj2",
        "obj1.string2"
      ]);
    });
  });

});
