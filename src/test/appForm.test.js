var expect = require("chai").expect;

var expectAsync = require("./helpers/expectAsync");
var FormActions = require("../js/actions/FormActions");
var FormEvents = require("../js/events/FormEvents");
var AppFormStore = require("../js/stores/AppFormStore");

describe("App Form", function () {

  describe("on field update", function () {

    describe("handles AppFormStore field validation errors", function () {

      it("returns the right error message index for empty app ID",
          function (done) {
        AppFormStore.once(FormEvents.FIELD_VALIDATION_ERROR, function () {
          expectAsync(function () {
            expect(AppFormStore.validationErrorIndices)
              .to.have.property("appId");
            expect(AppFormStore.validationErrorIndices.appId).to.equal(0);
          }, done);
        });

        FormActions.update("appId", "");
      });

      it("returns the right error message index for a different error",
          function (done) {
        AppFormStore.once(FormEvents.FIELD_VALIDATION_ERROR, function () {
          expectAsync(function () {
            expect(AppFormStore.validationErrorIndices)
              .to.have.property("appId");
            expect(AppFormStore.validationErrorIndices.appId).to.equal(1);
          }, done);
        });

        FormActions.update("appId", "/app id");
      });

    });

    describe("the model", function () {

      after(function () {
        AppFormStore.app = {};
        AppFormStore.fields = {};
      });

      it("updates correctly", function (done) {
        AppFormStore.once(FormEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppFormStore.app.id).to.equal("/app-1");
          }, done);
        });

        FormActions.update("appId", "/app-1");
      });

      describe("the cpus field", function () {

        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.cpus).to.equal(1.1);
            }, done);
          });

          FormActions.update("cpus", 1.1);
        });
      });

      describe("the disk field", function () {
        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.disk).to.equal(256);
            }, done);
          });

          FormActions.update("disk", 256);
        });
      });

      describe("the cmd field", function () {
        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.cmd).to.equal("sleep 1");
            }, done);
          });

          FormActions.update("cmd", "sleep 1");
        });
      });

      describe("the env field", function () {

        it("inserts a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.env.ENV_KEY_1).to.equal("ENV_VALUE_1");
            }, done);
          });

          FormActions.insert("env", {key: "ENV_KEY_1", value: "ENV_VALUE_1"});
        });

        it("inserts another key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.env.ENV_KEY_1).to.equal("ENV_VALUE_1");
              expect(AppFormStore.app.env.ENV_KEY_2).to.equal("ENV_VALUE_2");
            }, done);
          });

          FormActions.insert("env", {key: "ENV_KEY_2", value: "ENV_VALUE_2"});
        });

        it("updates a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.env.ENV_KEY_1).to.equal("ENV_VALUE_1A");
            }, done);
          });

          FormActions.update("env",
            {key: "ENV_KEY_1", value: "ENV_VALUE_1A"},
            0
          );
        });

        it("deletes a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.env).to.not.have.property("ENV_VALUE_1A");
            }, done);
          });

          FormActions.delete("env", 0);
        });

      });

      describe("the mem field", function () {

        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.mem).to.equal(32);
            }, done);
          });

          FormActions.update("mem", 32);
        });
      });

      describe("the instances field", function () {
        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.instances).to.equal(2);
            }, done);
          });

          FormActions.update("instances", 2);
        });
      });

      describe("the executor field", function () {
        it("doesn't update on invalid value", function (done) {
          AppFormStore.once(FormEvents.FIELD_VALIDATION_ERROR, function () {
            expectAsync(function () {
              expect(AppFormStore.app.executor).to.be.undefined;
            }, done);
          });

          FormActions.update("executor", "/cmd/");
        });
      });
    });

    describe("the form fields object", function () {

      it("updates correctly", function (done) {
        AppFormStore.once(FormEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppFormStore.fields.appId).to.equal("/app-1");
          }, done);
        });

        FormActions.update("appId", "/app-1");
      });

      describe("the cpus field", function () {

        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {

              expect(AppFormStore.fields.cpus).to.equal(1.1);
            }, done);
          });

          FormActions.update("cpus", 1.1);
        });
      });

      describe("the disk field", function () {
        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.disk).to.equal(256);
            }, done);
          });

          FormActions.update("disk", 256);
        });
      });

      describe("the cmd field", function () {

        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.cmd).to.equal("sleep 1");
            }, done);
          });

          FormActions.update("cmd", "sleep 1");
        });
      });

      describe("the container settings", function () {

        describe("the image field", function () {
          it("updates correctly", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                expect(AppFormStore.fields.dockerImage).to.equal("/image");
              }, done);
            });

            FormActions.update("dockerImage", "/image");
          });
        });

        describe("the network field", function () {
          it("updates correctly", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                expect(AppFormStore.fields.dockerNetwork).to.equal("BRIDGE");
              }, done);
            });

            FormActions.update("dockerNetwork", "BRIDGE");
          });
        });

        describe("the privileges field", function () {
          it("updates correctly", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                expect(AppFormStore.fields.dockerPrivileged).to.equal(true);
              }, done);
            });

            FormActions.update("dockerPrivileged", true);
          });
        });

        describe("the port mappings fieldset", function () {

          it("inserts a new row", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                expect(AppFormStore.fields.dockerPortMappings[0])
                  .to.deep.equal({
                    containerPort: 8000,
                    hostPort: 8001,
                    servicePort: 8002,
                    protocol: "udp"
                  });
              }, done);
            });

            FormActions.insert("dockerPortMappings", {
              containerPort: 8000,
              hostPort: 8001,
              servicePort: 8002,
              protocol: "udp"
            });
          });

          it("inserts another row", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                expect(AppFormStore.fields.dockerPortMappings[0])
                  .to.deep.equal({
                    containerPort: 8000,
                    hostPort: 8001,
                    servicePort: 8002,
                    protocol: "udp"
                  });

                expect(AppFormStore.fields.dockerPortMappings[1])
                  .to.deep.equal({
                    containerPort: 9000,
                    hostPort: 9001,
                    servicePort: 9002,
                    protocol: "tcp"
                  });
              }, done);
            });

            FormActions.insert("dockerPortMappings", {
              containerPort: 9000,
              hostPort: 9001,
              servicePort: 9002,
              protocol: "tcp"
            });
          });

          it("updates a row at index", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                let row = AppFormStore.fields.dockerPortMappings[0];
                expect(row.servicePort).to.equal(8101);
              }, done);
            });

            FormActions.update("dockerPortMappings", {servicePort: 8101}, 0);
          });

          it("deletes a row at index", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                let row = AppFormStore.fields.dockerPortMappings[0];
                expect(AppFormStore.fields.dockerPortMappings.length)
                  .to.equal(1);
                expect(row).to.deep.equal({
                  containerPort: 9000,
                  hostPort: 9001,
                  servicePort: 9002,
                  protocol: "tcp"
                });
              }, done);
            });

            FormActions.delete("dockerPortMappings", 0);
          });

        });

        describe("the parameters fieldset", function () {

          it("inserts a new row", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                expect(AppFormStore.fields.dockerParameters[0])
                  .to.deep.equal({
                    key: "DOCKER_KEY",
                    value: "DOCKER_VALUE"
                  });
              }, done);
            });

            FormActions.insert("dockerParameters", {
              key: "DOCKER_KEY",
              value: "DOCKER_VALUE"
            });
          });

          it("inserts another row", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {

                expect(AppFormStore.fields.dockerParameters[1])
                  .to.deep.equal({
                    key: "DOCKER_KEY_1",
                    value: "DOCKER_VALUE_1"
                  });
              }, done);
            });

            FormActions.insert("dockerParameters", {
              key: "DOCKER_KEY_1",
              value: "DOCKER_VALUE_1"
            });
          });

          it("updates a row at index", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                let row = AppFormStore.fields.dockerParameters[0];
                expect(row.key).to.equal("DOCKER_KEY_1A");
              }, done);
            });

            FormActions.update("dockerParameters", {key: "DOCKER_KEY_1A"}, 0);
          });

          it("deletes a row at index", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                let row = AppFormStore.fields.dockerParameters[0];
                expect(AppFormStore.fields.dockerParameters.length)
                  .to.equal(1);
                expect(row).to.deep.equal({
                  key: "DOCKER_KEY_1",
                  value: "DOCKER_VALUE_1"
                });
              }, done);
            });

            FormActions.delete("dockerParameters", 0);
          });

        });

        describe("the volumes fieldset", function () {

          it("inserts a new row", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                expect(AppFormStore.fields.containerVolumes[0])
                  .to.deep.equal({
                    containerPath: "/container-0",
                    hostPath: "/host-0",
                    mode: "RO"
                  });
              }, done);
            });

            FormActions.insert("containerVolumes", {
              containerPath: "/container-0",
              hostPath: "/host-0",
              mode: "RO"
            });
          });

          it("inserts another row", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {

                expect(AppFormStore.fields.containerVolumes[1])
                  .to.deep.equal({
                    containerPath: "/container-1",
                    hostPath: "/host-1",
                    mode: "RW"
                  });
              }, done);
            });

            FormActions.insert("containerVolumes", {
              containerPath: "/container-1",
              hostPath: "/host-1",
              mode: "RW"
            });
          });

          it("updates a row at index", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                let row = AppFormStore.fields.containerVolumes[0];
                expect(row.mode).to.equal("RW");
              }, done);
            });

            FormActions.update("containerVolumes", {mode: "RW"}, 0);
          });

          it("deletes a row at index", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                let row = AppFormStore.fields.containerVolumes[0];
                expect(AppFormStore.fields.containerVolumes.length)
                  .to.equal(1);
                expect(row).to.deep.equal({
                  containerPath: "/container-1",
                  hostPath: "/host-1",
                  mode: "RW"
                });
              }, done);
            });

            FormActions.delete("containerVolumes", 0);
          });
        });

      });

      describe("the env field", function () {

        it("inserts a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.env[0]).to.deep.equal({
                key: "ENV_KEY_1",
                value: "ENV_VALUE_1"
              });
            }, done);
          });
          FormActions.insert("env", {key: "ENV_KEY_1", value: "ENV_VALUE_1"});
        });

        it("updates a key-value pair at index", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.env[0]).to.deep.equal({
                key: "ENV_KEY_2",
                value: "ENV_VALUE_1"
              });
            }, done);
          });
          FormActions.update("env",
            {key: "ENV_KEY_2", value: "ENV_VALUE_1"},
            0
          );
        });

        it("inserts a key-value pair at index", function (done) {

          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.env.length).to.equal(2);
              expect(AppFormStore.fields.env[0]).to.deep.equal({
                key: "ENV_KEY_3",
                value: "ENV_VALUE_3"
              });
              expect(AppFormStore.fields.env[1]).to.deep.equal({
                key: "ENV_KEY_2",
                value: "ENV_VALUE_1"
              });
            }, done);
          });

          FormActions.insert("env",
            {key: "ENV_KEY_3", value: "ENV_VALUE_3"},
            0
          );

        });

        it("deletes a key-value pair at index", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.env.length).to.equal(1);
              expect(AppFormStore.fields.env[0]).to.deep.equal({
                key: "ENV_KEY_2",
                value: "ENV_VALUE_1"
              });
            }, done);
          });

          FormActions.delete("env", 0);
        });
      });

      describe("the mem field", function () {

        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.mem).to.equal(32);
            }, done);
          });

          FormActions.update("mem", 32);
        });
      });

      describe("the instances field", function () {
        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.instances).to.equal(2);
            }, done);
          });

          FormActions.update("instances", 2);
        });
      });

      describe("the executor field", function () {
        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.executor).to.equal("//cmd");
            }, done);
          });

          FormActions.update("executor", "//cmd");
        });
      });

      describe("the ports field", function () {
        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.ports).to.equal("23, 24, 25");
            }, done);
          });

          FormActions.update("ports", "23, 24, 25");
        });
      });

      describe("the uris field", function () {
        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.uris).to.equal("abc, http://dcfe");
            }, done);
          });

          FormActions.update("uris", "abc, http://dcfe");
        });
      });

      describe("the constraints field", function () {
        it("updates correctly", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.fields.contraints).to
                .equal("hostname:UNIQUE, test:LIKE");
            }, done);
          });

          FormActions.update("contraints", "hostname:UNIQUE, test:LIKE");
        });
      });
    });

  });

});
