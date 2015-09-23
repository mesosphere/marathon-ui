var expect = require("chai").expect;

var AppFormModelPostProcess =
  require("../js/stores/transforms/AppFormModelPostProcess");

describe("App Form Model Post Process", function () {

  describe("processes", function () {

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

  });

});
