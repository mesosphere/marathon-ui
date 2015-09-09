var expect = require("chai").expect;

var AppFormTransforms = require("../js/stores/AppFormTransforms");

describe("App Form Transform", function () {

  describe("transforms", function () {

    it("cpus to float", function () {
      expect(AppFormTransforms.cpus("434.55")).to.equal(434.55);
      expect(AppFormTransforms.cpus("434.556633")).to.equal(434.556633);
    });

    it("disk to float", function () {
      expect(AppFormTransforms.disk("33")).to.equal(33);
      expect(AppFormTransforms.disk("33.23")).to.equal(33.23);
    });

    it("constraints to array with segements", function () {
      let constraints = "hostname:UNIQUE, atomic:LIKE:man";
      expect(AppFormTransforms.constraints(constraints))
        .to.deep.equal([
          ["hostname", "UNIQUE"],
          ["atomic", "LIKE", "man"]
        ]);
    });

    it("env to object with key-values", function () {
      expect(AppFormTransforms.env([
        {key: "key1", value: "value1"},
        {key: "key2", value: "value2"}
      ])).to.deep.equal({
        key1: "value1",
        key2: "value2"
      });
    });

    it("instances to integer", function () {
      expect(AppFormTransforms.instances("2")).to.equal(2);
      expect(AppFormTransforms.instances("4.5")).to.equal(4);
    });

    it("mem to float", function () {
      expect(AppFormTransforms.mem("128.64")).to.equal(128.64);
    });

    it("ports string to an array of ports", function () {
      expect(AppFormTransforms.ports("12233, 12244, 12255"))
        .to.deep.equal([12233, 12244, 12255]);
      expect(AppFormTransforms.ports(""))
        .to.deep.equal([]);
    });

    it("uris string to an array of uris", function () {
      expect(AppFormTransforms.uris("http://test.de/,http://test.com"))
        .to.deep.equal(["http://test.de/", "http://test.com"]);
      expect(AppFormTransforms.uris(""))
        .to.deep.equal([]);
    });
  });

});
