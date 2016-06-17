import {expect} from "chai";

import AppFormValidators from "../../js/stores/validators/AppFormValidators";
import HealthCheckPortTypes from "../../js/constants/HealthCheckPortTypes";

describe("App Form Validators", function () {

  describe("expects", function () {

    before(function () {
      this.validatior = AppFormValidators;
    });

    describe("app id", function () {
      it("is not an empty string", function () {
        expect(this.validatior.appIdNotEmpty("notempty")).to.be.true;
      });

      it("is an empty string", function () {
        expect(this.validatior.appIdNotEmpty("")).to.be.false;
      });

      it("has no white spaces", function () {
        expect(this.validatior.appIdNoWhitespaces("nowhitespace"))
          .to.be.true;
      });

      it("has white spaces", function () {
        expect(this.validatior.appIdNoWhitespaces("has white spaces"))
          .to.be.false;
      });

      it("has no multiple forward slashes", function () {
        expect(this.validatior.appIdNoMultipleSlashes("/hello/world"))
          .to.be.true;
      });

      it("has multiple forward slashes", function () {
        expect(this.validatior.appIdNoMultipleSlashes("/hello//world////"))
          .to.be.false;
      });

      it("has no illegal characters", function () {
        expect(this.validatior.appIdValidChars("./app-1.b")).to.be.true;
      });

      it("has illegal characters", function () {
        expect(this.validatior.appIdValidChars("Uppercase")).to.be.false;
        expect(this.validatior.appIdValidChars("app#1")).to.be.false;
        expect(this.validatior.appIdValidChars("app_1")).to.be.false;
        expect(this.validatior.appIdValidChars("+1")).to.be.false;
      });

      it("has well-formed path", function () {
        expect(this.validatior.appIdWellFormedPath("app.1")).to.be.true;
        expect(this.validatior.appIdWellFormedPath("/app.1")).to.be.true;
        expect(this.validatior.appIdWellFormedPath("/app.1/app-2")).to.be.true;
        expect(this.validatior.appIdWellFormedPath("/app.1/app-2/")).to.be.true;

        expect(this.validatior.appIdWellFormedPath(".")).to.be.true;
        expect(this.validatior.appIdWellFormedPath("..")).to.be.true;
        expect(this.validatior.appIdWellFormedPath("../")).to.be.true;
        expect(this.validatior.appIdWellFormedPath("app-1/..")).to.be.true;
        expect(this.validatior.appIdWellFormedPath("app-1/.")).to.be.true;
        expect(this.validatior.appIdWellFormedPath("./app-1/../app-1a/"))
          .to.be.true;
        expect(this.validatior.appIdWellFormedPath("../app-1/./app-1a"))
          .to.be.true;
        expect(this.validatior.appIdWellFormedPath("/app-1/.")).to.be.true;
      });

      it("has non-well-formed path", function () {
        expect(this.validatior.appIdWellFormedPath("App1")).to.be.false;
        expect(this.validatior.appIdWellFormedPath("-app.1")).to.be.false;
        expect(this.validatior.appIdWellFormedPath("app.1-")).to.be.false;
        expect(this.validatior.appIdWellFormedPath("/-app.1")).to.be.false;
        expect(this.validatior.appIdWellFormedPath("app......1")).to.be.false;
        expect(this.validatior.appIdWellFormedPath("/app-1.")).to.be.false;
        expect(this.validatior.appIdWellFormedPath("app-1..")).to.be.false;
        expect(this.validatior.appIdWellFormedPath(".app-1")).to.be.false;
        expect(this.validatior.appIdWellFormedPath("..app-1/")).to.be.false;
        expect(this.validatior.appIdWellFormedPath("..../app-1")).to.be.false;
        expect(this.validatior.appIdWellFormedPath("./app-1../app-1a/"))
          .to.be.false;
        expect(this.validatior.appIdWellFormedPath("/app-1/........"))
          .to.be.false;
      });
    });

    describe("cpus", function () {
      it("is not an empty string", function () {
        expect(this.validatior.cpus("")).to.be.false;
      });

      it("looks like a number greater or equal to 0.01", function () {
        expect(this.validatior.cpus("not a number 666")).to.be.false;
        expect(this.validatior.cpus(0.001)).to.be.false;
        expect(this.validatior.cpus("0.0001")).to.be.false;
        expect(this.validatior.cpus(0.01)).to.be.true;
        expect(this.validatior.cpus("0.01")).to.be.true;
        expect(this.validatior.cpus(5)).to.be.true;
        expect(this.validatior.cpus("2")).to.be.true;
      });
    });

    describe("disk", function () {
      it("is not an empty string", function () {
        expect(this.validatior.disk("")).to.be.false;
      });

      it("looks like a number", function () {
        expect(this.validatior.disk("")).to.be.false;
        expect(this.validatior.disk("not a number 666")).to.be.false;
        expect(this.validatior.disk(0.1)).to.be.true;
        expect(this.validatior.disk(5)).to.be.true;
        expect(this.validatior.disk("0.0001")).to.be.true;
        expect(this.validatior.disk("2")).to.be.true;
      });
    });

    describe("constraints", function () {
      it("treats empty string as valid", function () {
        expect(this.validatior.constraints("")).to.be.true;
      });

      it("detects invalid constraint name", function () {
        expect(this.validatior.constraints("hostname:INVALID_CONSTRAINT"))
          .to.be.false;
      });

      it("detects invalid strings", function () {
        expect(this.validatior.constraints("abc:")).to.be.false;
        expect(this.validatior.constraints("h:UNIQUE; b:UNIQUE")).to.be.false;
      });

      it("list of valid constraints", function () {
        let constraints =
          "hostname:UNIQUE, atomic:LIKE:man, rackid:CLUSTER:rack-1, dc:max_per:2";
        expect(this.validatior.constraints(constraints)).to.be.true;
        constraints =
          "rackid:GROUP_BY, atomic:UNLIKE:man";
        expect(this.validatior.constraints(constraints)).to.be.true;
      });
    });

    describe("docker container settings", function () {

      describe("image", function () {

        it("has no whitespaces", function () {
          let isValid = this.validatior.dockerImageNoWhitespaces;

          expect(isValid("dockerImage")).to.be.true;
          expect(isValid("docker Image")).to.be.false;
        });
      });

      describe("parameters row (single)", function () {

        it("has correct object format", function () {
          expect(this.validatior.dockerParameters({
            key: "key1",
            value: "value1"
          })).to.be.true;
        });

        it("doesn't care about additonal object keys", function () {
          expect(this.validatior.dockerParameters({
            key: "key1",
            value: "value1",
            consecutiveKey: 2
          })).to.be.true;
        });

        it("detects incorrect object format", function () {
          expect(this.validatior.dockerParameters({
            key: "key1",
            val: "value1"
          })).to.be.false;
        });

        it("detects empty key", function () {
          expect(this.validatior.dockerParameters({
            key: "",
            value: "value1"
          })).to.be.false;
        });

        it("treats empty value as correct", function () {
          expect(this.validatior.dockerParameters({
            key: "key1",
            value: ""
          })).to.be.true;
        });

      });

      describe("volumes", function () {

        describe("container path", function () {
          it("is empty", function () {
            let isValid = this.validatior.containerVolumesContainerPathIsValid;

            expect(isValid({containerPath: ""})).to.be.true;
          });

          it("has no whitespaces", function () {
            let isValid = this.validatior.containerVolumesContainerPathIsValid;

            expect(isValid({containerPath: "containerPath"})).to.be.true;
            expect(isValid({containerPath: "container path"})).to.be.false;
          });
        });

        describe("host path", function () {
          it("is empty", function () {
            let isValid = this.validatior.containerVolumesHostPathIsValid;

            expect(isValid({hostPath: ""})).to.be.true;
          });

          it("has no whitespaces", function () {
            let isValid = this.validatior.containerVolumesHostPathIsValid;

            expect(isValid({hostPath: "hostPath"})).to.be.true;
            expect(isValid({hostPath: "host path"})).to.be.false;
          });
        });

        describe("volumes mode", function () {
          it("is not empty", function () {
            let isValid = this.validatior.containerVolumesModeNotEmpty;

            expect(isValid({mode: ""})).to.be.false;
            expect(isValid({mode: "RO"})).to.be.true;
          });
        });

        describe("container is not empty", function () {

          it("should be valid if empty", function () {
            let isValid = this.validatior.containerVolumesIsNotEmpty;
            var givenEmptyObject = {
              containerPath: "",
              hostPath: "",
              mode: null
            };
            var expectedState = true;
            expect(isValid(givenEmptyObject)).to.be.equal(expectedState);
          });

          it("should be valid if not empty", function () {
            let isValid = this.validatior.containerVolumesIsNotEmpty;
            var givenEmptyObject = {
              containerPath: "/container-0",
              hostPath: "/host-0",
              mode: "RO"
            };
            var expectedState = true;
            expect(isValid(givenEmptyObject)).to.be.equal(expectedState);
          });

          it("should not be valid if hostPath is empty", function () {
            let isValid = this.validatior.containerVolumesIsNotEmpty;
            var givenEmptyObject = {
              containerPath: "/container-0",
              hostPath: "",
              mode: "RO"
            };
            var expectedState = false;
            expect(isValid(givenEmptyObject)).to.be.equal(expectedState);
          });

          it("should not be valid if containerPath is empty", function () {
            let isValid = this.validatior.containerVolumesIsNotEmpty;
            var givenEmptyObject = {
              containerPath: "",
              hostPath: "/host-0",
              mode: "RO"
            };
            var expectedState = false;
            expect(isValid(givenEmptyObject)).to.be.equal(expectedState);
          });
        });

      });

    });

    describe("env row (single)", function () {

      it("has correct object format", function () {
        expect(this.validatior.env({
          key: "key1",
          value: "value1"
        })).to.be.true;
      });

      it("doesn't care about additonal object keys", function () {
        expect(this.validatior.env({
          key: "key1",
          value: "value1",
          consecutiveKey: 2
        })).to.be.true;
      });

      it("detects incorrect object format", function () {
        expect(this.validatior.env({
          key: "key1",
          val: "value1"
        })).to.be.false;
      });

      it("detects empty key", function () {
        expect(this.validatior.env({
          key: "",
          value: "value1"
        })).to.be.false;
      });

      it("treats empty value as correct", function () {
        expect(this.validatior.env({
          key: "key1",
          value: ""
        })).to.be.true;
      });

    });

    describe("executor", function () {

      it("treats empty string as valid", function () {
        expect(this.validatior.executor("")).to.be.true;
      });

      it("detects correct strings", function () {
        expect(this.validatior.executor("//cmd")).to.be.true;
        expect(this.validatior.executor("/abc")).to.be.true;
        expect(this.validatior.executor("/abc/def")).to.be.true;
        expect(this.validatior.executor("xyz")).to.be.true;
        expect(this.validatior.executor("abc xyz")).to.be.true;
      });

      it("detects incorrect strings", function () {
        expect(this.validatior.executor("/")).to.be.false;
        expect(this.validatior.executor("//")).to.be.false;
        expect(this.validatior.executor("/abc/")).to.be.false;
        expect(this.validatior.executor("/abc//def")).to.be.false;
        expect(this.validatior.executor("xyz/")).to.be.false;
      });

    });

    describe("health checks", function () {

      it("protocol exists", function () {
        expect(this.validatior.healthChecksProtocol({protocol: "HTTP"})).to.be.true;
        expect(this.validatior.healthChecksProtocol({protocol: "TCP"})).to.be.true;
        expect(this.validatior.healthChecksProtocol({protocol: "COMMAND"})).to.be.true;
      });

      it("protocol does not exists", function () {
        expect(this.validatior.healthChecksProtocol({protocol: "TTY"})).to.be.false;
      });

      it("command is not empty", function () {
        expect(this.validatior.healthChecksCommandNotEmpty({
          protocol: "COMMAND",
          command: "command"
        }))
          .to.be.true;
        expect(this.validatior.healthChecksCommandNotEmpty({
          protocol: "COMMAND",
          command: ""
        }))
          .to.be.false;
        expect(this.validatior.healthChecksCommandNotEmpty({
          protocol: "TCP",
          command: ""
        }))
          .to.be.true;
      });

      it("path is not empty", function () {
        expect(this.validatior.healthChecksPathNotEmpty({
          protocol: "HTTP",
          path: "path"
        }))
          .to.be.true;
        expect(this.validatior.healthChecksPathNotEmpty({
          protocol: "HTTP",
          path: ""
        }))
          .to.be.false;
        expect(this.validatior.healthChecksPathNotEmpty({
          protocol: "TCP",
          path: ""
        }))
          .to.be.true;
      });

      it("port index to be valid", function () {
        expect(this.validatior.healthChecksPortIndex({
          protocol: "TCP",
          portType: HealthCheckPortTypes.PORT_INDEX,
          portIndex: 1
        }))
          .to.be.true;
        expect(this.validatior.healthChecksPortIndex({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_INDEX,
          portIndex: 0
        }))
          .to.be.true;
        expect(this.validatior.healthChecksPortIndex({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_INDEX,
          portIndex: "abc"
        }))
          .to.be.false;
        expect(this.validatior.healthChecksPortIndex({
          protocol: "TCP",
          portType: HealthCheckPortTypes.PORT_INDEX,
          portIndex: 0.5
        }))
          .to.be.false;
        expect(this.validatior.healthChecksPortIndex({
          protocol: "COMMAND",
          portType: HealthCheckPortTypes.PORT_INDEX,
          portIndex: "abc"
        }))
          .to.be.true;
      });

      it("port number to be a valid port", function () {
        let healthChecksPort = this.validatior.healthChecksPort;

        expect(healthChecksPort({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_NUMBER,
          port: "NaN 666"
        })).to.be.false;
        expect(healthChecksPort({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_NUMBER,
          port: -5
        })).to.be.false;
        expect(healthChecksPort({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_NUMBER,
          port: 0.1
        })).to.be.false;
        expect(healthChecksPort({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_NUMBER,
          port: "0.0001"
        })).to.be.false;
        expect(healthChecksPort({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_NUMBER,
          port: "65536"
        })).to.be.false;
        expect(healthChecksPort({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_NUMBER,
          port: 0
        })).to.be.true;
        expect(healthChecksPort({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_NUMBER,
          port: "2"
        })).to.be.true;
        expect(healthChecksPort({
          protocol: "HTTP",
          portType: HealthCheckPortTypes.PORT_NUMBER,
          port: ""
        })).to.be.true;
      });

      it("grace period to be valid", function () {
        expect(
          this.validatior.healthChecksGracePeriod({gracePeriodSeconds: 1})
        ).to.be.true;
        expect(
          this.validatior.healthChecksGracePeriod({gracePeriodSeconds: 0.5})
        ).to.be.false;
        expect(
          this.validatior.healthChecksGracePeriod({gracePeriodSeconds: "abc"})
        ).to.be.false;
      });

      it("interval to be valid", function () {
        expect(this.validatior.healthChecksInterval({intervalSeconds: 1}))
          .to.be.true;
        expect(this.validatior.healthChecksInterval({intervalSeconds: 0.5}))
          .to.be.false;
        expect(this.validatior.healthChecksInterval({intervalSeconds: "abc"}))
          .to.be.false;
      });

      it("timeout to be valid", function () {
        expect(this.validatior.healthChecksTimeout({timeoutSeconds: 1}))
          .to.be.true;
        expect(this.validatior.healthChecksTimeout({timeoutSeconds: 0.5}))
          .to.be.false;
        expect(this.validatior.healthChecksTimeout({timeoutSeconds: "abc"}))
          .to.be.false;
      });

      it("max consecutive failures to be valid", function () {
        expect(this.validatior.healthChecksMaxConsecutiveFailures({
            maxConsecutiveFailures: 1
          }))
          .to.be.true;
        expect(this.validatior.healthChecksMaxConsecutiveFailures({
            maxConsecutiveFailures: 0.5
          }))
          .to.be.false;
        expect(this.validatior.healthChecksMaxConsecutiveFailures({
            maxConsecutiveFailures: "abc"
          }))
          .to.be.false;
      });

    });

    describe("instances", function () {

      it("is not an empty string", function () {
        expect(this.validatior.instances("")).to.be.false;
      });

      it("looks like an integer", function () {
        expect(this.validatior.instances("not a number 666")).to.be.false;
        expect(this.validatior.instances(0.1)).to.be.false;
        expect(this.validatior.instances(5)).to.be.true;
        expect(this.validatior.instances("0.0001")).to.be.false;
        expect(this.validatior.instances("2")).to.be.true;
      });

    });

    describe("labels row (single)", function () {

      it("has correct object format", function () {
        expect(this.validatior.labels({
          key: "key1",
          value: "value1"
        })).to.be.true;
      });

      it("doesn't care about additonal object keys", function () {
        expect(this.validatior.labels({
          key: "key1",
          value: "value1",
          consecutiveKey: 2
        })).to.be.true;
      });

      it("detects incorrect object format", function () {
        expect(this.validatior.labels({
          key: "key1",
          val: "value1"
        })).to.be.false;
      });

      it("detects empty key", function () {
        expect(this.validatior.labels({
          key: "",
          value: "value1"
        })).to.be.false;
      });

      it("treats empty value as correct", function () {
        expect(this.validatior.labels({
          key: "key1",
          value: ""
        })).to.be.true;
      });

    });

    describe("mem", function () {
      it("is not an empty string", function () {
        expect(this.validatior.mem("")).to.be.false;
      });

      it("looks like a number greater or equal to 32", function () {
        expect(this.validatior.mem("")).to.be.false;
        expect(this.validatior.mem("not a number 666")).to.be.false;
        expect(this.validatior.mem(0.1)).to.be.false;
        expect(this.validatior.mem(5)).to.be.false;
        expect(this.validatior.mem("0.0001")).to.be.false;
        expect(this.validatior.mem("31")).to.be.false;
        expect(this.validatior.mem("32")).to.be.true;
        expect(this.validatior.mem("32.7")).to.be.true;
        expect(this.validatior.mem(32)).to.be.true;
        expect(this.validatior.mem(500)).to.be.true;
      });
    });

    describe("ports", function () {
      it("treats empty string as valid", function () {
        expect(this.validatior.ports("")).to.be.true;
      });

      it("treats single port as valid", function () {
        expect(this.validatior.ports("123")).to.be.true;
      });

      it("treats list of ports as valid", function () {
        expect(this.validatior.ports("123, 495, 666")).to.be.true;
      });

      it("detects invalid characters", function () {
        expect(this.validatior.ports("123, 495xxx, 666")).to.be.false;
      });

      it("detects invalid format", function () {
        expect(this.validatior.ports("123, 495 666")).to.be.false;
      });
    });
    describe("Volumes", function () {
      describe("size", function () {
        it("should not be a not number value", function () {
          var volume = {
            persistentSize: "abc"
          };
          expect(this.validatior.localVolumesSize(volume)).to.be.false;
        });

        it("should be a number value", function () {
          var volume = {
            persistentSize: "1024"
          };
          expect(this.validatior.localVolumesSize(volume)).to.be.true;
        });

        it("should not be a negative value", function () {
          var volume = {
            persistentSize: "-1024"
          };
          expect(this.validatior.localVolumesSize(volume)).to.be.false;
        });
      });
      describe("path", function () {
        it("should allow an empty value", function () {
          var volume = {
            containerPath: ""
          };
          expect(this.validatior.localVolumesPath(volume)).to.be.true;
        });

        it("should not be a not contain a space", function () {
          var volume = {
            containerPath: "ab c"
          };
          expect(this.validatior.localVolumesPath(volume)).to.be.false;
        });

        it("should be a string value", function () {
          var volume = {
            containerPath: "abc"
          };
          expect(this.validatior.localVolumesPath(volume)).to.be.true;
        });

        it("should not contain a slash string value", function () {
          var volume = {
            containerPath: "ab/c"
          };
          expect(this.validatior.localVolumesPath(volume)).to.be.false;
        });

        it("should not begin with a slash string value", function () {
          var volume = {
            containerPath: "/abc"
          };
          expect(this.validatior.localVolumesPath(volume)).to.be.false;
        });
      });
      describe("all fields", function () {
        it("should not have an empty persistentSize", function () {
          var volume = {
            containerPath: "abc",
            persistentSize: ""
          };

          expect(this.validatior.localVolumesIsNotEmpty(volume))
            .to.be.false;
        });

        it("should not have an empty containerPath", function () {
          var volume = {
            containerPath: "",
            persistentSize: "12"
          };

          expect(this.validatior.localVolumesIsNotEmpty(volume))
            .to.be.false;
        });

        it("should be valid if no empty value is provided", function () {
          var volume = {
            containerPath: "asdasd",
            persistentSize: "12"
          };

          expect(this.validatior.localVolumesIsNotEmpty(volume))
            .to.be.true;
        });
      });
    });
    describe("External volumes", function () {

      describe("path", function () {
        it("should allow an empty value", function () {
          var volume = {
            externalName: ""
          };
          expect(this.validatior.externalVolumesName(volume)).to.be.true;
        });

        it("should not be a not contain a space", function () {
          var volume = {
            externalName: "ab c"
          };
          expect(this.validatior.externalVolumesName(volume)).to.be.false;
        });

        it("should be a string value", function () {
          var volume = {
            externalName: "abc"
          };
          expect(this.validatior.externalVolumesName(volume)).to.be.true;
        });

        it("should not contain a slash string value", function () {
          var volume = {
            externalName: "ab/c"
          };
          expect(this.validatior.externalVolumesName(volume)).to.be.false;
        });

        it("should not begin with a slash string value", function () {
          var volume = {
            externalName: "/abc"
          };
          expect(this.validatior.externalVolumesName(volume)).to.be.false;
        });
      });

      describe("path", function () {
        it("should allow an empty value", function () {
          var volume = {
            containerPath: ""
          };
          expect(this.validatior.localVolumesPath(volume)).to.be.true;
        });

        it("should not be a not contain a space", function () {
          var volume = {
            containerPath: "ab c"
          };
          expect(this.validatior.externalVolumesPath(volume)).to.be.false;
        });

        it("should be a string value", function () {
          var volume = {
            containerPath: "abc"
          };
          expect(this.validatior.externalVolumesPath(volume)).to.be.true;
        });

        it("may contain a slash string value", function () {
          var volume = {
            containerPath: "ab/c"
          };
          expect(this.validatior.externalVolumesPath(volume)).to.be.true;
        });

        it("may begin with a slash string value", function () {
          var volume = {
            containerPath: "/abc"
          };
          expect(this.validatior.externalVolumesPath(volume)).to.be.true;
        });
      });
    });

  });

});
