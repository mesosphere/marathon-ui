var fetch = require("isomorphic-fetch");
var Util = require("./Util");

var uniqueCalls = [];

function removeCall(options) {
  uniqueCalls.splice(uniqueCalls.indexOf(options.url), 1);
}

var ajaxWrapper = function (opts = {}) {
  var defaults = {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    }
  };
  var options = Util.extendObject(defaults, opts);

  if (!options.concurrent) {
    if (uniqueCalls.indexOf(options.url) > -1) {
      return {
        error: function () { return this; },
        success: function () { return this; }
      };
    }
    uniqueCalls.push(options.url);
  }

  var response = {
    status: null,
    body: null
  };

  var makeRequest = function (options) {
    var fetchOptions = {
      method: options.method,
      headers: options.headers
    };

    if (options.method !== "GET" && options.method !== "HEAD") {
      Object.assign(fetchOptions, {
        body: options.data != null
          ? JSON.stringify(options.data)
          : null
      });
    }

    return fetch(options.url, fetchOptions);
  };

  var parseResponse = function (xhr, callback) {
    response.status = xhr.status;
    xhr.json().then(
      function (body) {
        response.body = body;
      },
      function () {
        xhr.text().then(function (body) {
          response.body = body;
        });
      }
    ).then(function () {
      callback(response);
    });
  };

  var api = makeRequest(options);

  api.error = function (callback) {
    var promise = this;
    // Bind callback also for non 200 status
    promise.then(
      // not a 2* response
      function (xhr) {
        if (xhr.status.toString()[0] !== "2") {
          parseResponse(xhr, function (response) {
            removeCall(options);
            callback(response);
          });
        }
      },
      // the promise is only rejected if the server has failed
      // to reply to the client (network problem or timeout reached).
      function (xhr) {
        parseResponse(xhr, function (response) {
          removeCall(options);
          callback(response);
        });
      }
    );
    return promise;
  };

  api.success = function (callback) {
    var promise = this;
    promise.then(function (xhr) {
      if (xhr.status.toString()[0] === "2") {
        parseResponse(xhr, function (response) {
          removeCall(options);
          callback(response);
        });
      }
    });
    return promise;
  };

  return api;
};

module.exports = ajaxWrapper;
