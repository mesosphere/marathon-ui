import {expect} from "chai";

import AppConfigTransforms from
  "../../js/stores/transforms/AppConfigTransforms";

describe("App config transforms", function () {
  describe("diff", function () {

    it("returns added fields", function () {
      var result = AppConfigTransforms.diff(
        {"id": "/app-id"},
        {"id": "/app-id", "cmd": "sleep 1000"}
      );
      expect(result).to.deep.equal({
        "cmd": "sleep 1000"
      });
    });

    it("returns updated fields", function () {
      var result = AppConfigTransforms.diff(
        {"id": "/app-id", "cmd": "sleep 100"},
        {"id": "/app-id", "cmd": "sleep 1000"}
      );
      expect(result).to.deep.equal({
        "cmd": "sleep 1000"
      });
    });

    it("drops any illegal fields", function () {
      var result = AppConfigTransforms.diff(
        {"id": "/app-id", "foo": "bar"},
        {"id": "/app-id", "foo": "baz"}
      );
      expect(result).to.deep.equal({});
    });

    it("ignores unchanged nested fields", function () {
      var result = AppConfigTransforms.diff(
        {
          "container": {
            "type": "DOCKER",
            "docker": {"image": "python:3.4"}
          }
        },
        {
          "container": {
            "type": "DOCKER",
            "docker": {"image": "python:3.4"}
          }
        }
      );
      expect(result).to.deep.equal({});
    });

    it("returns changed nested fields", function () {
      var result = AppConfigTransforms.diff(
        {
          "container": {
            "type": "DOCKER",
            "docker": {"image": "python:3.4"}
          }
        },
        {
          "container": {
            "type": "DOCKER",
            "docker": {"image": "python:latest"}
          }
        }
      );
      expect(result).to.deep.equal({
        "container": {
          "type": "DOCKER",
          "docker": {"image": "python:latest"}
        }
      });
    });

    it("handles updates to arrays", function () {
      var result = AppConfigTransforms.diff(
        {"uris": ["http://example.com/foo"]},
        {"uris": ["http://example.com/foo", "http://example.com/bar"]}
      );
      expect(result).to.deep.equal({
        "uris": ["http://example.com/foo", "http://example.com/bar"]
      });
    });

    it("does not send newly added default values", function () {
      var result = AppConfigTransforms.diff(
        {"id": "/app-id"},
        {"id": "/app-id", "uris": []}
      );
      expect(result).to.deep.equal({});
    });

    it("does send updated default values", function () {
      var result = AppConfigTransforms.diff(
        {"id": "/app-id", "uris": ["http://example.com/foo"]},
        {"id": "/app-id", "uris": []}
      );
      expect(result).to.deep.equal({
        "uris": []
      });
    });

    it("strips undefined values", function () {
      var result = AppConfigTransforms.diff(
        {"id": "/app-id"},
        {"id": "/app-id", "uris": undefined}
      );
      expect(result).to.deep.equal({});
    });

  });
});
