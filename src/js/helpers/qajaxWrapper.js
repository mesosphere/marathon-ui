var qajax = require("qajax");

var uniqueCalls = [];

function removeCall(options) {
  uniqueCalls.splice(uniqueCalls.indexOf(options.url), 1);
}

var qajaxWrapper = function (options) {
  if (!options.concurrent) {
    if (uniqueCalls.indexOf(options.url) > -1) {
      return {
        error: () => { return this; },
        success: function () { return this; }
      };
    }
    uniqueCalls.push(options.url);
  }

  var response = {
    status: null,
    body: null
  };

  var parseResponse = function (xhr) {
    response.status = xhr.status;
    try {
      response.body = JSON.parse(xhr.responseText);
    } catch (e) {
      response.body = xhr.responseText;
    }
  };

  var api = qajax(options);
  api.error = function (callback) {
    var promise = this;
    // Bind callback also for non 200 status
    promise.then(
      // not a 2* response
      function (xhr) {
        if (xhr.status.toString()[0] !== "2") {
          parseResponse(xhr);
          removeCall(options);
          callback(response);
        }
      },
      // the promise is only rejected if the server has failed
      // to reply to the client (network problem or timeout reached).
      function (xhr) {
        parseResponse(xhr);
        removeCall(options);
        callback(response);
      }
    );
    return promise;
  };

  api.success = function (callback) {
    var promise = this;
    promise
      .then(qajax.filterStatus(function (status) {
        return status.toString()[0] === "2";
      }))
      .then(function (xhr) {
        parseResponse(xhr);
        removeCall(options);
        callback(response);
      });
    return promise;
  };

  return api;
};

module.exports = qajaxWrapper;
