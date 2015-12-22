var expect = require("chai").expect;
var config = require("../js/config/config");

var expectAsync = require("./helpers/expectAsync");
var FormActions = require("../js/actions/FormActions");
var FormEvents = require("../js/events/FormEvents");
var AppsActions = require("../js/actions/AppsActions");
var AppsEvents = require("../js/events/AppsEvents");
var AppsStore = require("../js/stores/AppsStore");
var AppFormErrorMessages = require("../js/constants/AppFormErrorMessages");
var AppFormStore = require("../js/stores/AppFormStore");
var nock = require("nock");

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

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

      it("preserves unknown properties", function (done) {
        AppFormStore.app = {
          id: "/app-1",
          unknownProperty: "unknown"
        };

        AppFormStore.once(FormEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppFormStore.app.id).to.equal("/app-2");
            expect(AppFormStore.app.unknownProperty).to.equal("unknown");
          }, done);
        });

        FormActions.update("appId", "/app-2");
      });

      it("preserves unknown nested properties", function (done) {
        AppFormStore.app = {
          container: {
            docker: {
              unknownProperty: "unknown"
            }
          }
        };

        AppFormStore.once(FormEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppFormStore.app.container.docker.unknownProperty)
              .to.equal("unknown");
          }, done);
        });

        FormActions.update("appId", "docker-app");
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

      describe("the labels field", function () {

        it("inserts a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.labels.L_KEY_1).to.equal("L_VALUE_1");
            }, done);
          });

          FormActions.insert("labels", {key: "L_KEY_1", value: "L_VALUE_1"});
        });

        it("inserts another key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.labels.L_KEY_1).to.equal("L_VALUE_1");
              expect(AppFormStore.app.labels.L_KEY_2).to.equal("L_VALUE_2");
            }, done);
          });

          FormActions.insert("labels", {key: "L_KEY_2", value: "L_VALUE_2"});
        });

        it("updates a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.labels.L_KEY_1).to.equal("L_VALUE_1A");
            }, done);
          });

          FormActions.update("labels",
            {key: "L_KEY_1", value: "L_VALUE_1A"},
            0
          );
        });

        it("deletes a key-value pair", function (done) {
          AppFormStore.once(FormEvents.CHANGE, function () {
            expectAsync(function () {
              expect(AppFormStore.app.labels)
                .to.not.have.property("L_VALUE_1A");
            }, done);
          });

          FormActions.delete("labels", 0);
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

        describe("the force pull image field", function () {
          it("updates correctly", function (done) {
            AppFormStore.once(FormEvents.CHANGE, function () {
              expectAsync(function () {
                expect(AppFormStore.fields.dockerForcePullImage).to.equal(true);
              }, done);
            });

            FormActions.update("dockerForcePullImage", true);
          });
        });

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
                expect(row.containerPort).to.equal(9000);
                expect(row.hostPort).to.equal(9001);
                expect(row.servicePort).to.equal(8101);
                expect(row.protocol).to.equal("tcp");
              }, done);
            });

            FormActions.update("dockerPortMappings", {
              containerPort: 9000,
              hostPort: 9001,
              servicePort: 8101,
              protocol: "tcp"
            }, 0);
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
                expect(row.value).to.equal("DOCKER_VALUE_1");
              }, done);
            });

            FormActions.update("dockerParameters", {
              key: "DOCKER_KEY_1A", value: "DOCKER_VALUE_1"
            }, 0);
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

  describe("on server response errors", function () {

    describe("App form store", function () {

      it("processes a 400 error response correctly", function (done) {

        AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
          expectAsync(function () {
            expect(AppFormStore.responseErrors.instances)
              .to.equal("error.expected.jsnumber");
          }, done);
        });

        nock(config.apiURL)
          .post("/v2/apps")
          .reply(400, {
            "details": [{
              "path": "/instances",
              "errors": [
                "error.expected.jsnumber"
              ]
            }]
          });

        AppsActions.createApp({
          instances: "many"
        });
      });

      it("processes a locked deployment error correctly", function (done) {
        var expectedMessage =
          AppFormErrorMessages.getGeneralMessage("appLocked");

        AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
          expectAsync(function () {
            expect(AppFormStore.responseErrors.general)
              .to.equal(expectedMessage);
          }, done);
        });

        nock(config.apiURL)
          .post("/v2/apps")
          .reply(409, {
            deployments: [{"id":"foobar"}],
            message: "App is locked by one or more deployments."
          });

        AppsActions.createApp({
          "howdy": "partner"
        });
      });

      it("processes a field conflict error correctly", function (done) {

        var expectedMessage =
          `${AppFormErrorMessages.getGeneralMessage("errorPrefix")} bad error`;

        AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
          expectAsync(function () {
            expect(AppFormStore.responseErrors.general)
              .to.equal(expectedMessage);
          }, done);
        });

        nock(config.apiURL)
          .post("/v2/apps")
          .reply(409, {"message": "bad error"});

        AppsActions.createApp({
          "howdy": "partner"
        });
      });

      it("processes a 422 error response correctly", function (done) {

        AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
          expectAsync(function () {
            expect(AppFormStore.responseErrors.appId)
              .to.equal("error on id attribute");
          }, done);
        });

        nock(config.apiURL)
          .post("/v2/apps")
          .reply(422, {
            "errors": [{
              "attribute": "id",
              "error": "error on id attribute"
            }]
          });

        AppsActions.createApp({
          id: "bad id"
        });
      });

      it("processes error response codes 300 to 499 correctly",
          function (done) {

        AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
          expectAsync(function () {
            expect(AppFormStore.responseErrors.general)
              .to.equal(AppFormErrorMessages.getGeneralMessage("appCreation"));
          }, done);
        });

        nock(config.apiURL)
        .post("/v2/apps")
        .reply(315, "something strange");

        AppsActions.createApp({
          "howdy": "partner"
        });
      });

      it("processes error response codes 401 correctly",
        function (done) {

          AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
            expectAsync(function () {
              expect(AppFormStore.responseErrors.general)
                .to.equal(AppFormErrorMessages.getGeneralMessage("unauthorizedAccess"));
            }, done);
          });

          nock(config.apiURL)
            .post("/v2/apps")
            .reply(401, "something strange");

          AppsActions.createApp({
            "howdy": "partner"
          });
        });

      it("processes error response codes 401 with message correctly",
        function (done) {

          AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
            expectAsync(function () {
              expect(AppFormStore.responseErrors.general)
                .to.equal(AppFormErrorMessages.getGeneralMessage("errorPrefix") + " something strange");
            }, done);
          });

          nock(config.apiURL)
            .post("/v2/apps")
            .reply(401, {"message": "something strange"});

          AppsActions.createApp({
            "howdy": "partner"
          });
        });

      it("processes error response codes 403 correctly",
        function (done) {

          AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
            expectAsync(function () {
              expect(AppFormStore.responseErrors.general)
                .to.equal(AppFormErrorMessages.getGeneralMessage("forbiddenAccess"));
            }, done);
          });

          nock(config.apiURL)
            .post("/v2/apps")
            .reply(403, "something strange");

          AppsActions.createApp({
            "howdy": "partner"
          });
        });

      it("processes error response codes 403 with message correctly",
        function (done) {

          AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
            expectAsync(function () {
              expect(AppFormStore.responseErrors.general)
                .to.equal(AppFormErrorMessages.getGeneralMessage("errorPrefix") + " something strange");
            }, done);
          });

          nock(config.apiURL)
            .post("/v2/apps")
            .reply(403, {"message": "something strange"});

          AppsActions.createApp({
            "howdy": "partner"
          });
        });

      it("processes error response codes >= 500 correctly", function (done) {
        AppsStore.once(AppsEvents.CREATE_APP_ERROR, function () {
          expectAsync(function () {
            expect(AppFormStore.responseErrors.general)
              .to.equal(
                AppFormErrorMessages.getGeneralMessage("unknownServerError")
              );
          }, done);
        });

        nock(config.apiURL)
          .post("/v2/apps")
          .reply(500,  "something strange with the server");

        AppsActions.createApp({
          "howdy": "partner"
        });
      });

      it("has no response errors on success", function (done) {
        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(Object.keys(AppFormStore.responseErrors).length)
              .to.equal(0);
          }, done);
        });

        nock(config.apiURL)
          .post("/v2/apps")
          .reply(200, {"id": "/app-1"});

        AppsActions.createApp({
          "id": "/app-1"
        });
      });

    });

  });

});

describe("App Form Error Messages", function () {

  describe("#getFieldMessage", function () {
    it("returns correct message on given fieldId and index", function () {
      expect(AppFormErrorMessages.getFieldMessage("containerVolumes", 2))
        .to.be.equal("Mode must not be empty");
    });
  });

  describe("#getGeneralMessage", function () {
    it("returns correct message on given key", function () {
      expect(AppFormErrorMessages.getGeneralMessage("unknownServerError"))
        .to.be.equal("Unknown server error, could not create or apply app.");
    });
  });

  describe("#lookupServerResponseMessage", function () {
    it("returns correct message on given server message", function () {
      expect(
        AppFormErrorMessages.lookupServerResponseMessage("error.path.missing")
      )
        .to.be.equal("Please provide a path");
    });
  });

});
