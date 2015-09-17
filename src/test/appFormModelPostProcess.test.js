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

  });

});
