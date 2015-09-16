var expect = require("chai").expect;

var AppFormTransforms =
  require("../js/stores/transforms/AppFormTransforms");

describe("App Form Field to Model Transform", function () {

  describe("transforms", function () {

    it("cpus to float", function () {
      expect(AppFormTransforms.FieldToModel.cpus("434.55")).to.equal(434.55);
      expect(AppFormTransforms.FieldToModel.cpus("434.556633"))
        .to.equal(434.556633);
    });

    it("disk to float", function () {
      expect(AppFormTransforms.FieldToModel.disk("33")).to.equal(33);
      expect(AppFormTransforms.FieldToModel.disk("33.23")).to.equal(33.23);
    });

    it("constraints to array with segements", function () {
      let constraints = "hostname:UNIQUE, atomic:LIKE:man";
      expect(AppFormTransforms.FieldToModel.constraints(constraints))
        .to.deep.equal([
          ["hostname", "UNIQUE"],
          ["atomic", "LIKE", "man"]
        ]);
    });

    it("container volumes to array of objects", function () {
      expect(AppFormTransforms.FieldToModel.containerVolumes([
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

    it("container volumes to empty array", function () {
      expect(AppFormTransforms.FieldToModel.containerVolumes([
        {
          containerPath: "",
          hostPath: "",
          mode: "",
          consecutiveKey: 1
        }
      ])).to.deep.equal([]);
    });

    it("dockerPortMappings to array of one object", function () {
      expect(AppFormTransforms.FieldToModel.dockerPortMappings([
        {
          containerPort: 8000,
          hostPort: 0,
          servicePort: "",
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

    it("dockerPortMappings to empty array", function () {
      expect(AppFormTransforms.FieldToModel.dockerPortMappings([
        {
          containerPort: "",
          hostPort: "",
          servicePort: "",
          protocol: "",
          consecutiveKey: 1
        }
      ])).to.deep.equal([]);
    });

    it("dockerPortMappings to empty array also with protocol set", function () {
      expect(AppFormTransforms.FieldToModel.dockerPortMappings([
        {
          containerPort: "",
          hostPort: "",
          servicePort: "",
          protocol: "tcp",
          consecutiveKey: 1
        }
      ])).to.deep.equal([]);
    });

    it("dockerPortMappings to array of multiple objects", function () {
      expect(AppFormTransforms.FieldToModel.dockerPortMappings([
        {
          containerPort: "123",
          hostPort: "123",
          servicePort: "     ",
          protocol: "tcp",
          consecutiveKey: 1
        },
        {
          containerPort: "",
          hostPort: "",
          servicePort: "",
          protocol: "tcp",
          consecutiveKey: 2
        },
        {
          containerPort: "456",
          hostPort: "",
          servicePort: "456",
          protocol: "udp",
          consecutiveKey: 3
        }
      ])).to.deep.equal([
          {
            containerPort: 123,
            hostPort: 123,
            protocol: "tcp"
          },
          {
            containerPort: 456,
            servicePort: 456,
            protocol: "udp"
          }
      ]);
    });

    it("dockerPortMappings to object with no protocol", function () {
      expect(AppFormTransforms.FieldToModel.dockerPortMappings([
        {
          containerPort: "123",
          hostPort: "123",
          servicePort: "      ",
          protocol: "",
          consecutiveKey: 1
        }
      ])).to.deep.equal([
          {
            containerPort: 123,
            hostPort: 123
          }
        ]);
    });

    it("dockerParameters to array of objects", function () {
      expect(AppFormTransforms.FieldToModel.dockerParameters([
        {key: "a-docker-option", value: "xxx", consecutiveKey: 1},
        {key: "b-docker-option", value: "yyy", consecutiveKey: 2}
      ])).to.deep.equal([
          {key: "a-docker-option", value: "xxx"},
          {key: "b-docker-option", value: "yyy"}
      ]);
    });

    it("dockerParameters to empty array", function () {
      expect(AppFormTransforms.FieldToModel.dockerParameters([
        {
          key: "",
          value: "",
          consecutiveKey: 1
        }
      ])).to.deep.equal([]);
    });


    it("dockerPrivileged is checked", function () {
      expect(AppFormTransforms.FieldToModel.dockerPrivileged(true))
        .to.be.true;
      expect(AppFormTransforms.FieldToModel.dockerPrivileged())
        .to.be.false;
    });

    it("env to object with key-values", function () {
      expect(AppFormTransforms.FieldToModel.env([
        {key: "key1", value: "value1", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1}
      ])).to.deep.equal({
        key1: "value1",
        key2: "value2"
      });
    });

    it("instances to integer", function () {
      expect(AppFormTransforms.FieldToModel.instances("2")).to.equal(2);
      expect(AppFormTransforms.FieldToModel.instances("4.5")).to.equal(4);
    });

    it("mem to float", function () {
      expect(AppFormTransforms.FieldToModel.mem("128.64")).to.equal(128.64);
    });

    it("ports string to an array of ports", function () {
      expect(AppFormTransforms.FieldToModel.ports("12233, 12244, 12255"))
        .to.deep.equal([12233, 12244, 12255]);
      expect(AppFormTransforms.FieldToModel.ports(""))
        .to.deep.equal([]);
    });

    it("uris string to an array of uris", function () {
      expect(AppFormTransforms.FieldToModel.
          uris("http://test.de/,http://test.com"))
        .to.deep.equal(["http://test.de/", "http://test.com"]);
      expect(AppFormTransforms.FieldToModel.uris(""))
        .to.deep.equal([]);
    });
  });

});

describe("App Form Model To Field Transform", function () {

  describe("transforms", function () {

    it("constraints array to string", function () {
      expect(AppFormTransforms.ModelToField.constraints([
          ["hostname", "UNIQUE"],
          ["atomic", "LIKE", "man"]
        ]))
        .to.equal("hostname:UNIQUE, atomic:LIKE:man");
    });

    it("dockerPortMappings to array with consecutiveKey", function () {
      expect(AppFormTransforms.ModelToField.dockerPortMappings([
        {
          containerPort: 1,
          hostPort: 1,
          protocol: "tcp"
        },
        {
          containerPort: 2,
          servicePort: 2,
          protocol: "udp"
        },
        {
          containerPort: 3,
          hostPort: 3,
          servicePort: 3,
          protocol: "tcp"
        },
      ])).to.deep.equal([
        {
          containerPort: 1,
          hostPort: 1,
          protocol: "tcp",
          consecutiveKey: 0
        },
        {
          containerPort: 2,
          servicePort: 2,
          protocol: "udp",
          consecutiveKey: 1
        },
        {
          containerPort: 3,
          hostPort: 3,
          servicePort: 3,
          protocol: "tcp",
          consecutiveKey: 2
        }
      ]);
    });

    it("env object to sorted array", function () {
      expect(AppFormTransforms.ModelToField.env({
        key1: "value1",
        key2: "value2"
      })).to.deep.equal([
        {key: "key1", value: "value1", consecutiveKey: 0},
        {key: "key2", value: "value2", consecutiveKey: 1}
      ]);
    });

    it("ports array to string", function () {
      expect(AppFormTransforms.ModelToField.ports([12233, 12244, 12255]))
        .to.equal("12233, 12244, 12255");
    });

    it("uris string to an array of uris", function () {
      expect(AppFormTransforms.ModelToField
          .uris(["http://test.de/", "http://test.com"]))
        .to.equal("http://test.de/, http://test.com");
    });
  });

});
