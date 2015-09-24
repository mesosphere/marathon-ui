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

    it("empty container values to empty object", function () {
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

      expect(app).to.deep.equal({container: {}});
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

    it("removes Docker port mappings on selected host networking", function () {
      var app = {
        container: {
          volumes: [],
          docker: {
            image: "group/image",
            network: "HOST",
            portMappings: [{
              containerPort: 55,
              hostPort: 56,
              protocol: "tcp",
              servicePort: 57
            }],
            parameters: []
          }
        }
      };

      AppFormModelPostProcess.container(app);

      expect(app).to.deep.equal({
        container: {
          volumes: [],
          docker: {
            image: "group/image",
            network: "HOST",
            portMappings: [],
            parameters: []
          }
        }
      });
    });

    it("does not remove Docker port mappings on bridged networking",
        function () {
      var app = {
        container: {
          volumes: [],
          docker: {
            image: "group/image",
            network: "BRIDGE",
            portMappings: [{
              containerPort: 55,
              hostPort: 56,
              protocol: "tcp",
              servicePort: 57
            }],
            parameters: []
          }
        }
      };

      AppFormModelPostProcess.container(app);

      expect(app).to.deep.equal({
        container: {
          volumes: [],
          docker: {
            image: "group/image",
            network: "BRIDGE",
            portMappings: [{
              containerPort: 55,
              hostPort: 56,
              protocol: "tcp",
              servicePort: 57
            }],
            parameters: []
          }
        }
      });
    });

    it("sets an empty space on the cmd field if cmd is empty and container set",
        function () {
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

      expect(app.cmd).to.equal(" ");
    });

  });

  describe("health checks", function () {

    it("is empty on spefific object", function () {
      var app = {healthChecks: [{
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
      var app = {healthChecks: [{
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

  });

});
