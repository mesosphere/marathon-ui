var expect = require("chai").expect;

var AppFormModelPostProcess =
  require("../js/stores/transforms/AppFormModelPostProcess");

describe("App Form Model Post Process", function () {

  it("empty accepted resource roles defaults to '*'", function () {
    var app = {
      acceptedResourceRoles: []
    };

    AppFormModelPostProcess.acceptedResourceRoles(app);

    expect(app).to.deep.equal({acceptedResourceRoles: ["*"]});
  });

  describe("container", function () {

    it("empty container values to null", function () {
      var app = {
        container: {
          type: "DOCKER",
          volumes: [],
          docker: {
            portMappings: [],
            parameters: []
          }
        }
      };

      AppFormModelPostProcess.container(app);

      expect(app.container).to.equal(null);
    });

    it("doesn't touch non-empty containers", function () {
      var app = {
        container: {
          volumes: [],
          docker: {
            image: "group/image",
            portMappings: [],
            parameters: []
          }
        }
      };

      AppFormModelPostProcess.container(app);

      expect(app).to.deep.equal(app);
    });

    it("overrides blank cmd with null when a container is set", function () {
      var app = {
        cmd: "",
        container: {
          volumes: [],
          docker: {
            image: "group/image",
            portMappings: [],
            parameters: []
          }
        }
      };

      AppFormModelPostProcess.container(app);

      expect(app.cmd).to.equal(null);
    });

  });

  describe("health checks", function () {

    it("is empty on spefific object", function () {
      var app = {
        healthChecks: [{
          "path": null,
          "protocol": "HTTP",
          "portIndex": 0,
          "gracePeriodSeconds": 300,
          "intervalSeconds": 60,
          "timeoutSeconds": 20,
          "maxConsecutiveFailures": 3,
          "ignoreHttp1xx": false
        }]
      };

      AppFormModelPostProcess.healthChecks(app);

      expect(app.healthChecks).to.deep.equal([]);
    });

    it("is untouched on given path", function () {
      var app = {
        healthChecks: [{
          "path": "/",
          "protocol": "HTTP",
          "portIndex": 0,
          "gracePeriodSeconds": 300,
          "intervalSeconds": 60,
          "timeoutSeconds": 20,
          "maxConsecutiveFailures": 3,
          "ignoreHttp1xx": false
        }]
      };

      AppFormModelPostProcess.healthChecks(app);

      expect(app.healthChecks).to.deep.equal(app.healthChecks);
    });

    describe("only contains the specified port field", function () {
      it("Port Number", function () {
        var healthCheckWithPortNumber = {
          healthChecks: [{
            "path": "/",
            "protocol": "HTTP",
            "portIndex": 0,
            "port": 8080,
            "portType": "PORT_NUMBER",
            "gracePeriodSeconds": 300,
            "intervalSeconds": 60,
            "timeoutSeconds": 20,
            "maxConsecutiveFailures": 3,
            "ignoreHttp1xx": false
          }]
        };

        var expectedObjectWithoutPortIndex = {
          "path": "/",
          "protocol": "HTTP",
          "port": 8080,
          "gracePeriodSeconds": 300,
          "intervalSeconds": 60,
          "timeoutSeconds": 20,
          "maxConsecutiveFailures": 3,
          "ignoreHttp1xx": false
        };

        AppFormModelPostProcess.healthChecks(healthCheckWithPortNumber);

        expect(healthCheckWithPortNumber.healthChecks[0])
          .to.deep.equal(expectedObjectWithoutPortIndex);
      });

      it("Port Index", function () {
        var healthCheckWithPortIndex = {
          healthChecks: [{
            "path": "/",
            "protocol": "HTTP",
            "portIndex": 1,
            "port": 8080,
            "portType": "PORT_INDEX",
            "gracePeriodSeconds": 300,
            "intervalSeconds": 60,
            "timeoutSeconds": 20,
            "maxConsecutiveFailures": 3,
            "ignoreHttp1xx": false
          }]
        };

        var expectedObjectWithoutPortNumber = {
          "path": "/",
          "protocol": "HTTP",
          "portIndex": 1,
          "gracePeriodSeconds": 300,
          "intervalSeconds": 60,
          "timeoutSeconds": 20,
          "maxConsecutiveFailures": 3,
          "ignoreHttp1xx": false
        };

        AppFormModelPostProcess.healthChecks(healthCheckWithPortIndex);

        expect(healthCheckWithPortIndex.healthChecks[0])
          .to.deep.equal(expectedObjectWithoutPortNumber);
      });

    });



  });

});
