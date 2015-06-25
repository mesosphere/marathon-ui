var qajax = require("qajax");

var qajaxWrapper = function (options) {
  // Translate Oboe options to qajax equivalent
  var oboeDictionary = {
    "body": "data"
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

  var api = qajax(options);

  api.error = function (callback) {
    var promise = this;
    // Bind callback also for non 200 status
    promise.then(
      // not a 2* response
      function (response) {
        if (response.status.toString().match(/^[^2]/)) {
          callback(JSON.parse(response.responseText));
        }
      },
      // the promise is only rejected if the server has failed
      // to reply to the client (network problem or timeout reached).
      function (response) {
        callback(JSON.parse(response.responseText));
      }
    );
    return promise;
  };

  api.success = function (callback) {
    var promise = this;
    promise
      .then(qajax.filterStatus(function (status) {
        return status.toString().match(/^2/);
      }))
      .then(function (response) {
        callback(JSON.parse(response.responseText));
      });
    return promise;
  };

  return api;
};

module.exports = qajaxWrapper;
