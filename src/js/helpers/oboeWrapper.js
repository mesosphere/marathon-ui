var oboe = require("oboe");

var oboeWrapper = function (options) {
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

  // Translate to Oboe options
  var oboeDictionary = {
    "data": "body"
  };
  Object.keys(options).forEach((key) => {
    if (oboeDictionary.hasOwnProperty(key)) {
      Object.defineProperty(
        options,
        oboeDictionary[key],
        Object.getOwnPropertyDescriptor(options, key)
      );
      delete options[key];
    }
  });

  var api = oboe(options)
    .start(function (status) {
      this.status = status;
    });

  api.success = function (callback) {
    this.done(function (json) {
      if (this.status.toString()[0] !== "2") {
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
      if (this.status.toString()[0] !== "2") {
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
