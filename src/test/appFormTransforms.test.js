var expect = require("chai").expect;

var AppFormTransforms = require("../js/stores/AppFormTransforms");
var AppFormModelToFieldTransforms =
  require("../js/stores/AppFormModelToFieldTransforms");

describe("App Form Field to Model Transform", function () {

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

    it("container volumes to array of objects", function () {
      expect(AppFormTransforms.containerVolumes([
        {
          containerPath: "/etc/a",
          hostPath: "/var/data/a",
          mode: "RO",
          consecutiveKey: 1
        }
      ])).to.deep.equal([
          {containerPath: "/etc/a", hostPath: "/var/data/a", mode: "RO"}
      ]);
    });

    it("dockerPortMappings to array of objects", function () {
      expect(AppFormTransforms.dockerPortMappings([
        {
          containerPort: 8000,
          hostPort: 0,
          servicePort: null,
          protocol: "tcp",
          consecutiveKey: 1
        }
      ])).to.deep.equal([
        {
          containerPort: 8000,
          hostPort: 0,
          protocol: "tcp"
        }
      ]);
    });

    it("dockerParameters to array of objects", function () {
      expect(AppFormTransforms.dockerParameters([
        {key: "a-docker-option", value: "xxx", consecutiveKey: 1},
        {key: "b-docker-option", value: "yyy", consecutiveKey: 2}
      ])).to.deep.equal([
          {key: "a-docker-option", value: "xxx"},
          {key: "b-docker-option", value: "yyy"}
      ]);
    });

    it("env to object with key-values", function () {
      expect(AppFormTransforms.env([
        {key: "key1", value: "value1", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1}
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

describe("App Form Model To Field Transform", function () {

  describe("transforms", function () {

    it("constraints array to string", function () {
      expect(AppFormModelToFieldTransforms.constraints([
          ["hostname", "UNIQUE"],
          ["atomic", "LIKE", "man"]
        ]))
        .to.equal("hostname:UNIQUE, atomic:LIKE:man");
    });

    it("env object to sorted array", function () {
      expect(AppFormModelToFieldTransforms.env({
        key1: "value1",
        key2: "value2"
      })).to.deep.equal([
        {key: "key1", value: "value1", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1}
      ]);
    });

    it("ports array to string", function () {
      expect(AppFormModelToFieldTransforms.ports([12233, 12244, 12255]))
        .to.equal("12233, 12244, 12255");
    });

    it("uris string to an array of uris", function () {
      expect(AppFormModelToFieldTransforms
          .uris(["http://test.de/", "http://test.com"]))
        .to.equal("http://test.de/, http://test.com");
    });
  });

});
