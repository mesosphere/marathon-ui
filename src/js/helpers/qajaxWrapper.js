var qajax = require("qajax");

var qajaxWrapper = function (options) {
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
          callback(response);
        }
      },
      // the promise is only rejected if the server has failed
      // to reply to the client (network problem or timeout reached).
      function (xhr) {
        parseResponse(xhr);
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
        callback(response);
      });
    return promise;
  };

  return api;
};

module.exports = qajaxWrapper;
