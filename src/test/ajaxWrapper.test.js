var expect = require("chai").expect;
var ajaxWrapper = require("../js/helpers/ajaxWrapper");
var config = require("../js/config/config");

var expectAsync = require("./helpers/expectAsync");
var nock = require("nock");

var server = config.localTestserverURI;
config.apiURL = `http://${server.address}:${server.port}/`;

describe("ajaxWrapper", function () {

  describe("on GET request", function () {

    it("returns a JSON object on success", function (done) {
      nock(config.apiURL)
        .get("/")
        .reply(200, {"name": "Marathon"});

      ajaxWrapper({
        method: "GET",
        url: config.apiURL
      })
        .success(function (response) {
          expectAsync(function () {
            expect(response.body.name).to.equal("Marathon");
          }, done);
        });
    });

    it("defaults to GET when no method is supplied", function (done) {
      nock(config.apiURL)
        .get("/")
        .reply(200, {"name": "Marathon"});

      ajaxWrapper({
        url: config.apiURL
      })
        .success(function (response) {
          expectAsync(function () {
            expect(response.body.name).to.equal("Marathon");
          }, done);
        });
    });

    it("handles failure gracefully", function (done) {
      nock(config.apiURL)
        .get("/foo/bar")
        .reply(404, {"message": "Guru Meditation"});

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "foo/bar"
      })
        .success(() => {
          done(new Error("Success should not be called on 404"));
        })
        .error(function (error) {
          expectAsync(function () {
            expect(error.body.message).to.equal("Guru Meditation");
          }, done);
        });
    });

  });

  describe("on concurrent request", function () {

    it("should timeout on second request", function (done) {
      var responses = 0;
      var timeoutId;
      var initialTimeout = this.timeout();
      this.timeout(50);

      var increaseResponses = function () {
        responses++;
        if (responses === 2) {
          clearTimeout(timeoutId);
          done(new Error("Second request should never be fulfilled"));
        }
      };

      nock(config.apiURL)
        .get("/concurrent")
        .twice()
        .reply(200);

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "concurrent"
      })
      .success(increaseResponses);

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "concurrent"
      })
      .success(increaseResponses);

      timeoutId = setTimeout(() => {
        this.timeout(initialTimeout);
        done();
      }, 25);
    });

    it("should not timeout with flag set", function (done) {
      var responses = 0;

      function increaseResponses() {
        responses++;
        if (responses === 2) {
          done();
        }
      }

      nock(config.apiURL)
        .get("/concurrent")
        .twice()
        .reply(200);

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "concurrent",
        concurrent: true
      })
      .success(increaseResponses);

      ajaxWrapper({
        method: "GET",
        url: config.apiURL + "concurrent",
        concurrent: true
      })
      .success(increaseResponses);
    });

  });

  describe("on POST request", function () {

    it("sends the correct payload", function (done) {
      var payload = {"key": "value"};

      nock(config.apiURL)
        .post("/")
        .reply(200, function (uri, requestBody) {
          return {
            method: "POST",
            payload: requestBody
          };
        });

      ajaxWrapper({
        method: "POST",
        url: config.apiURL,
        data: payload
      })
        .success(function (response) {
          expectAsync(function (done) {
            expect(response.body.method).to.equal("POST");
            expect(response.body.payload).to.equal(JSON.stringify(payload));
          }, done);
        });
    });

    it("handles failure gracefully", function (done) {
      var payload = {"key": "value"};

      nock(config.apiURL)
        .post("/foo/bar")
        .reply(404, {message: "Guru Meditation"});

      ajaxWrapper({
        method: "POST",
        url: config.apiURL + "foo/bar",
        data: payload
      })
        .error(function (error) {
          expectAsync(function () {
            expect(error.body.message).to.equal("Guru Meditation");
          }, done);
        });
    });

  });

  describe("on PUT request", function () {

    it("sends the correct payload with a PUT", function (done) {

      var payload = {"key": "value"};

      nock(config.apiURL)
        .put("/")
        .reply(200, function (uri, requestBody) {
          return {
            method: "PUT",
            payload: requestBody
          };
        });

      ajaxWrapper({
        method: "PUT",
        url: config.apiURL,
        data: payload
      })
        .success(response => {
          expectAsync(() => {
            expect(response.body.method).to.equal("PUT");
            expect(response.body.payload).to.equal(JSON.stringify(payload));
          }, done);
        });
    });

  });

  describe("on DELETE request", function () {

    it("returns the right response for a DELETE", function (done) {

      nock(config.apiURL)
        .delete("/foo/bar")
        .reply(200, function (uri, requestBody) {
          return {
            method: "DELETE",
            payload: requestBody
          };
        });

      ajaxWrapper({
        method: "DELETE",
        url: config.apiURL + "foo/bar",
        data: null
      })
        .success(response => {
          expectAsync(() => {
            expect(response.body.method).to.equal("DELETE");
            expect(response.body.payload).to.be.empty;
          }, done);
        });
    });
  })

});
