var oboe = require("oboe");

var oboeWrapper = function (req) {
  var response = {
    status: null,
    body: null
  };

  var parseResponse = function (xhr) {
    response.status = xhr.statusCode;
    try {
      response.body = JSON.parse(xhr.body);
    } catch (e) {
      response.body = xhr.body;
    }
  };

  var api = oboe(req)
    .start(function (status) {
      this.status = status;
    });

  api.success = function (callback) {
    this.done(function (json) {
      if (!this.status.toString().match(/^2[0-9][0-9]$/)) {
        return;
      } else {
        response.status = this.status;
        response.body = json;
        callback(response);
      }
    });
    return this;
  };

  api.error = function (callback) {
    // Non 200 statuses
    this.done(function (error) {
      if (this.status.toString().match(/^[^2]/)) {
        parseResponse(error);
        callback(response);
      }
      return this;
    });
    this.fail(function (error) {
      if (error.thrown) {
        throw error.thrown;
      }
      parseResponse(error);
      callback(response);
      return this;
    });
  };

  return api;
};

module.exports = oboeWrapper;
