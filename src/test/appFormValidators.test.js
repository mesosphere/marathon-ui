var expect = require("chai").expect;

var AppFormValidators = require("../js/stores/validators/AppFormValidators");

describe("App Form Validators", function () {

  describe("expects", function () {

    before(function() {
      this.v = AppFormValidators;
    })

    describe("app id", function () {
      it("is not an empty string", function () {
        expect(this.v.appIdNotEmpty("notempty")).to.be.true;
      });

      it("is an empty string", function () {
        expect(this.v.appIdNotEmpty("")).to.be.false;
      });

      it("has no white spaces", function () {
        expect(this.v.appIdNoWhitespaces("nowhitespace")).to.be.true;
      });

      it("has white spaces", function () {
        expect(this.v.appIdNoWhitespaces("has white spaces")).to.be.false;
      });

      it("has no illegal characters", function () {
        expect(this.v.appIdValidChars("./app-1_b")).to.be.true;
      });

      it("has illegal characters", function () {
        expect(this.v.appIdValidChars("Uppercase")).to.be.false;
        expect(this.v.appIdValidChars("app#1")).to.be.false;
        expect(this.v.appIdValidChars("+1")).to.be.false;
      });

      it("has well-formed path", function () {
        expect(this.v.appIdWellFormedPath("app.1")).to.be.true;
        expect(this.v.appIdWellFormedPath("/app.1")).to.be.true;
        expect(this.v.appIdWellFormedPath("/app.1/app-2")).to.be.true;
        expect(this.v.appIdWellFormedPath("/app.1/app-2/")).to.be.true;

        expect(this.v.appIdWellFormedPath(".")).to.be.true;
        expect(this.v.appIdWellFormedPath("..")).to.be.true;
        expect(this.v.appIdWellFormedPath("../")).to.be.true;
        expect(this.v.appIdWellFormedPath("app-1/..")).to.be.true;
        expect(this.v.appIdWellFormedPath("app-1/.")).to.be.true;
        expect(this.v.appIdWellFormedPath("./app-1/../app-1a/")).to.be.true;
        expect(this.v.appIdWellFormedPath("../app-1/./app-1a")).to.be.true;
        expect(this.v.appIdWellFormedPath("/app-1/.")).to.be.true;
      });

      it("has non-well-formed path", function () {
        expect(this.v.appIdWellFormedPath("App1")).to.be.false;
        expect(this.v.appIdWellFormedPath("-app.1")).to.be.false;
        expect(this.v.appIdWellFormedPath("app.1-")).to.be.false;
        expect(this.v.appIdWellFormedPath("/-app.1")).to.be.false;
        expect(this.v.appIdWellFormedPath("app......1")).to.be.false;
        expect(this.v.appIdWellFormedPath("/app-1.")).to.be.false;
        expect(this.v.appIdWellFormedPath("app-1..")).to.be.false;
        expect(this.v.appIdWellFormedPath(".app-1")).to.be.false;
        expect(this.v.appIdWellFormedPath("..app-1/")).to.be.false;
        expect(this.v.appIdWellFormedPath("..../app-1")).to.be.false;
        expect(this.v.appIdWellFormedPath("./app-1../app-1a/")).to.be.false;
        expect(this.v.appIdWellFormedPath("/app-1/........")).to.be.false;
      });
    });

    describe("cpus", function () {
      it("is not an empty string", function () {
        expect(this.v.cpus("")).to.be.false;
      });

      it("looks like a number", function () {
        expect(this.v.cpus("not a number 666")).to.be.false;
        expect(this.v.cpus(0.1)).to.be.true;
        expect(this.v.cpus(5)).to.be.true;
        expect(this.v.cpus("0.0001")).to.be.true;
        expect(this.v.cpus("2")).to.be.true;
      });
    });

    describe("disk", function () {
      it("is not an empty string", function () {
        expect(this.v.disk("")).to.be.false;
      });

      it("looks like a number", function () {
        expect(this.v.disk("")).to.be.false;
        expect(this.v.disk("not a number 666")).to.be.false;
        expect(this.v.disk(0.1)).to.be.true;
        expect(this.v.disk(5)).to.be.true;
        expect(this.v.disk("0.0001")).to.be.true;
        expect(this.v.disk("2")).to.be.true;
      });
    });

    describe("constraints", function () {
      it("treats empty string as valid", function () {
        expect(this.v.constraints("")).to.be.true;
      });

      it("detects invalid constraint name", function () {
        expect(this.v.constraints("hostname:INVALID_CONSTRAINT")).to.be.false;
      });

      it("detects invalid strings", function () {
        expect(this.v.constraints("abc:")).to.be.false;
        expect(this.v.constraints("h:UNIQUE; b:UNIQUE")).to.be.false;
      });

      it("list of valid constraints", function () {
        let constraints =
          "hostname:UNIQUE, atomic:LIKE:man, rackid:CLUSTER:rack-1";
        expect(this.v.constraints(constraints)).to.be.true;
        constraints =
          "rackid:GROUP_BY, atomic:UNLIKE:man";
        expect(this.v.constraints(constraints)).to.be.true;
      });
    });

    describe("docker container settings", function () {

      describe("image", function () {

        it("has no whitespaces", function () {
          let isValid = this.v.dockerImageNoWhitespaces;

          expect(isValid("dockerImage")).to.be.true;
          expect(isValid("docker Image")).to.be.false;
        });
      });

      describe("the port mappings", function () {

        describe("container port", function () {

          it("looks like an integer and is in port range", function () {
            let isValidPort = this.v.dockerPortMappingsContainerPortIsValid;

            expect(isValidPort({containerPort: "NaN 666"})).to.be.false;
            expect(isValidPort({containerPort: -5})).to.be.false;
            expect(isValidPort({containerPort: 0.1})).to.be.false;
            expect(isValidPort({containerPort: "0.0001"})).to.be.false;
            expect(isValidPort({containerPort: "70000"})).to.be.false;
            expect(isValidPort({containerPort: 0})).to.be.true;
            expect(isValidPort({containerPort: "2"})).to.be.true;
            expect(isValidPort({containerPort: ""})).to.be.true;
          });

        });

        describe("host port", function () {

          it("looks like an integer and is in port range", function () {
            let isValidPort = this.v.dockerPortMappingsHostPortIsValid;

            expect(isValidPort({hostPort: "NaN 666"})).to.be.false;
            expect(isValidPort({hostPort: -5})).to.be.false;
            expect(isValidPort({hostPort: 0.1})).to.be.false;
            expect(isValidPort({hostPort: "0.0001"})).to.be.false;
            expect(isValidPort({hostPort: "70000"})).to.be.false;
            expect(isValidPort({hostPort: 0})).to.be.true;
            expect(isValidPort({hostPort: "2"})).to.be.true;
            expect(isValidPort({hostPort: ""})).to.be.true;
          });

        });

        describe("service port", function () {

          it("looks like an integer and is in port range", function () {
            let isValidPort = this.v.dockerPortMappingsServicePortIsValid;

            expect(isValidPort({servicePort: "NaN 666"})).to.be.false;
            expect(isValidPort({servicePort: -5})).to.be.false;
            expect(isValidPort({servicePort: 0.1})).to.be.false;
            expect(isValidPort({servicePort: "0.0001"})).to.be.false;
            expect(isValidPort({servicePort: "70000"})).to.be.false;
            expect(isValidPort({servicePort: 0})).to.be.true;
            expect(isValidPort({servicePort: "2"})).to.be.true;
            expect(isValidPort({servicePort: ""})).to.be.true;
          });

        });

         describe("protocol", function () {

          it("if not empty is of correct type", function () {
            let isValid = this.v.dockerPortMappingsProtocolValidType;

            expect(isValid({protocol: ""})).to.be.true;
            expect(isValid({protocol: null})).to.be.true;
            expect(isValid({protocol: "ipx"})).to.be.false;
            expect(isValid({protocol: "tcp"})).to.be.true;
            expect(isValid({protocol: "udp"})).to.be.true;
          });

        });
      });

      describe("parameters row (single)", function () {

        it("has correct object format", function () {
          expect(this.v.dockerParameters({
            key: "key1",
            value: "value1"
          })).to.be.true;
        });

        it("doesn't care about additonal object keys", function () {
          expect(this.v.dockerParameters({
            key: "key1",
            value: "value1",
            consecutiveKey: 2
          })).to.be.true;
        });

        it("detects incorrect object format", function () {
          expect(this.v.dockerParameters({
            key: "key1",
            val: "value1"
          })).to.be.false;
        });

        it("detects empty key", function () {
          expect(this.v.dockerParameters({
            key: "",
            value: "value1"
          })).to.be.false;
        });

        it("treats empty value as correct", function () {
          expect(this.v.dockerParameters({
            key: "key1",
            value: ""
          })).to.be.true;
        });

      });

      describe("volumes", function () {

        describe("container path", function () {
          it("is empty", function () {
            let isValid = this.v.containerVolumesContainerPathIsValid;

            expect(isValid({containerPath: ""})).to.be.true;
          });

          it("has no whitespaces", function () {
            let isValid = this.v.containerVolumesContainerPathIsValid;

            expect(isValid({containerPath: "containerPath"})).to.be.true;
            expect(isValid({containerPath: "container path"})).to.be.false;
          });
        });

        describe("host path", function () {
          it("is empty", function () {
            let isValid = this.v.containerVolumesHostPathIsValid;

            expect(isValid({hostPath: ""})).to.be.true;
          });

          it("has no whitespaces", function () {
            let isValid = this.v.containerVolumesHostPathIsValid;

            expect(isValid({hostPath: "hostPath"})).to.be.true;
            expect(isValid({hostPath: "host path"})).to.be.false;
          });
        });

        describe("volumes mode", function () {
          it("is not empty", function () {
            let isValid = this.v.containerVolumesModeNotEmpty;

            expect(isValid({mode: ""})).to.be.false;
            expect(isValid({mode: "RO"})).to.be.true;
          });
        });

      });

    });

    describe("env row (single)", function () {

      it("has correct object format", function () {
        expect(this.v.env({
          key: "key1",
          value: "value1"
        })).to.be.true;
      });

      it("doesn't care about additonal object keys", function () {
        expect(this.v.env({
          key: "key1",
          value: "value1",
          consecutiveKey: 2
        })).to.be.true;
      });

      it("detects incorrect object format", function () {
        expect(this.v.env({
          key: "key1",
          val: "value1"
        })).to.be.false;
      });

      it("detects empty key", function () {
        expect(this.v.env({
          key: "",
          value: "value1"
        })).to.be.false;
      });

      it("treats empty value as correct", function () {
        expect(this.v.env({
          key: "key1",
          value: ""
        })).to.be.true;
      });

    });

    describe("executor", function () {

      it("treats empty string as valid", function () {
        expect(this.v.executor("")).to.be.true;
      });

      it("detects correct strings", function () {
        expect(this.v.executor("//cmd")).to.be.true;
        expect(this.v.executor("/abc")).to.be.true;
        expect(this.v.executor("/abc/def")).to.be.true;
        expect(this.v.executor("xyz")).to.be.true;
        expect(this.v.executor("abc xyz")).to.be.true;
      });

      it("detects incorrect strings", function () {
        expect(this.v.executor("/")).to.be.false;
        expect(this.v.executor("//")).to.be.false;
        expect(this.v.executor("/abc/")).to.be.false;
        expect(this.v.executor("/abc//def")).to.be.false;
        expect(this.v.executor("xyz/")).to.be.false;
      });

    });

    describe("health checks", function () {

      it("protocol exists", function () {
        expect(this.v.healthChecksProtocol({protocol: "HTTP"})).to.be.true;
        expect(this.v.healthChecksProtocol({protocol: "TCP"})).to.be.true;
        expect(this.v.healthChecksProtocol({protocol: "COMMAND"})).to.be.true;
      });

      it("protocol does not exists", function () {
        expect(this.v.healthChecksProtocol({protocol: "TTY"})).to.be.false;
      });

      it("command is not empty", function () {
        expect(this.v.healthChecksCommandNotEmpty({
          protocol: "COMMAND",
          command: "command"
        }))
          .to.be.true;
        expect(this.v.healthChecksCommandNotEmpty({
          protocol: "COMMAND",
          command: ""
        }))
          .to.be.false;
        expect(this.v.healthChecksCommandNotEmpty({
          protocol: "TCP",
          command: ""
        }))
          .to.be.true;
      });

      it("path is not empty", function () {
        expect(this.v.healthChecksPathNotEmpty({
          protocol: "HTTP",
          path: "path"
        }))
          .to.be.true;
        expect(this.v.healthChecksPathNotEmpty({
          protocol: "HTTP",
          path: ""
        }))
          .to.be.false;
        expect(this.v.healthChecksPathNotEmpty({
          protocol: "TCP",
          path: ""
        }))
          .to.be.true;
      });

      it("port index to be valid", function () {
        expect(this.v.healthChecksPortIndex({
          protocol: "TCP",
          portIndex: 1
        }))
          .to.be.true;
        expect(this.v.healthChecksPortIndex({
          protocol: "HTTP",
          portIndex: 0
        }))
          .to.be.true;
        expect(this.v.healthChecksPortIndex({
          protocol: "HTTP",
          portIndex: "abc"
        }))
          .to.be.false;
        expect(this.v.healthChecksPortIndex({
          protocol: "TCP",
          portIndex: 0.5
        }))
          .to.be.false;
        expect(this.v.healthChecksPortIndex({
          protocol: "COMMAND",
          portIndex: "abc"
        }))
          .to.be.true;
      });

      it("grace period to be valid", function () {
        expect(this.v.healthChecksGracePeriod({gracePeriodSeconds: 1}))
          .to.be.true;
        expect(this.v.healthChecksGracePeriod({gracePeriodSeconds: 0.5}))
          .to.be.false;
        expect(this.v.healthChecksGracePeriod({gracePeriodSeconds: "abc"}))
          .to.be.false;
      });

      it("interval to be valid", function () {
        expect(this.v.healthChecksInterval({intervalSeconds: 1}))
          .to.be.true;
        expect(this.v.healthChecksInterval({intervalSeconds: 0.5}))
          .to.be.false;
        expect(this.v.healthChecksInterval({intervalSeconds: "abc"}))
          .to.be.false;
      });

      it("timeout to be valid", function () {
        expect(this.v.healthChecksTimeout({timeoutSeconds: 1}))
          .to.be.true;
        expect(this.v.healthChecksTimeout({timeoutSeconds: 0.5}))
          .to.be.false;
        expect(this.v.healthChecksTimeout({timeoutSeconds: "abc"}))
          .to.be.false;
      });

      it("max consecutive failures to be valid", function () {
        expect(this.v.healthChecksMaxConsecutiveFailures({
            maxConsecutiveFailures: 1
          }))
          .to.be.true;
        expect(this.v.healthChecksMaxConsecutiveFailures({
            maxConsecutiveFailures: 0.5
          }))
          .to.be.false;
        expect(this.v.healthChecksMaxConsecutiveFailures({
            maxConsecutiveFailures: "abc"
          }))
          .to.be.false;
      });

    });

    describe("instances", function () {

      it("is not an empty string", function () {
        expect(this.v.instances("")).to.be.false;
      });

      it("looks like an integer", function () {
        expect(this.v.instances("not a number 666")).to.be.false;
        expect(this.v.instances(0.1)).to.be.false;
        expect(this.v.instances(5)).to.be.true;
        expect(this.v.instances("0.0001")).to.be.false;
        expect(this.v.instances("2")).to.be.true;
      });

    });

    describe("labels row (single)", function () {

      it("has correct object format", function () {
        expect(this.v.labels({
          key: "key1",
          value: "value1"
        })).to.be.true;
      });

      it("doesn't care about additonal object keys", function () {
        expect(this.v.labels({
          key: "key1",
          value: "value1",
          consecutiveKey: 2
        })).to.be.true;
      });

      it("detects incorrect object format", function () {
        expect(this.v.labels({
          key: "key1",
          val: "value1"
        })).to.be.false;
      });

      it("detects empty key", function () {
        expect(this.v.labels({
          key: "",
          value: "value1"
        })).to.be.false;
      });

      it("treats empty value as correct", function () {
        expect(this.v.labels({
          key: "key1",
          value: ""
        })).to.be.true;
      });

    });

    describe("mem", function () {
      it("is not an empty string", function () {
        expect(this.v.mem("")).to.be.false;
      });

      it("looks like a number", function () {
        expect(this.v.mem("")).to.be.false;
        expect(this.v.mem("not a number 666")).to.be.false;
        expect(this.v.mem(0.1)).to.be.true;
        expect(this.v.mem(5)).to.be.true;
        expect(this.v.mem("0.0001")).to.be.true;
        expect(this.v.mem("2")).to.be.true;
      });
    });

    describe("ports", function () {
      it("treats empty string as valid", function () {
        expect(this.v.ports("")).to.be.true;
      });

      it("treats single port as valid", function () {
        expect(this.v.ports("123")).to.be.true;
      });

      it("treats list of ports as valid", function () {
        expect(this.v.ports("123, 495, 666")).to.be.true;
      });

      it("detects invalid characters", function () {
        expect(this.v.ports("123, 495xxx, 666")).to.be.false;
      });

      it("detects invalid format", function () {
        expect(this.v.ports("123, 495 666")).to.be.false;
      });
    });

  });

});
